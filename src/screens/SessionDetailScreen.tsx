import { useState } from 'react';
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

function totalVolume(session: WorkoutSession): number {
  return session.exercises.reduce((acc, ex) => {
    return acc + ex.completedSets
      .filter((s) => s.completed)
      .reduce((a, s) => a + s.weight * s.reps, 0);
  }, 0);
}

const RPE_LABELS: Record<number, string> = {
  1: 'Muito leve', 2: 'Leve', 3: 'Moderado', 4: 'Um pouco difícil',
  5: 'Difícil', 6: 'Difícil+', 7: 'Muito difícil', 8: 'Muito difícil+',
  9: 'Máximo quase', 10: 'Máximo absoluto',
};

export default function SessionDetailScreen() {
  const navigation = useNavigation<SessionDetailNavProp>();
  const route = useRoute<SessionDetailRoute>();
  const { session } = route.params;

  const [editedSession, setEditedSession] = useState<WorkoutSession>(
    JSON.parse(JSON.stringify(session))
  );
  const [showRPEModal, setShowRPEModal] = useState(false);
  const [tempRPE, setTempRPE] = useState(session.rpe ?? 5);

  const isDirty = JSON.stringify(session) !== JSON.stringify(editedSession);

  function updateEditedSet(exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) {
    const updated = JSON.parse(JSON.stringify(editedSession)) as WorkoutSession;
    updated.exercises[exerciseIndex].completedSets[setIndex][field] = parseFloat(value) || 0;
    setEditedSession(updated);
  }

  function addEditedSet(exerciseIndex: number) {
    const updated = JSON.parse(JSON.stringify(editedSession)) as WorkoutSession;
    const sets = updated.exercises[exerciseIndex].completedSets;
    const last = sets[sets.length - 1];
    sets.push({ setNumber: sets.length + 1, weight: last?.weight ?? 0, reps: last?.reps ?? 0, completed: false });
    setEditedSession(updated);
  }

  function removeEditedSet(exerciseIndex: number, setIndex: number) {
    const updated = JSON.parse(JSON.stringify(editedSession)) as WorkoutSession;
    const sets = updated.exercises[exerciseIndex].completedSets;
    if (sets.length <= 1) return;
    sets.splice(setIndex, 1);
    sets.forEach((s, i) => { s.setNumber = i + 1; });
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

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        {isDirty && (
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Salvar</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.header}>{editedSession.routineName}</Text>
      <Text style={styles.subheader}>
        {formatDate(editedSession.date)} · {formatDuration(editedSession.durationSeconds)} · {totalVolume(editedSession).toLocaleString('pt-BR')} kg volume
      </Text>

      <TouchableOpacity
        style={styles.rpeRow}
        onPress={() => {
          setTempRPE(editedSession.rpe ?? 5);
          setShowRPEModal(true);
        }}
      >
        <Text style={styles.rpeSectionLabel}>RPE</Text>
        <View style={styles.rpeValueRow}>
          <Text style={styles.rpeValueText}>
            {editedSession.rpe ?? '—'}
          </Text>
          <Text style={styles.rpeValueLabel}>
            {editedSession.rpe ? RPE_LABELS[editedSession.rpe] : 'Toque para avaliar'}
          </Text>
        </View>
      </TouchableOpacity>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {editedSession.exercises.map((ex, exerciseIndex) => (
          <View key={ex.exercise.id + exerciseIndex} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{ex.exercise.name}</Text>
              <TouchableOpacity onPress={() => removeEditedExercise(exerciseIndex)}>
                <Text style={styles.removeExerciseButton}>Remover</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.setsHeader}>
              <Text style={styles.setsHeaderText}>Série</Text>
              <Text style={styles.setsHeaderText}>Kg</Text>
              <Text style={styles.setsHeaderText}>Reps</Text>
              <Text style={styles.setsHeaderText}>Volume</Text>
              <View style={{ width: 32 }} />
            </View>

            {ex.completedSets.map((set, setIndex) => (
              <View key={setIndex} style={[styles.setRow, set.completed && styles.setRowCompleted]}>
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
                  {set.completed ? `${set.weight * set.reps} kg` : '—'}
                </Text>
                <TouchableOpacity
                  style={styles.removeSetButton}
                  onPress={() => removeEditedSet(exerciseIndex, setIndex)}
                >
                  <View style={styles.removeSetCircle}>
                    <Text style={styles.removeSetText}>×</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addSetButton} onPress={() => addEditedSet(exerciseIndex)}>
              <Text style={styles.addSetText}>+ Adicionar série</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Deletar treino</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showRPEModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
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
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.screenTop,
    paddingHorizontal: spacing.screenHorizontal,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: { ...typography.label, color: colors.textSubtle },
  saveButton: { ...typography.label, color: colors.primary, fontWeight: '600' },
  header: { ...typography.appTitle, color: colors.text },
  subheader: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.md },
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
  removeSetButton: { width: 32, alignItems: 'center', justifyContent: 'center' },
  removeSetCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeSetText: {
    color: colors.textSubtle,
    fontSize: 14,
    fontWeight: '700',
    includeFontPadding: false,
    textAlignVertical: 'center',
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
});
