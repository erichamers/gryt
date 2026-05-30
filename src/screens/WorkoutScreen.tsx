import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  Alert,
  Vibration,
  AppState,
  Modal,
  Image,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserRoutine, WorkoutExercise, CompletedSet, WorkoutSession } from '../types';
import { EXERCISES } from '../data/exercises';
import {
  saveSession,
  getLastSession,
  saveActiveWorkout,
  clearActiveWorkout,
  getActiveWorkout,
  getUserRoutines,
  updateUserRoutine,
  deleteUserRoutine,
} from '../data/storage';
import { colors, spacing, typography } from '../theme';
import { requestNotificationPermission, scheduleRestNotification, cancelRestNotification } from '../data/notifications';
import Slider from '@react-native-community/slider';
import { HomeStackParamList } from '../navigation/types';
import { SwipeableRow } from '../components/SwipeableRow';

type WorkoutRouteParams = { routine: UserRoutine; deletable: boolean };
type WorkoutRoute = RouteProp<{ Workout: WorkoutRouteParams }, 'Workout'>;

const LBS_TO_KG = 0.453592;

function initWorkout(routine: UserRoutine): WorkoutExercise[] {
  return routine.exercises.map((ex) => ({
    exercise: {
      id: ex.exerciseTemplateId,
      name: ex.name,
      sets: ex.sets.length,
      reps: String(ex.sets[0]?.reps ?? 0),
      weight: ex.sets[0]?.weight ?? 0,
      restSeconds: ex.sets[0]?.restSeconds ?? 90,
      notes: ex.notes,
      unit: 'kg',
    },
    completedSets: ex.sets.map((s, i) => ({
      setNumber: i + 1,
      weight: s.weight,
      reps: s.reps,
      completed: false,
      unit: 'kg' as 'kg' | 'lbs',
    })),
  }));
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
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

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const route = useRoute<WorkoutRoute>();
  const { routine, deletable } = route.params;

  const [started, setStarted] = useState(false);
  const [exercises, setExercises] = useState<WorkoutExercise[]>(initWorkout(routine));
  const [lastSession, setLastSession] = useState<WorkoutSession | null>(null);
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [restTotal, setRestTotal] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [showRPEModal, setShowRPEModal] = useState(false);
  const [selectedRPE, setSelectedRPE] = useState<number>(5);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  const restEndTime = useRef<number | null>(null);
  const startTime = useRef(Date.now());
  const appState = useRef(AppState.currentState);
  const restAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    requestNotificationPermission();
    getLastSession(routine.id).then(setLastSession);
    getActiveWorkout().then((active) => {
      if (active && active.routineId === routine.id) {
        setExercises(active.exercises);
        startTime.current = active.startTime;
        setStarted(true);
      }
    });
  }, [routine.id]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        if (restEndTime.current !== null) {
          const remaining = Math.ceil((restEndTime.current - Date.now()) / 1000);
          if (remaining <= 0) {
            setRestSeconds(null);
            restEndTime.current = null;
          } else {
            setRestSeconds(remaining);
          }
        }
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (started) {
      saveActiveWorkout({
        routineId: routine.id,
        startTime: startTime.current,
        exercises,
      });
    }
  }, [exercises, started]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (started) {
        setElapsedSeconds(Math.floor((Date.now() - startTime.current) / 1000));
      }
      if (restEndTime.current !== null) {
        const remaining = Math.ceil((restEndTime.current - Date.now()) / 1000);
        if (remaining <= 0) {
          Animated.timing(restAnim, {
            toValue: -200,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            setRestSeconds(null);
            restEndTime.current = null;
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Vibration.vibrate([0, 400, 200, 400]);
        } else {
          setRestSeconds(remaining);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [started]);

  function startRest(seconds: number) {
    restEndTime.current = Date.now() + seconds * 1000;
    setRestTotal(seconds);
    setRestSeconds(seconds);
    scheduleRestNotification(seconds);
    restAnim.setValue(-100);
    Animated.spring(restAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }

  function skipRest() {
    Animated.timing(restAnim, {
      toValue: -200,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setRestSeconds(null);
      restEndTime.current = null;
    });
    cancelRestNotification();
  }

  function adjustRest(delta: number) {
    setRestSeconds((prev) => {
      if (prev === null) return null;
      const next = Math.max(0, prev + delta);
      restEndTime.current = Date.now() + next * 1000;
      setRestTotal((t) => Math.max(t, next));
      scheduleRestNotification(next);
      return next;
    });
  }

  async function handleStart() {
    const active = await getActiveWorkout();
    if (active && active.routineId !== routine.id) {
      Alert.alert(
        'Treino em andamento',
        'Você já tem um treino em andamento. O que deseja fazer?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar treino atual',
            onPress: () => navigation.goBack(),
          },
          {
            text: 'Descartar e iniciar novo',
            style: 'destructive',
            onPress: async () => {
              await clearActiveWorkout();
              startTime.current = Date.now();
              setStarted(true);
            },
          },
        ]
      );
      return;
    }
    startTime.current = Date.now();
    setStarted(true);
  }

  function toggleUnit(exerciseIndex: number) {
    setIsDirty(true);
    setExercises((prev) => {
      const updated = [...prev];
      const ex = updated[exerciseIndex];
      const newUnit = ex.exercise.unit === 'kg' ? 'lbs' : 'kg';
      updated[exerciseIndex] = {
        ...ex,
        exercise: { ...ex.exercise, unit: newUnit },
        completedSets: ex.completedSets.map((s) => ({ ...s, unit: newUnit })),
      };
      return updated;
    });
  }

  function updateSet(exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) {
    setIsDirty(true);
    setExercises((prev) => {
      const updated = [...prev];
      const sets = [...updated[exerciseIndex].completedSets];
      const unit = updated[exerciseIndex].exercise.unit ?? 'kg';
      sets[setIndex] = { ...sets[setIndex], [field]: parseFloat(value) || 0, unit };
      updated[exerciseIndex] = { ...updated[exerciseIndex], completedSets: sets };
      return updated;
    });
  }

  function updateRestSeconds(exerciseIndex: number, value: string) {
    setIsDirty(true);
    setExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIndex] = {
        ...updated[exerciseIndex],
        exercise: {
          ...updated[exerciseIndex].exercise,
          restSeconds: parseInt(value) || 0,
        },
      };
      return updated;
    });
  }

  function toggleSet(exerciseIndex: number, setIndex: number) {
    setExercises((prev) => {
      const updated = [...prev];
      const sets = [...updated[exerciseIndex].completedSets];
      const wasCompleted = sets[setIndex].completed;
      sets[setIndex] = { ...sets[setIndex], completed: !wasCompleted };
      updated[exerciseIndex] = { ...updated[exerciseIndex], completedSets: sets };
      if (!wasCompleted) {
        const rest = updated[exerciseIndex].exercise.restSeconds;
        if (rest > 0) startRest(rest);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      return updated;
    });
  }

  function addSet(exerciseIndex: number) {
    setIsDirty(true);
    setExercises((prev) => {
      const updated = [...prev];
      const sets = [...updated[exerciseIndex].completedSets];
      const last = sets[sets.length - 1];
      const unit = updated[exerciseIndex].exercise.unit ?? 'kg';
      sets.push({
        setNumber: sets.length + 1,
        weight: last?.weight ?? 0,
        reps: last?.reps ?? 0,
        completed: false,
        unit,
      });
      updated[exerciseIndex] = { ...updated[exerciseIndex], completedSets: sets };
      return updated;
    });
  }

  function removeSet(exerciseIndex: number, setIndex?: number) {
    setIsDirty(true);
    setExercises((prev) => {
      const updated = [...prev];
      const sets = [...updated[exerciseIndex].completedSets];
      if (sets.length <= 1) return prev;
      if (setIndex !== undefined) {
        sets.splice(setIndex, 1);
        sets.forEach((s, i) => { s.setNumber = i + 1; });
      } else {
        sets.pop();
      }
      updated[exerciseIndex] = { ...updated[exerciseIndex], completedSets: sets };
      return updated;
    });
  }

  function removeExercise(exerciseIndex: number) {
    Alert.alert('Remover exercício?', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          if (!started) setIsDirty(true);
          setExercises((prev) => prev.filter((_, i) => i !== exerciseIndex));
        },
      },
    ]);
  }

  function getLastSets(exerciseId: string): CompletedSet[] | null {
    if (!lastSession) return null;
    const ex = lastSession.exercises.find((e) => e.exercise.id === exerciseId);
    return ex?.completedSets ?? null;
  }

  async function handleSaveRoutine() {
    Alert.alert(
      'Salvar alterações',
      `Tem certeza que deseja alterar o ${routine.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salvar',
          onPress: async () => {
            const userRoutines = await getUserRoutines();
            const existing = userRoutines.find((r) => r.id === routine.id);
            if (!existing) return;
            const updated: UserRoutine = {
              ...existing,
              exercises: exercises.map((ex) => ({
                exerciseTemplateId: ex.exercise.id,
                name: ex.exercise.name,
                sets: ex.completedSets.map((s) => ({
                  weight: s.weight,
                  reps: s.reps,
                  restSeconds: ex.exercise.restSeconds,
                })),
                notes: ex.exercise.notes,
              })),
            };
            await updateUserRoutine(updated);
            setIsDirty(false);
          },
        },
      ]
    );
  }

  function handleDelete() {
    Alert.alert('Deletar treino?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          await deleteUserRoutine(routine.id);
          navigation.goBack();
        },
      },
    ]);
  }

  function handleFinish() {
    Alert.alert('Finalizar treino', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Descartar',
        style: 'destructive',
        onPress: async () => {
          await cancelRestNotification();
          await clearActiveWorkout();
          navigation.goBack();
        },
      },
      {
        text: 'Salvar',
        onPress: () => setShowRPEModal(true),
      },
    ]);
  }

  async function handleSaveWithRPE(rpe: number) {
    const session: WorkoutSession = {
      id: Date.now().toString(),
      routineId: routine.id,
      routineName: routine.name,
      date: new Date().toISOString(),
      exercises,
      durationSeconds: Math.floor((Date.now() - startTime.current) / 1000),
      rpe,
    };
    await saveSession(session);
    await cancelRestNotification();
    await clearActiveWorkout();
    setShowRPEModal(false);
    navigation.goBack();
  }

  const restProgress = restSeconds !== null && restTotal > 0 ? restSeconds / restTotal : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
      {!started && (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
      )}

      <View style={styles.topBar}>
        <Text style={styles.routineTitle} numberOfLines={1}>{routine.name}</Text>
        {started ? (
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>Finalizar</Text>
          </TouchableOpacity>
        ) : isDirty ? (
          <TouchableOpacity style={styles.saveRoutineButtonInline} onPress={handleSaveRoutine}>
            <Text style={styles.saveRoutineButtonInlineText}>Salvar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.startButtonTop} onPress={handleStart}>
            <Text style={styles.startButtonTopText}>Iniciar</Text>
          </TouchableOpacity>
        )}
      </View>

      {started ? (
        <Text style={styles.elapsedTimer}>{formatTime(elapsedSeconds)}</Text>
      ) : (
        <Text style={styles.routineSubtitle}>{routine.subtitle}</Text>
      )}

      <View style={{ flex: 1, overflow: 'hidden', backgroundColor: colors.background }}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {exercises.map((ex, exerciseIndex) => {
            const lastSets = getLastSets(ex.exercise.id);
            const exerciseTemplate = EXERCISES.find((t) => t.id === ex.exercise.id);
            const imageUrl = exerciseTemplate?.imageUrl;
            const unit = ex.exercise.unit ?? 'kg';
            return (
              <View key={ex.exercise.id + exerciseIndex} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  {imageUrl ? (
                    <TouchableOpacity onPress={() => setImageModalUrl(imageUrl)} style={styles.exerciseThumbnail}>
                      <Image source={{ uri: imageUrl }} style={styles.exerciseThumbnailImage} resizeMode="contain" />
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.exerciseThumbnail, styles.exerciseThumbnailPlaceholder]} />
                  )}
                  <Text style={styles.exerciseName}>{ex.exercise.name}</Text>
                  <TouchableOpacity onPress={() => removeExercise(exerciseIndex)}>
                    <Text style={styles.removeExerciseButton}>Remover</Text>
                  </TouchableOpacity>
                </View>

                {ex.exercise.notes && (
                  <Text style={styles.exerciseNotes}>{ex.exercise.notes}</Text>
                )}

                {!started && (
                  <View style={styles.restRow}>
                    <Text style={styles.restRowLabel}>Descanso (seg)</Text>
                    <TextInput
                      style={styles.restRowInput}
                      value={String(ex.exercise.restSeconds)}
                      onChangeText={(v) => updateRestSeconds(exerciseIndex, v)}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                  </View>
                )}

                <View style={styles.setsHeader}>
                  <Text style={styles.setsHeaderText}>Série</Text>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => toggleUnit(exerciseIndex)}>
                    <Text style={[styles.setsHeaderText, styles.unitHeaderButton]}>
                      {unit === 'lbs' ? 'Lbs ▾' : 'Kg ▾'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.setsHeaderText}>Reps</Text>
                  <Text style={styles.setsHeaderText}>Volume</Text>
                </View>

                {ex.completedSets.map((set, setIndex) => {
                  const last = lastSets?.[setIndex];
                  return (
                    <SwipeableRow
                      key={setIndex}
                      onDelete={() => removeSet(exerciseIndex, setIndex)}
                    >
                      <View style={[styles.setRow, set.completed && styles.setRowCompleted]}>
                        <Text style={styles.setNumber}>{set.setNumber}</Text>
                        {started && (
                          <Text style={styles.previousValue}>
                            {last ? `${last.weight}×${last.reps}` : '—'}
                          </Text>
                        )}
                        <TextInput
                          style={styles.input}
                          value={String(set.weight)}
                          onChangeText={(v) => updateSet(exerciseIndex, setIndex, 'weight', v)}
                          keyboardType="numeric"
                          selectTextOnFocus
                        />
                        <TextInput
                          style={styles.input}
                          value={String(set.reps)}
                          onChangeText={(v) => updateSet(exerciseIndex, setIndex, 'reps', v)}
                          keyboardType="numeric"
                          selectTextOnFocus
                        />
                        {started ? (
                          <TouchableOpacity
                            style={styles.checkButton}
                            onPress={() => toggleSet(exerciseIndex, setIndex)}
                          >
                            <Text style={styles.checkButtonText}>
                              {set.completed ? '✓' : '○'}
                            </Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={{ flex: 1 }} />
                        )}
                      </View>
                    </SwipeableRow>
                  );
                })}

                <View style={styles.setActions}>
                  <TouchableOpacity style={styles.setActionButton} onPress={() => addSet(exerciseIndex)}>
                    <Text style={styles.setActionTextGreen}>+ Adicionar série</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {deletable && !started && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Deletar treino</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {restSeconds !== null && (
          <Animated.View style={[styles.restBanner, { transform: [{ translateY: restAnim }] }]}>
            <View style={styles.restBannerContent}>
              <TouchableOpacity style={styles.restAdjustButton} onPress={() => adjustRest(-15)}>
                <Text style={styles.restAdjustText}>−15s</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={skipRest} style={styles.restCenter}>
                <Text style={styles.restLabel}>Descanso</Text>
                <Text style={styles.restTimer}>{formatTime(restSeconds)}</Text>
                <Text style={styles.restSkip}>Toque para pular</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.restAdjustButton} onPress={() => adjustRest(15)}>
                <Text style={styles.restAdjustText}>+15s</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.restProgressBar}>
              <View style={[styles.restProgressFill, { width: `${restProgress * 100}%` }]} />
            </View>
          </Animated.View>
        )}
      </View>

      <Modal visible={!!imageModalUrl} transparent animationType="fade">
        <TouchableOpacity
          style={styles.imageModalOverlay}
          activeOpacity={1}
          onPress={() => setImageModalUrl(null)}
        >
          <View style={styles.imageModalContainer}>
            <Image
              source={{ uri: imageModalUrl! }}
              style={styles.imageModalImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.imageModalCloseButton}
              onPress={() => setImageModalUrl(null)}
            >
              <Text style={styles.imageModalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showRPEModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Como foi o treino?</Text>
            <Text style={styles.modalSubtitle}>Avalie o esforço percebido</Text>

            <Text style={styles.rpeValue}>{selectedRPE}</Text>
            <Text style={styles.rpeLabel}>{RPE_LABELS[selectedRPE]}</Text>

            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={selectedRPE}
              onValueChange={(v) => setSelectedRPE(v)}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />

            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>Leve</Text>
              <Text style={styles.sliderLabelText}>Máximo</Text>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleSaveWithRPE(selectedRPE)}
            >
              <Text style={styles.saveButtonText}>Salvar treino</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => handleSaveWithRPE(5)}
            >
              <Text style={styles.skipButtonText}>Pular</Text>
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
    paddingHorizontal: spacing.screenHorizontal,
  },
  backButton: {
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
    zIndex: 30,
  },
  backButtonText: {
    ...typography.label,
    color: colors.textSubtle,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
    backgroundColor: colors.background,
    zIndex: 30,
  },
  routineTitle: {
    ...typography.appTitle,
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  elapsedTimer: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.lg,
    backgroundColor: colors.background,
    zIndex: 30,
  },
  routineSubtitle: {
    ...typography.small,
    color: colors.textSubtle,
    marginTop: 2,
    marginBottom: spacing.xxl,
  },
  finishButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  finishButtonText: { ...typography.small, color: '#000', fontWeight: '600' },
  startButtonTop: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  startButtonTopText: { ...typography.small, color: '#000', fontWeight: '600' },
  restBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: colors.primaryDim,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.primaryBorder,
  },
  restBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  restAdjustButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  restAdjustText: { ...typography.label, color: colors.primary, fontWeight: '600' },
  restCenter: { alignItems: 'center', flex: 1 },
  restLabel: { ...typography.small, color: colors.primary, fontWeight: '500' },
  restTimer: { fontSize: 28, fontWeight: '700', color: colors.text, letterSpacing: -1 },
  restSkip: { ...typography.tiny, color: colors.textSubtle, marginTop: 2 },
  restProgressBar: { height: 3, backgroundColor: colors.border, borderRadius: 2 },
  restProgressFill: { height: 3, backgroundColor: colors.primary, borderRadius: 2 },
  scroll: { flex: 1 },
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
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  exerciseThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    overflow: 'hidden',
    flexShrink: 0,
  },
  exerciseThumbnailImage: {
    width: 44,
    height: 44,
  },
  exerciseThumbnailPlaceholder: {
    backgroundColor: colors.surfaceAlt,
  },
  exerciseName: { ...typography.label, color: colors.text, fontWeight: '600', flex: 1 },
  removeExerciseButton: { ...typography.small, color: colors.danger, flexShrink: 0 },
  exerciseNotes: { ...typography.tiny, color: colors.textSubtle, marginBottom: spacing.sm, fontStyle: 'italic' },
  restRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  restRowLabel: { ...typography.small, color: colors.textSubtle },
  restRowInput: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: 6,
    width: 70,
    textAlign: 'center',
    paddingVertical: 6,
    fontSize: 16,
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  setsHeaderText: { 
    ...typography.tiny, 
    color: colors.textSubtle, 
    flex: 1, 
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
  },
  setRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    marginBottom: spacing.xs,
    backgroundColor: colors.primaryDim,
  },
  setRowCompleted: { backgroundColor: colors.primaryDim },
  setNumber: { ...typography.small, color: colors.textSubtle, flex: 1, textAlign: 'center' },
  previousValue: { ...typography.small, color: colors.textSubtle, flex: 1.5, textAlign: 'center' },
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
  checkButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  checkButtonText: { fontSize: 22, color: colors.primary },
  setActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  setActionButton: { paddingVertical: 6, paddingHorizontal: spacing.xs },
  setActionTextGreen: { ...typography.small, color: colors.primary },
  saveRoutineButtonInline: {
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.primaryBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  saveRoutineButtonInlineText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
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
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  imageModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  imageModalImage: {
    width: 280,
    height: 280,
  },
  imageModalCloseButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  imageModalCloseText: { ...typography.label, color: colors.text },
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
  rpeValue: {
    fontSize: 64,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: -2,
  },
  rpeLabel: {
    ...typography.small,
    color: colors.textSubtle,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  sliderLabelText: {
    ...typography.tiny,
    color: colors.textSubtle,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  saveButtonText: { ...typography.label, color: '#000', fontWeight: '700' },
  skipButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  skipButtonText: { ...typography.small, color: colors.textSubtle },
});