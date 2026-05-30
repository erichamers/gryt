import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WorkoutSession } from '../types';
import { deleteSession, updateSession } from '../data/storage';
import { colors, spacing, typography } from '../theme';
import { HistoryStackParamList } from '../navigation/types';
import { SwipeableRow } from '../components/SwipeableRow';
import { EXERCISES } from '../data/exercises';

type SessionDetailNavProp = NativeStackNavigationProp<HistoryStackParamList, 'SessionDetail'>;
type SessionDetailRoute = RouteProp<HistoryStackParamList, 'SessionDetail'>;

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function totalVolume(session: WorkoutSession, units: Record<number, 'kg' | 'lbs'>): number {
  return Math.round(
    session.exercises.reduce((acc, ex, exerciseIndex) => {
      const unit = units[exerciseIndex] ?? ex.completedSets[0]?.unit ?? 'kg';
      return (
        acc +
        ex.completedSets
          .filter((s) => s.completed)
          .reduce((a, s) => {
            const weightInKg = unit === 'lbs' ? s.weight * 0.453592 : s.weight;
            return a + weightInKg * s.reps;
          }, 0)
      );
    }, 0)
  );
}

const RPE_LABELS: Record<number, string> = {
  1: 'Muito leve',
  2: 'Leve',
  3: 'Moderado',
  4: 'Um pouco difícil',
  5: 'Difícil',
  6: 'Difícil+',
  7: 'Muito difícil',
  8: 'Muito difícil+',
  9: 'Máximo quase',
  10: 'Máximo absoluto',
};

function seriesByMuscleGroup(session: WorkoutSession): Record<string, number> {
  const result: Record<string, number> = {};
  for (const ex of session.exercises) {
    const template = EXERCISES.find((t) => t.id === ex.exercise.id);
    const group = template?.muscleGroup ?? 'Outro';
    const completedSets = ex.completedSets.filter((s) => s.completed).length;
    if (completedSets > 0) {
      result[group] = (result[group] ?? 0) + completedSets;
    }
  }
  return result;
}

