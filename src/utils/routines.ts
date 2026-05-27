import { Routine, UserRoutine } from '../types';

export function userRoutineToRoutine(ur: UserRoutine): Routine {
  return {
    id: ur.id,
    name: ur.name,
    subtitle: ur.subtitle,
    exercises: ur.exercises.map((e) => ({
      id: e.exerciseTemplateId,
      name: e.name,
      sets: e.sets.length,
      reps: String(e.sets[0]?.reps ?? 0),
      weight: e.sets[0]?.weight ?? 0,
      restSeconds: e.sets[0]?.restSeconds ?? 90,
      notes: e.notes,
    })),
  };
}
