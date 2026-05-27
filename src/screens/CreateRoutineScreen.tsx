import { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserRoutine, UserRoutineExercise, RoutineSet, ExerciseTemplate } from '../types';
import { saveUserRoutine, updateUserRoutine } from '../data/storage';
import { EXERCISES, MUSCLE_GROUPS, searchExercises } from '../data/exercises';
import { colors, spacing, typography } from '../theme';
import { HomeStackParamList } from '../navigation/types';

type CreateRoutineRoute = RouteProp<{ CreateRoutine: { editingRoutine?: UserRoutine } }, 'CreateRoutine'>;

const DEFAULT_SET: RoutineSet = { weight: 0, reps: 10, restSeconds: 90 };

export default function CreateRoutineScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<CreateRoutineRoute>();
  const editingRoutine = route.params?.editingRoutine ?? null;

  const [name, setName] = useState(editingRoutine?.name ?? '');
  const [subtitle, setSubtitle] = useState(editingRoutine?.subtitle ?? '');
  const [exercises, setExercises] = useState<UserRoutineExercise[]>(
    editingRoutine?.exercises ?? []
  );
  const [showPicker, setShowPicker] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('Todos');
  const nameInputRef = useRef<TextInput>(null);
  const subtitleInputRef = useRef<TextInput>(null);

  const isEditing = editingRoutine !== null;

  const filtered = searchExercises(query).filter(
    (ex) => selectedMuscle === 'Todos' || ex.muscleGroup === selectedMuscle
  );

  function handlePickExercise(template: ExerciseTemplate) {
    nameInputRef.current?.blur();
    subtitleInputRef.current?.blur();
    Keyboard.dismiss();
    setExercises((prev) => [
      ...prev,
      {
        exerciseTemplateId: template.id,
        name: template.name,
        sets: [{ ...DEFAULT_SET }],
      },
    ]);
    setShowPicker(false);
    setQuery('');
    setSelectedMuscle('Todos');
  }

  function updateSet(exerciseIndex: number, setIndex: number, field: keyof RoutineSet, value: string) {
    setExercises((prev) => {
      const updated = [...prev];
      const sets = [...updated[exerciseIndex].sets];
      sets[setIndex] = { ...sets[setIndex], [field]: parseFloat(value) || 0 };
      updated[exerciseIndex] = { ...updated[exerciseIndex], sets };
      return updated;
    });
  }

  function addSet(exerciseIndex: number) {
    setExercises((prev) => {
      const updated = [...prev];
      const sets = [...updated[exerciseIndex].sets];
      const last = sets[sets.length - 1];
      sets.push({ ...last });
      updated[exerciseIndex] = { ...updated[exerciseIndex], sets };
      return updated;
    });
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setExercises((prev) => {
      const updated = [...prev];
      const sets = [...updated[exerciseIndex].sets];
      if (sets.length <= 1) return prev;
      sets.splice(setIndex, 1);
      updated[exerciseIndex] = { ...updated[exerciseIndex], sets };
      return updated;
    });
  }

  function updateNotes(exerciseIndex: number, value: string) {
    setExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIndex] = { ...updated[exerciseIndex], notes: value };
      return updated;
    });
  }

  function removeExercise(index: number) {
    Alert.alert('Remover exercício?', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => setExercises((prev) => prev.filter((_, i) => i !== index)),
      },
    ]);
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Nome obrigatório', 'Dá um nome pro treino antes de salvar.');
      return;
    }
    if (exercises.length === 0) {
      Alert.alert('Sem exercícios', 'Adiciona pelo menos um exercício.');
      return;
    }

    const autoSubtitle = subtitle.trim() || [...new Set(exercises.map((e) => {
      const template = EXERCISES.find((t) => t.id === e.exerciseTemplateId);
      return template?.muscleGroup ?? '';
    }).filter(Boolean))].slice(0, 3).join(' · ');

    if (isEditing && editingRoutine) {
      const updated: UserRoutine = {
        ...editingRoutine,
        name: name.trim(),
        subtitle: autoSubtitle,
        exercises,
      };
      await updateUserRoutine(updated);
    } else {
      const routine: UserRoutine = {
        id: Date.now().toString(),
        name: name.trim(),
        subtitle: autoSubtitle,
        exercises,
        createdAt: new Date().toISOString(),
      };
      await saveUserRoutine(routine);
    }
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>{isEditing ? 'Editar treino' : 'Novo treino'}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Salvar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Nome do treino</Text>
        <TextInput
          ref={nameInputRef}
          style={styles.input}
          placeholder="ex: Treino A, Push Day..."
          placeholderTextColor={colors.textHint}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Descrição (opcional)</Text>
        <TextInput
          ref={subtitleInputRef}
          style={styles.input}
          placeholder="ex: Peito + Tríceps"
          placeholderTextColor={colors.textHint}
          value={subtitle}
          onChangeText={setSubtitle}
        />

        <Text style={styles.label}>Exercícios</Text>

        {exercises.map((ex, exerciseIndex) => (
          <View key={exerciseIndex} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{ex.name}</Text>
              <TouchableOpacity onPress={() => removeExercise(exerciseIndex)}>
                <Text style={styles.removeButton}>Remover</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.setsHeader}>
              <Text style={styles.setsHeaderText}>Série</Text>
              <Text style={styles.setsHeaderText}>Kg</Text>
              <Text style={styles.setsHeaderText}>Reps</Text>
              <Text style={styles.setsHeaderText}>Descanso</Text>
              <View style={{ width: 32 }} />
            </View>

            {ex.sets.map((set, setIndex) => (
              <View key={setIndex} style={styles.setRow}>
                <Text style={styles.setNumber}>{setIndex + 1}</Text>
                <TextInput
                  style={styles.setInput}
                  value={String(set.weight)}
                  onChangeText={(v) => updateSet(exerciseIndex, setIndex, 'weight', v)}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
                <TextInput
                  style={styles.setInput}
                  value={String(set.reps)}
                  onChangeText={(v) => updateSet(exerciseIndex, setIndex, 'reps', v)}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
                <TextInput
                  style={styles.setInput}
                  value={String(set.restSeconds)}
                  onChangeText={(v) => updateSet(exerciseIndex, setIndex, 'restSeconds', v)}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={styles.removeSetButton}
                  onPress={() => removeSet(exerciseIndex, setIndex)}
                >
                  <Text style={styles.removeSetText}>−</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(exerciseIndex)}>
              <Text style={styles.addSetText}>+ Adicionar série</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.notesInput}
              placeholder="Observações (opcional)"
              placeholderTextColor={colors.textHint}
              value={ex.notes ?? ''}
              onChangeText={(v) => updateNotes(exerciseIndex, v)}
            />
          </View>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Keyboard.dismiss();
            setShowPicker(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Adicionar exercício</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showPicker} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalTopBar}>
            <TouchableOpacity onPress={() => { setShowPicker(false); setQuery(''); setSelectedMuscle('Todos'); }}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Exercícios</Text>
            <View style={{ width: 60 }} />
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar exercício..."
            placeholderTextColor={colors.textHint}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />

          <View style={styles.filterRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterContent}
              keyboardShouldPersistTaps="handled"
            >
              {MUSCLE_GROUPS.map((muscle) => (
                <TouchableOpacity
                  key={muscle}
                  style={[styles.filterChip, selectedMuscle === muscle && styles.filterChipActive]}
                  onPress={() => setSelectedMuscle(muscle)}
                >
                  <Text style={[styles.filterChipText, selectedMuscle === muscle && styles.filterChipTextActive]}>
                    {muscle}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.exerciseRow} onPress={() => handlePickExercise(item)}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseRowName}>{item.name}</Text>
                  <Text style={styles.exerciseMeta}>{item.muscleGroup} · {item.equipment}</Text>
                </View>
                <Text style={styles.exerciseArrow}>+</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<Text style={styles.empty}>Nenhum exercício encontrado.</Text>}
          />
        </KeyboardAvoidingView>
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
    marginBottom: spacing.xxl,
  },
  backButton: { ...typography.label, color: colors.textSubtle, width: 60 },
  screenTitle: { ...typography.label, color: colors.text },
  saveButton: { ...typography.label, color: colors.primary, fontWeight: '600', width: 60, textAlign: 'right' },
  scroll: { flex: 1 },
  label: {
    ...typography.tiny,
    color: colors.textSubtle,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 10,
    padding: spacing.lg,
    fontSize: 15,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  exerciseName: { ...typography.label, color: colors.text, fontWeight: '600', flex: 1, marginRight: spacing.sm },
  removeButton: { ...typography.small, color: colors.danger },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  setsHeaderText: { flex: 1, ...typography.tiny, color: colors.textSubtle, textAlign: 'center' },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: spacing.xs,
  },
  setNumber: { ...typography.small, color: colors.textSubtle, width: 20, textAlign: 'center' },
  setInput: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: 6,
    textAlign: 'center',
    paddingVertical: 6,
    fontSize: 13,
  },
  removeSetButton: { width: 32, alignItems: 'center', justifyContent: 'center' },
  removeSetText: { color: colors.danger, fontSize: 18, fontWeight: '300' },
  addSetButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  addSetText: { ...typography.small, color: colors.primary },
  notesInput: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: 6,
    padding: spacing.sm,
    fontSize: 12,
  },
  addButton: {
    borderWidth: 0.5,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  addButtonText: { ...typography.label, color: colors.primary },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.xl,
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  modalCancel: { ...typography.label, color: colors.textSubtle, width: 60 },
  modalTitle: { ...typography.label, color: colors.text },
  searchInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 10,
    padding: spacing.lg,
    fontSize: 15,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  filterRow: { height: 44, marginBottom: spacing.sm },
  filterContent: { paddingHorizontal: spacing.xl, gap: spacing.sm, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primaryDim, borderColor: colors.primaryBorder },
  filterChipText: { ...typography.small, color: colors.textSubtle },
  filterChipTextActive: { ...typography.small, color: colors.primary, fontWeight: '500' },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  exerciseInfo: { flex: 1 },
  exerciseRowName: { ...typography.body, color: colors.text, fontWeight: '500' },
  exerciseMeta: { ...typography.small, color: colors.textSubtle, marginTop: 2 },
  exerciseArrow: { color: colors.primary, fontSize: 20, fontWeight: '300' },
  separator: { height: 0.5, backgroundColor: colors.border, marginHorizontal: spacing.xl },
  empty: { ...typography.small, color: colors.textSubtle, textAlign: 'center', marginTop: 40 },
});
