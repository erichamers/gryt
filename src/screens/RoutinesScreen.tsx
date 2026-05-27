import { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import { useFocusEffect, useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { UserRoutine, WorkoutSession } from '../types';
import { getActiveWorkout, getSessions, getWorkloadMetrics, getUserRoutines, WorkloadMetrics } from '../data/storage';
import { ROUTINES } from '../data/routines';
import { colors, spacing, typography } from '../theme';
import { userRoutineToRoutine } from '../utils/routines';
import { HomeStackParamList } from '../navigation/types';
import { RootTabParamList } from '../navigation/types';

type RoutinesNavProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Routines'>,
  BottomTabNavigationProp<RootTabParamList>
>;

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
  return `${m}min`;
}

function totalVolume(session: WorkoutSession): number {
  return session.exercises.reduce((acc, ex) => {
    return acc + ex.completedSets
      .filter((s) => s.completed)
      .reduce((a, s) => a + s.weight * s.reps, 0);
  }, 0);
}

function getRatioStatus(ratio: number): { label: string; color: string } {
  if (ratio === 0) return { label: '—', color: colors.textSubtle };
  if (ratio < 0.8) return { label: 'Destreino', color: colors.textSubtle };
  if (ratio <= 1.3) return { label: 'Ótimo', color: colors.primary };
  return { label: 'Risco', color: colors.danger };
}

export default function RoutinesScreen() {
  const navigation = useNavigation<RoutinesNavProp>();
  const [activeRoutineId, setActiveRoutineId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [metrics, setMetrics] = useState<WorkloadMetrics | null>(null);
  const [userRoutines, setUserRoutines] = useState<UserRoutine[]>([]);

  useFocusEffect(
    useCallback(() => {
      getUserRoutines().then(setUserRoutines);
      getActiveWorkout().then((workout) => {
        setActiveRoutineId(workout ? workout.routineId : null);
      });
      getSessions().then(setSessions);
      getWorkloadMetrics().then(setMetrics);
    }, [])
  );

  const allRoutines = [...ROUTINES, ...userRoutines.map(userRoutineToRoutine)];
  const ratioStatus = metrics ? getRatioStatus(metrics.ratio) : null;

  async function handleResumeWorkout() {
    const active = await getActiveWorkout();
    if (!active) return;
    const hardcoded = ROUTINES.find((r) => r.id === active.routineId);
    if (hardcoded) {
      navigation.navigate('Workout', { routine: hardcoded, deletable: false });
      return;
    }
    const user = userRoutines.find((r) => r.id === active.routineId);
    if (user) {
      navigation.navigate('Workout', { routine: userRoutineToRoutine(user), deletable: true });
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions.slice(0, 10)}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <View>
                <Text style={styles.logo}>GRYT</Text>
                <Text style={styles.tagline}>Treine com propósito</Text>
              </View>
            </View>

            {metrics && (
              <View style={styles.metricsCard}>
                <Text style={styles.metricsTitle}>Carga de treino</Text>
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{metrics.acuteLoad}</Text>
                    <Text style={styles.metricLabel}>Carga aguda</Text>
                    <Text style={styles.metricSub}>7 dias</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{metrics.chronicLoad}</Text>
                    <Text style={styles.metricLabel}>Carga crônica</Text>
                    <Text style={styles.metricSub}>28 dias</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: ratioStatus?.color }]}>
                      {metrics.ratio > 0 ? metrics.ratio.toFixed(2) : '—'}
                    </Text>
                    <Text style={styles.metricLabel}>Razão</Text>
                    <Text style={[styles.metricSub, { color: ratioStatus?.color }]}>
                      {ratioStatus?.label}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {activeRoutineId && (
              <TouchableOpacity style={styles.resumeBanner} onPress={handleResumeWorkout}>
                <View>
                  <Text style={styles.resumeTitle}>Treino em andamento</Text>
                  <Text style={styles.resumeSubtitle}>
                    {allRoutines.find((r) => r.id === activeRoutineId)?.name} · Toque para retomar
                  </Text>
                </View>
                <Text style={styles.resumeArrow}>→</Text>
              </TouchableOpacity>
            )}

            {sessions.length > 0 && (
              <Text style={styles.sectionTitle}>Atividade recente</Text>
            )}

            {sessions.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Nenhum treino ainda</Text>
                <Text style={styles.emptySubtitle}>Vá para Treinos e inicie sua primeira sessão</Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.sessionCard}
            onPress={() =>
              navigation.navigate('HistoryTab', {
                screen: 'SessionDetail',
                params: { session: item },
              })
            }
          >
            <View style={styles.sessionTop}>
              <Text style={styles.sessionName}>{item.routineName}</Text>
              <Text style={styles.sessionDate}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.sessionStats}>
              <Text style={styles.sessionStat}>{formatDuration(item.durationSeconds)}</Text>
              <Text style={styles.sessionStatDot}>·</Text>
              <Text style={styles.sessionStat}>{totalVolume(item).toLocaleString('pt-BR')} kg</Text>
              <Text style={styles.sessionStatDot}>·</Text>
              <Text style={styles.sessionStat}>{item.exercises.length} exercícios</Text>
              {item.rpe && (
                <>
                  <Text style={styles.sessionStatDot}>·</Text>
                  <Text style={styles.sessionStat}>RPE {item.rpe}</Text>
                </>
              )}
            </View>
            <View style={styles.sessionExercises}>
              {item.exercises.slice(0, 3).map((ex, i) => (
                <Text key={i} style={styles.sessionExercise}>
                  {ex.completedSets.filter(s => s.completed).length} séries {ex.exercise.name}
                </Text>
              ))}
              {item.exercises.length > 3 && (
                <Text style={styles.sessionMore}>
                  + {item.exercises.length - 3} exercícios
                </Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={<View style={{ height: 40 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing.screenTop,
    paddingHorizontal: spacing.screenHorizontal,
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 4,
  },
  tagline: {
    ...typography.small,
    color: colors.textSubtle,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  metricsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginHorizontal: spacing.screenHorizontal,
    marginBottom: spacing.xl,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  metricsTitle: {
    ...typography.tiny,
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: { flex: 1, alignItems: 'center' },
  metricDivider: { width: 0.5, backgroundColor: colors.border },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  metricLabel: {
    ...typography.tiny,
    color: colors.textSubtle,
    marginTop: 2,
    textAlign: 'center',
  },
  metricSub: {
    ...typography.tiny,
    color: colors.textSubtle,
    marginTop: 1,
  },
  resumeBanner: {
    backgroundColor: colors.primaryDim,
    borderRadius: 12,
    padding: spacing.lg,
    marginHorizontal: spacing.screenHorizontal,
    marginBottom: spacing.lg,
    borderWidth: 0.5,
    borderColor: colors.primaryBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resumeTitle: { ...typography.small, color: colors.primary, fontWeight: '600', marginBottom: spacing.xs },
  resumeSubtitle: { ...typography.small, color: colors.textSubtle },
  resumeArrow: { color: colors.primary, fontSize: 18 },
  sectionTitle: {
    ...typography.tiny,
    color: colors.textSubtle,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
    marginHorizontal: spacing.screenHorizontal,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: { ...typography.label, color: colors.textMuted, marginBottom: spacing.xs },
  emptySubtitle: { ...typography.small, color: colors.textSubtle },
  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginHorizontal: spacing.screenHorizontal,
    marginBottom: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  sessionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sessionName: { ...typography.label, color: colors.text, fontWeight: '600' },
  sessionDate: { ...typography.tiny, color: colors.textSubtle },
  sessionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  sessionStat: { ...typography.small, color: colors.textMuted },
  sessionStatDot: { ...typography.small, color: colors.textSubtle },
  sessionExercises: { gap: 4 },
  sessionExercise: { ...typography.small, color: colors.textSubtle },
  sessionMore: { ...typography.small, color: colors.textSubtle, fontStyle: 'italic', marginTop: 2 },
});
