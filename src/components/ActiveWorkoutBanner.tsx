import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getActiveWorkout, getUserRoutines } from '../data/storage';
import { colors, spacing, typography } from '../theme';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ActiveWorkoutBanner() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [activeRoutineName, setActiveRoutineName] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    checkActive();
    const interval = setInterval(checkActive, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  async function checkActive() {
    const active = await getActiveWorkout();
    if (!active) {
      setActiveRoutineName(null);
      setStartTime(null);
      return;
    }
    setStartTime(active.startTime);
    const routines = await getUserRoutines();
    const routine = routines.find((r) => r.id === active.routineId);
    setActiveRoutineName(routine?.name ?? 'Treino em andamento');
  }

  async function handlePress() {
    const active = await getActiveWorkout();
    if (!active) return;
    const routines = await getUserRoutines();
    const routine = routines.find((r) => r.id === active.routineId);
    if (routine) {
      navigation.navigate('HomeTab', {
        screen: 'Workout',
        params: { routine, deletable: true },
      });
    }
  }

  if (!activeRoutineName) return null;

  return (
    <TouchableOpacity
      style={[styles.banner, { bottom: insets.bottom + 60 }]}
      onPress={handlePress}
    >
      <View style={styles.dot} />
      <View style={styles.text}>
        <Text style={styles.label}>Treino em andamento</Text>
        <Text style={styles.name}>{activeRoutineName}</Text>
      </View>
      <Text style={styles.timer}>{formatTime(elapsed)}</Text>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: spacing.screenHorizontal,
    right: spacing.screenHorizontal,
    backgroundColor: colors.primaryDim,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: colors.primaryBorder,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    zIndex: 100,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  text: { flex: 1 },
  label: { ...typography.tiny, color: colors.primary },
  name: { ...typography.small, color: colors.text, fontWeight: '600' },
  timer: { ...typography.small, color: colors.primary, fontWeight: '700' },
  arrow: { color: colors.primary, fontSize: 18 },
});