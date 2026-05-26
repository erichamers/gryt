export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: number;
  restSeconds: number;
  notes?: string;
};

export type Routine = {
  id: string;
  name: string;
  subtitle: string;
  exercises: Exercise[];
};

export type CompletedSet = {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
};

export type WorkoutExercise = {
  exercise: Exercise;
  completedSets: CompletedSet[];
};

export type WorkoutSession = {
  id: string;
  routineId: string;
  routineName: string;
  date: string;
  exercises: WorkoutExercise[];
  durationSeconds: number;
  rpe?: number;
};

export type ExerciseTemplate = {
  id: string;
  name: string;
  aliases: string[];
  muscleGroup: MuscleGroup;
  equipment: Equipment;
};

export type MuscleGroup =
  | 'Peito'
  | 'Costas'
  | 'Ombro'
  | 'Bíceps'
  | 'Tríceps'
  | 'Antebraço'
  | 'Quadríceps'
  | 'Isquiotibiais'
  | 'Panturrilha'
  | 'Glúteo'
  | 'Core'
  | 'Trapézio'
  | 'Pescoço'
  | 'Cardio'
  | 'Full Body';

export type Equipment =
  | 'Barra'
  | 'Haltere'
  | 'Cabo'
  | 'Máquina'
  | 'Peso Corporal'
  | 'Kettlebell'
  | 'Elástico'
  | 'Smith'
  | 'Outro';

export type RoutineSet = {
  weight: number;
  reps: number;
  restSeconds: number;
};

export type UserRoutine = {
  id: string;
  name: string;
  subtitle: string;
  exercises: UserRoutineExercise[];
  createdAt: string;
};

export type UserRoutineExercise = {
  exerciseTemplateId: string;
  name: string;
  sets: RoutineSet[];
  notes?: string;
};