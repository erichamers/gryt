import { syncToSupabase } from '../lib/sync';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession, WorkoutExercise, UserRoutine } from '../types';
import { ROUTINES } from './routines';

const SESSIONS_KEY = 'gryt_sessions';
const ACTIVE_WORKOUT_KEY = 'gryt_active_workout';
const USER_ROUTINES_KEY = 'gryt_user_routines';
const SEED_KEY = 'gryt_seeded_v1';

export async function saveSession(session: WorkoutSession): Promise<void> {
  try {
    const existing = await getSessions();
    const updated = [session, ...existing];
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    syncToSupabase().catch(console.error);
  } catch (e) {
    console.error('Erro ao salvar sessão:', e);
  }
}

export async function getSessions(): Promise<WorkoutSession[]> {
  try {
    const data = await AsyncStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Erro ao buscar sessões:', e);
    return [];
  }
}

export async function getLastSession(
  routineId: string
): Promise<WorkoutSession | null> {
  try {
    const sessions = await getSessions();
    return sessions.find((s) => s.routineId === routineId) ?? null;
  } catch (e) {
    return null;
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const sessions = await getSessions();
    const updated = sessions.filter((s) => s.id !== sessionId);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    const { supabase } = await import('../lib/supabase');
    await supabase.from('sessions').delete().eq('id', sessionId);
  } catch (e) {
    console.error('Erro ao deletar sessão:', e);
  }
}

export async function updateSession(session: WorkoutSession): Promise<void> {
  try {
    const sessions = await getSessions();
    const updated = sessions.map((s) => (s.id === session.id ? session : s));
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    syncToSupabase().catch(console.error);
  } catch (e) {
    console.error('Erro ao atualizar sessão:', e);
  }
}

export type ActiveWorkout = {
  routineId: string;
  startTime: number;
  exercises: WorkoutExercise[];
};

export async function saveActiveWorkout(workout: ActiveWorkout): Promise<void> {
  try {
    await AsyncStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(workout));
  } catch (e) {
    console.error('Erro ao salvar treino ativo:', e);
  }
}

export async function getActiveWorkout(): Promise<ActiveWorkout | null> {
  try {
    const data = await AsyncStorage.getItem(ACTIVE_WORKOUT_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export async function clearActiveWorkout(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY);
  } catch (e) {
    console.error('Erro ao limpar treino ativo:', e);
  }
}

export async function getUserRoutines(): Promise<UserRoutine[]> {
  try {
    const data = await AsyncStorage.getItem(USER_ROUTINES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Erro ao buscar rotinas:', e);
    return [];
  }
}

export async function saveUserRoutine(routine: UserRoutine): Promise<void> {
  try {
    const existing = await getUserRoutines();
    const updated = [routine, ...existing];
    await AsyncStorage.setItem(USER_ROUTINES_KEY, JSON.stringify(updated));
    syncToSupabase().catch(console.error);
  } catch (e) {
    console.error('Erro ao salvar rotina:', e);
  }
}

export async function updateUserRoutine(routine: UserRoutine): Promise<void> {
  try {
    const existing = await getUserRoutines();
    const updated = existing.map((r) => (r.id === routine.id ? routine : r));
    await AsyncStorage.setItem(USER_ROUTINES_KEY, JSON.stringify(updated));
    syncToSupabase().catch(console.error);
  } catch (e) {
    console.error('Erro ao atualizar rotina:', e);
  }
}

export async function deleteUserRoutine(routineId: string): Promise<void> {
  try {
    const existing = await getUserRoutines();
    const updated = existing.filter((r) => r.id !== routineId);
    await AsyncStorage.setItem(USER_ROUTINES_KEY, JSON.stringify(updated));
    const { createClient } = await import('@supabase/supabase-js');
    const { supabase } = await import('../lib/supabase');
    await supabase.from('routines').delete().eq('id', routineId);
  } catch (e) {
    console.error('Erro ao deletar rotina:', e);
  }
}

export type WorkloadMetrics = {
  acuteLoad: number;
  chronicLoad: number;
  ratio: number;
};

export async function getWorkloadMetrics(): Promise<WorkloadMetrics> {
  const sessions = await getSessions();
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  const day7 = sessions.filter(
    (s) => now - new Date(s.date).getTime() <= 7 * DAY
  );
  const day28 = sessions.filter(
    (s) => now - new Date(s.date).getTime() <= 28 * DAY
  );

  const acuteLoad = day7.reduce((acc, s) => {
    const rpe = s.rpe ?? 5;
    const minutes = s.durationSeconds / 60;
    return acc + rpe * minutes;
  }, 0);

  const weeksWithData = new Set(
    day28.map((s) => {
      const date = new Date(s.date);
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      const weekNumber = Math.ceil(
        ((date.getTime() - startOfYear.getTime()) / DAY + startOfYear.getDay() + 1) / 7
      );
      return `${date.getFullYear()}-${weekNumber}`;
    })
  ).size;

  const divisor = Math.min(Math.max(weeksWithData, 1), 4);

  const chronicLoad = day28.length > 0
    ? day28.reduce((acc, s) => {
        const rpe = s.rpe ?? 5;
        const minutes = s.durationSeconds / 60;
        return acc + rpe * minutes;
      }, 0) / divisor
    : 0;

  const hasEnoughHistory = weeksWithData > 1;
  const ratio = hasEnoughHistory && chronicLoad > 0
    ? acuteLoad / chronicLoad
    : 0;

  return {
    acuteLoad: Math.round(acuteLoad),
    chronicLoad: Math.round(chronicLoad),
    ratio: Math.round(ratio * 100) / 100,
  };
}