import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WorkoutSession } from '../types';
import { getSessions } from '../data/storage';
import { colors, spacing, typography } from '../theme';
import { HistoryStackParamList } from '../navigation/types';

type HistoryNavProp = NativeStackNavigationProp<HistoryStackParamList, 'History'>;

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
    return (
      acc +
      ex.completedSets
        .filter((s) => s.completed)
        .reduce((a, s) => {
          const weightInKg = s.unit === 'lbs' ? s.weight * 0.453592 : s.weight;
          return a + weightInKg * s.reps;
        }, 0)
    );
  }, 0);
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HistoryNavProp>();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useFocusEffect(
    useCallback(() => {
      getSessions().then(setSessions);
    }, [])
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + 120 }]}>
      <Text style={styles.header}>Histórico</Text>
      <Text style={styles.subheader}>Seus treinos feitos</Text>

      <ScrollView 
        style={styles.scroll} 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {sessions.length === 0 && <Text style={styles.empty}>Nenhum treino ainda.</Text>}
        {sessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            style={styles.card}
            onPress={() => navigation.navigate('SessionDetail', { session })}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{session.routineName}</Text>
              <Text style={styles.cardDate}>{formatDate(session.date)}</Text>
            </View>
            <View style={styles.cardStats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{formatDuration(session.durationSeconds)}</Text>
                <Text style={styles.statLabel}>Duração</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{session.exercises.length}</Text>
                <Text style={styles.statLabel}>Exercícios</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {Math.round(totalVolume(session)).toLocaleString('pt-BR')} kg
                </Text>
                <Text style={styles.statLabel}>Volume total</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenHorizontal,
  },
  header: { ...typography.appTitle, color: colors.text },
  subheader: {
    ...typography.small,
    color: colors.textSubtle,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  scroll: { flex: 1 },
  empty: { ...typography.small, color: colors.textSubtle, textAlign: 'center', marginTop: 60 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: { ...typography.label, color: colors.text },
  cardDate: { ...typography.small, color: colors.textSubtle },
  cardStats: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { ...typography.label, color: colors.text },
  statLabel: { ...typography.tiny, color: colors.textSubtle, marginTop: 2 },
});
