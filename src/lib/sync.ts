import { supabase } from './supabase';
import { getUserRoutines, getSessions, saveUserRoutine, saveSession, updateUserRoutine } from '../data/storage';
import { UserRoutine, WorkoutSession } from '../types';

export async function syncToSupabase() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const routines = await getUserRoutines();
  const sessions = await getSessions();

  for (const routine of routines) {
    await supabase.from('routines').upsert({
      id: routine.id,
      user_id: user.id,
      data: routine,
      updated_at: new Date().toISOString(),
    });
  }

  for (const session of sessions) {
    await supabase.from('sessions').upsert({
      id: session.id,
      user_id: user.id,
      data: session,
      updated_at: new Date().toISOString(),
    });
  }
}

export async function syncFromSupabase() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: routines } = await supabase
    .from('routines')
    .select('data')
    .eq('user_id', user.id);

  if (routines) {
    for (const row of routines) {
      const routine = row.data as UserRoutine;
      const existing = await getUserRoutines();
      if (existing.find(r => r.id === routine.id)) {
        await updateUserRoutine(routine);
      } else {
        await saveUserRoutine(routine);
      }
    }
  }

  const { data: sessions } = await supabase
    .from('sessions')
    .select('data')
    .eq('user_id', user.id);

  if (sessions) {
    const existingSessions = await getSessions();
    for (const row of sessions) {
      const session = row.data as WorkoutSession;
      if (!existingSessions.find(s => s.id === session.id)) {
        await saveSession(session);
      }
    }
  }
}