export default function SessionDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SessionDetailNavProp>();
  const route = useRoute<SessionDetailRoute>();
  const { session } = route.params;

  const [editedSession, setEditedSession] = useState<WorkoutSession>(
    JSON.parse(JSON.stringify(session))
  );
  const [showRPEModal, setShowRPEModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [tempMinutes, setTempMinutes] = useState(Math.floor(editedSession.durationSeconds / 60));
  const [tempSeconds, setTempSeconds] = useState(editedSession.durationSeconds % 60);
  const [tempRPE, setTempRPE] = useState(session.rpe ?? 5);
  const [exerciseUnits, setExerciseUnits] = useState<Record<number, 'kg' | 'lbs'>>({});

  const isDirty = JSON.stringify(session) !== JSON.stringify(editedSession);

  function getUnit(exerciseIndex: number): 'kg' | 'lbs' {
    return (
      exerciseUnits[exerciseIndex] ??
      editedSession.exercises[exerciseIndex]?.completedSets[0]?.unit ??
      'kg'
    );
  }

  function toggleUnit(exerciseIndex: number) {
    const newUnit = getUnit(exerciseIndex) === 'kg' ? 'lbs' : 'kg';
    setExerciseUnits((prev) => ({
      ...prev,
      [exerciseIndex]: newUnit,
    }));
    const updated = JSON.parse(JSON.stringify(editedSession)) as WorkoutSession;
    updated.exercises[exerciseIndex].completedSets = updated.exercises[
      exerciseIndex
    ].completedSets.map((s) => ({ ...s, unit: newUnit }));
    setEditedSession(updated);
  }

  function updateEditedSet(
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps',
    value: string
  ) {
    const updated = JSON.parse(JSON.stringify(editedSession)) as WorkoutSession;
    updated.exercises[exerciseIndex].completedSets[setIndex][field] = parseFloat(value) || 0;
    setEditedSession(updated);
  }

  function addEditedSet(exerciseIndex: number) {
    const updated = JSON.parse(JSON.stringify(editedSession)) as WorkoutSession;
    const sets = updated.exercises[exerciseIndex].completedSets;
    const last = sets[sets.length - 1];
    sets.push({
      setNumber: sets.length + 1,
      weight: last?.weight ?? 0,
      reps: last?.reps ?? 0,
      completed: false,
    });
    setEditedSession(updated);
  }

  function removeEditedSet(exerciseIndex: number, setIndex: number) {
    const updated = JSON.parse(JSON.stringify(editedSession)) as WorkoutSession;
    const sets = updated.exercises[exerciseIndex].completedSets;
    if (sets.length <= 1) return;
    sets.splice(setIndex, 1);
    sets.forEach((s, i) => {
      s.setNumber = i + 1;
    });
    setEditedSession(updated);
  }

  function removeEditedExercise(exerciseIndex: number) {
    Alert.alert('Remover exercício?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          const updated = JSON.parse(JSON.stringify(editedSession)) as WorkoutSession;
          updated.exercises = updated.exercises.filter((_, i) => i !== exerciseIndex);
          setEditedSession(updated);
        },
      },
    ]);
  }

  async function handleSave() {
    await updateSession(editedSession);
    navigation.goBack();
  }

  function handleDelete() {
    Alert.alert('Deletar treino?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          await deleteSession(session.id);
          navigation.goBack();
        },
      },
    ]);
  }

  const muscleGroups = seriesByMuscleGroup(editedSession);
  const muscleGroupEntries = Object.entries(muscleGroups);
  const maxSets =
    muscleGroupEntries.length > 0 ? Math.max(...muscleGroupEntries.map(([, s]) => s)) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.header}>{editedSession.routineName}</Text>
        {isDirty && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsRow}>
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => {
            setTempMinutes(Math.floor(editedSession.durationSeconds / 60));
            setTempSeconds(editedSession.durationSeconds % 60);
            setShowDurationModal(true);
          }}
        >
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {formatDuration(editedSession.durationSeconds)}
          </Text>
          <Text style={styles.statLabel}>Duração</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {totalVolume(editedSession, exerciseUnits).toLocaleString('pt-BR', {
              maximumFractionDigits: 1,
            })}{' '}
            kg
          </Text>
          <Text style={styles.statLabel}>Volume</Text>
        </View>
        <View style={styles.statDivider} />
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => {
            setTempRPE(editedSession.rpe ?? 5);
            setShowRPEModal(true);
          }}
        >
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {editedSession.rpe ?? '—'}
          </Text>
          <Text style={styles.statLabel}>RPE</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {muscleGroupEntries.length > 0 && (
          <View style={styles.muscleGroupSection}>
            <Text style={styles.muscleGroupTitle}>Séries por grupo muscular</Text>
            {muscleGroupEntries.map(([group, sets]) => (
              <View key={group} style={styles.muscleGroupItem}>
                <Text style={styles.muscleGroupLabel}>{group}</Text>
                <View style={styles.muscleGroupBarWrapper}>
                  <View style={[styles.muscleGroupBar, { width: `${(sets / maxSets) * 100}%` }]} />
                </View>
                <Text style={styles.muscleGroupValue}>{sets}</Text>
              </View>
            ))}
          </View>
        )}

        {editedSession.exercises.map((ex, exerciseIndex) => {
          const unit = getUnit(exerciseIndex);
          return (
            <View key={ex.exercise.id + exerciseIndex} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{ex.exercise.name}</Text>
                <TouchableOpacity onPress={() => removeEditedExercise(exerciseIndex)}>
                  <Text style={styles.removeExerciseButton}>Remover</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.setsHeader}>
                <Text style={styles.setsHeaderText}>Série</Text>
                <TouchableOpacity style={[{ flex: 1 }, { marginHorizontal: spacing.xs }]} onPress={() => toggleUnit(exerciseIndex)}>
                  <Text style={[styles.setsHeaderText, styles.unitHeaderButton, { marginHorizontal: 0 }]}>
                    {unit === 'lbs' ? 'Lbs ▾' : 'Kg ▾'}
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.setsHeaderText, { marginHorizontal: spacing.xs }]}>Reps</Text>
                <Text style={styles.setsHeaderText}>Volume</Text>
              </View>

              {ex.completedSets.map((set, setIndex) => (
                <SwipeableRow
                  key={setIndex}
                  onDelete={() => removeEditedSet(exerciseIndex, setIndex)}
                >
                  <View style={[styles.setRow, set.completed && styles.setRowCompleted]}>
                    <Text style={styles.setCell}>{set.setNumber}</Text>
                    <TextInput
                      style={styles.input}
                      value={String(set.weight)}
                      onChangeText={(v) => updateEditedSet(exerciseIndex, setIndex, 'weight', v)}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                    <TextInput
                      style={styles.input}
                      value={String(set.reps)}
                      onChangeText={(v) => updateEditedSet(exerciseIndex, setIndex, 'reps', v)}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                    <Text style={[styles.setCell, set.completed && styles.setCellGreen]}>
                      {set.completed
                        ? `${(unit === 'lbs' ? set.weight * set.reps * 0.453592 : set.weight * set.reps).toFixed(0)} kg`
                        : '—'}
                    </Text>
                  </View>
                </SwipeableRow>
              ))}

              <TouchableOpacity
                style={styles.addSetButton}
                onPress={() => addEditedSet(exerciseIndex)}
              >
                <Text style={styles.addSetText}>+ Adicionar série</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Deletar treino</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showDurationModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDurationModal(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Duração do treino</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Picker
                  selectedValue={tempMinutes}
                  onValueChange={(v) => setTempMinutes(v)}
                  style={{ width: 120, color: colors.text }}
                  itemStyle={{ color: colors.text }}
                >
                  {Array.from({ length: 300 }, (_, i) => (
                    <Picker.Item key={i} label={`${i} min`} value={i} />
                  ))}
                </Picker>
                <Text style={{ color: colors.text, fontSize: 24 }}>:</Text>
                <Picker
                  selectedValue={tempSeconds}
                  onValueChange={(v) => setTempSeconds(v)}
                  style={{ width: 120, color: colors.text }}
                  itemStyle={{ color: colors.text }}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <Picker.Item key={i} label={`${i} seg`} value={i} />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  setEditedSession({
                    ...editedSession,
                    durationSeconds: tempMinutes * 60 + tempSeconds,
                  });
                  setShowDurationModal(false);
                }}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>  

      <Modal visible={showRPEModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRPEModal(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>RPE</Text>
              <Text style={styles.modalSubtitle}>Avalie o esforço percebido</Text>
              <Text style={styles.rpeNumber}>{tempRPE}</Text>
              <Text style={styles.rpeLabelText}>{RPE_LABELS[tempRPE]}</Text>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={tempRPE}
                onValueChange={setTempRPE}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>Leve</Text>
                <Text style={styles.sliderLabelText}>Máximo</Text>
              </View>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  setEditedSession({ ...editedSession, rpe: tempRPE });
                  setShowRPEModal(false);
                }}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenHorizontal,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: { ...typography.label, color: colors.textSubtle },
  saveButton: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.primaryBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  saveButtonText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  header: { ...typography.appTitle, color: colors.text },
  subheader: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  scroll: { flex: 1 },
  rpeRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rpeSectionLabel: {
    ...typography.tiny,
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rpeValueRow: { alignItems: 'flex-end' },
  rpeValueText: { fontSize: 22, fontWeight: '700', color: colors.primary },
  rpeValueLabel: { ...typography.tiny, color: colors.textSubtle, marginTop: 2 },
  muscleGroupSection: {
    marginBottom: spacing.lg,
  },
  muscleGroupTitle: {
    ...typography.tiny,
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  muscleGroupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  muscleGroupLabel: {
    ...typography.tiny,
    color: colors.textSubtle,
    width: 90,
  },
  muscleGroupBarWrapper: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
  },
  muscleGroupBar: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  muscleGroupValue: {
    ...typography.tiny,
    color: colors.textSubtle,
    width: 20,
    textAlign: 'right',
    fontWeight: '600',
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  exerciseName: { ...typography.label, color: colors.text, fontWeight: '600', flex: 1 },
  removeExerciseButton: { ...typography.small, color: colors.danger },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  setsHeaderText: { ...typography.tiny, color: colors.textSubtle, flex: 1, textAlign: 'center' },
  unitHeaderButton: {
    color: colors.primary,
    fontWeight: '600',
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  setRowCompleted: { backgroundColor: colors.primaryDim },
  setCell: { flex: 1, textAlign: 'center', color: colors.textMuted, fontSize: 14 },
  setCellGreen: { color: colors.primary },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: 6,
    textAlign: 'center',
    paddingVertical: 6,
    fontSize: 14,
    marginHorizontal: spacing.xs,
  },
  addSetButton: { paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.xs },
  addSetText: { ...typography.small, color: colors.primary },
  deleteButton: {
    backgroundColor: colors.dangerDim,
    borderWidth: 0.5,
    borderColor: colors.dangerBorder,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  deleteButtonText: { ...typography.label, color: colors.danger },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    paddingBottom: 48,
  },
  modalTitle: { ...typography.title, color: colors.text, marginBottom: spacing.xs },
  modalSubtitle: { ...typography.small, color: colors.textSubtle, marginBottom: spacing.xl },
  rpeNumber: {
    fontSize: 64,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: -2,
  },
  rpeLabelText: {
    ...typography.small,
    color: colors.textSubtle,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  sliderLabelText: { ...typography.tiny, color: colors.textSubtle },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  confirmButtonText: { ...typography.label, color: '#000', fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 0.5,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: -0.5,
  },
  statLabel: {
    ...typography.tiny,
    color: colors.textSubtle,
    marginTop: 2,
    textAlign: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
});
