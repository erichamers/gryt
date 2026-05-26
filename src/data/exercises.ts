import { ExerciseTemplate } from '../types';

export const EXERCISES: ExerciseTemplate[] = [
  // PEITO
  { id: 'ex-001', name: 'Supino Reto (Barra)', aliases: ['Bench Press', 'Barbell Bench Press'], muscleGroup: 'Peito', equipment: 'Barra' },
  { id: 'ex-002', name: 'Supino Inclinado (Barra)', aliases: ['Incline Bench Press', 'Incline Barbell Press'], muscleGroup: 'Peito', equipment: 'Barra' },
  { id: 'ex-003', name: 'Supino Declinado (Barra)', aliases: ['Decline Bench Press'], muscleGroup: 'Peito', equipment: 'Barra' },
  { id: 'ex-004', name: 'Supino Reto (Haltere)', aliases: ['Dumbbell Bench Press', 'DB Bench Press'], muscleGroup: 'Peito', equipment: 'Haltere' },
  { id: 'ex-005', name: 'Supino Inclinado (Haltere)', aliases: ['Incline Dumbbell Press', 'Incline DB Press'], muscleGroup: 'Peito', equipment: 'Haltere' },
  { id: 'ex-006', name: 'Supino Declinado (Haltere)', aliases: ['Decline Dumbbell Press'], muscleGroup: 'Peito', equipment: 'Haltere' },
  { id: 'ex-007', name: 'Crucifixo (Haltere)', aliases: ['Dumbbell Fly', 'DB Fly', 'Chest Fly'], muscleGroup: 'Peito', equipment: 'Haltere' },
  { id: 'ex-008', name: 'Crucifixo Inclinado (Haltere)', aliases: ['Incline Dumbbell Fly', 'Incline Fly'], muscleGroup: 'Peito', equipment: 'Haltere' },
  { id: 'ex-009', name: 'Peck Deck (Máquina)', aliases: ['Butterfly', 'Pec Deck', 'Chest Press Machine'], muscleGroup: 'Peito', equipment: 'Máquina' },
  { id: 'ex-010', name: 'Crossover (Cabo)', aliases: ['Cable Crossover', 'Cable Fly'], muscleGroup: 'Peito', equipment: 'Cabo' },
  { id: 'ex-011', name: 'Flexão', aliases: ['Push Up', 'Pushup'], muscleGroup: 'Peito', equipment: 'Peso Corporal' },
  { id: 'ex-012', name: 'Flexão Inclinada', aliases: ['Incline Push Up'], muscleGroup: 'Peito', equipment: 'Peso Corporal' },
  { id: 'ex-013', name: 'Supino no Smith', aliases: ['Smith Machine Bench Press'], muscleGroup: 'Peito', equipment: 'Smith' },

  // COSTAS
  { id: 'ex-014', name: 'Puxada Frontal (Cabo)', aliases: ['Lat Pulldown', 'Cable Pulldown'], muscleGroup: 'Costas', equipment: 'Cabo' },
  { id: 'ex-015', name: 'Puxada Atrás (Cabo)', aliases: ['Behind the Neck Pulldown'], muscleGroup: 'Costas', equipment: 'Cabo' },
  { id: 'ex-016', name: 'Remada Curvada (Barra)', aliases: ['Barbell Row', 'Bent Over Row', 'Pendlay Row'], muscleGroup: 'Costas', equipment: 'Barra' },
  { id: 'ex-017', name: 'Remada Unilateral (Haltere)', aliases: ['Dumbbell Row', 'One Arm Row', 'DB Row'], muscleGroup: 'Costas', equipment: 'Haltere' },
  { id: 'ex-018', name: 'Remada Cavalinho (Máquina)', aliases: ['Seated Row Machine', 'Machine Row'], muscleGroup: 'Costas', equipment: 'Máquina' },
  { id: 'ex-019', name: 'Remada Sentada (Cabo)', aliases: ['Seated Cable Row', 'Cable Row'], muscleGroup: 'Costas', equipment: 'Cabo' },
  { id: 'ex-020', name: 'Levantamento Terra', aliases: ['Deadlift', 'Conventional Deadlift'], muscleGroup: 'Costas', equipment: 'Barra' },
  { id: 'ex-021', name: 'Levantamento Terra Romeno', aliases: ['Romanian Deadlift', 'RDL'], muscleGroup: 'Costas', equipment: 'Barra' },
  { id: 'ex-022', name: 'Levantamento Terra Sumo', aliases: ['Sumo Deadlift'], muscleGroup: 'Costas', equipment: 'Barra' },
  { id: 'ex-023', name: 'Barra Fixa', aliases: ['Pull Up', 'Pullup', 'Chin Up'], muscleGroup: 'Costas', equipment: 'Peso Corporal' },
  { id: 'ex-024', name: 'Remada na Máquina', aliases: ['Machine Row', 'Chest Supported Row'], muscleGroup: 'Costas', equipment: 'Máquina' },
  { id: 'ex-025', name: 'Pull Over (Haltere)', aliases: ['Dumbbell Pullover'], muscleGroup: 'Costas', equipment: 'Haltere' },
  { id: 'ex-026', name: 'Hiperextensão', aliases: ['Back Extension', 'Hyperextension'], muscleGroup: 'Costas', equipment: 'Peso Corporal' },
  { id: 'ex-027', name: 'Remada T (Barra)', aliases: ['T-Bar Row'], muscleGroup: 'Costas', equipment: 'Barra' },

  // OMBRO
  { id: 'ex-028', name: 'Desenvolvimento (Barra)', aliases: ['Overhead Press', 'Military Press', 'OHP'], muscleGroup: 'Ombro', equipment: 'Barra' },
  { id: 'ex-029', name: 'Desenvolvimento (Haltere)', aliases: ['Dumbbell Shoulder Press', 'DB Press', 'Seated Overhead Press'], muscleGroup: 'Ombro', equipment: 'Haltere' },
  { id: 'ex-030', name: 'Elevação Lateral (Haltere)', aliases: ['Lateral Raise', 'DB Lateral Raise', 'Side Raise'], muscleGroup: 'Ombro', equipment: 'Haltere' },
  { id: 'ex-031', name: 'Elevação Lateral (Cabo)', aliases: ['Cable Lateral Raise'], muscleGroup: 'Ombro', equipment: 'Cabo' },
  { id: 'ex-032', name: 'Elevação Frontal (Haltere)', aliases: ['Front Raise', 'Dumbbell Front Raise'], muscleGroup: 'Ombro', equipment: 'Haltere' },
  { id: 'ex-033', name: 'Elevação Frontal (Barra)', aliases: ['Barbell Front Raise'], muscleGroup: 'Ombro', equipment: 'Barra' },
  { id: 'ex-034', name: 'Remada Alta (Barra)', aliases: ['Upright Row', 'Barbell Upright Row'], muscleGroup: 'Ombro', equipment: 'Barra' },
  { id: 'ex-035', name: 'Crucifixo Inverso (Haltere)', aliases: ['Reverse Fly', 'Rear Delt Fly', 'Bent Over Lateral Raise'], muscleGroup: 'Ombro', equipment: 'Haltere' },
  { id: 'ex-036', name: 'Face Pull (Cabo)', aliases: ['Face Pull', 'Cable Face Pull'], muscleGroup: 'Ombro', equipment: 'Cabo' },
  { id: 'ex-037', name: 'Desenvolvimento no Smith', aliases: ['Smith Machine Shoulder Press'], muscleGroup: 'Ombro', equipment: 'Smith' },
  { id: 'ex-038', name: 'Abdução Unilateral (Cabo)', aliases: ['Cable Lateral Raise Unilateral', 'Single Arm Cable Lateral Raise'], muscleGroup: 'Ombro', equipment: 'Cabo' },

  // BÍCEPS
  { id: 'ex-039', name: 'Rosca Direta (Barra)', aliases: ['Barbell Curl', 'Bicep Curl Barbell'], muscleGroup: 'Bíceps', equipment: 'Barra' },
  { id: 'ex-040', name: 'Rosca Direta (Haltere)', aliases: ['Dumbbell Curl', 'DB Curl', 'Bicep Curl'], muscleGroup: 'Bíceps', equipment: 'Haltere' },
  { id: 'ex-041', name: 'Rosca Alternada (Haltere)', aliases: ['Alternating Dumbbell Curl', 'Alternating Curl'], muscleGroup: 'Bíceps', equipment: 'Haltere' },
  { id: 'ex-042', name: 'Rosca Martelo (Haltere)', aliases: ['Hammer Curl', 'Neutral Grip Curl'], muscleGroup: 'Bíceps', equipment: 'Haltere' },
  { id: 'ex-043', name: 'Rosca Concentrada (Haltere)', aliases: ['Concentration Curl'], muscleGroup: 'Bíceps', equipment: 'Haltere' },
  { id: 'ex-044', name: 'Rosca Scott (Barra)', aliases: ['Preacher Curl', 'Scott Curl'], muscleGroup: 'Bíceps', equipment: 'Barra' },
  { id: 'ex-045', name: 'Rosca no Cabo', aliases: ['Cable Curl', 'Cable Bicep Curl'], muscleGroup: 'Bíceps', equipment: 'Cabo' },
  { id: 'ex-046', name: 'Rosca Inversa (Barra)', aliases: ['Reverse Curl', 'Reverse Barbell Curl'], muscleGroup: 'Bíceps', equipment: 'Barra' },
  { id: 'ex-047', name: 'Rosca 21', aliases: ['21s', 'Barbell 21s'], muscleGroup: 'Bíceps', equipment: 'Barra' },

  // TRÍCEPS
  { id: 'ex-048', name: 'Tríceps Pulley (Cabo)', aliases: ['Triceps Pushdown', 'Cable Pushdown', 'Tricep Pushdown'], muscleGroup: 'Tríceps', equipment: 'Cabo' },
  { id: 'ex-049', name: 'Tríceps Corda (Cabo)', aliases: ['Triceps Rope Pushdown', 'Rope Pushdown'], muscleGroup: 'Tríceps', equipment: 'Cabo' },
  { id: 'ex-050', name: 'Tríceps Testa (Barra)', aliases: ['Skull Crusher', 'EZ Bar Skull Crusher', 'Lying Tricep Extension'], muscleGroup: 'Tríceps', equipment: 'Barra' },
  { id: 'ex-051', name: 'Tríceps Testa (Haltere)', aliases: ['Dumbbell Skull Crusher', 'Dumbbell Tricep Extension'], muscleGroup: 'Tríceps', equipment: 'Haltere' },
  { id: 'ex-052', name: 'Mergulho (Paralelas)', aliases: ['Dips', 'Tricep Dips', 'Parallel Bar Dips'], muscleGroup: 'Tríceps', equipment: 'Peso Corporal' },
  { id: 'ex-053', name: 'Tríceps Francês (Haltere)', aliases: ['French Press', 'Overhead Tricep Extension'], muscleGroup: 'Tríceps', equipment: 'Haltere' },
  { id: 'ex-054', name: 'Tríceps Coice (Haltere)', aliases: ['Tricep Kickback', 'Kickback'], muscleGroup: 'Tríceps', equipment: 'Haltere' },
  { id: 'ex-055', name: 'Tríceps no Banco', aliases: ['Bench Dips', 'Chair Dips'], muscleGroup: 'Tríceps', equipment: 'Peso Corporal' },
  { id: 'ex-056', name: 'Tríceps Unilateral (Cabo)', aliases: ['Single Arm Pushdown', 'One Arm Tricep Pushdown'], muscleGroup: 'Tríceps', equipment: 'Cabo' },

  // ANTEBRAÇO
  { id: 'ex-057', name: 'Rosca de Punho (Barra)', aliases: ['Wrist Curl', 'Barbell Wrist Curl'], muscleGroup: 'Antebraço', equipment: 'Barra' },
  { id: 'ex-058', name: 'Rosca de Punho Inversa', aliases: ['Reverse Wrist Curl'], muscleGroup: 'Antebraço', equipment: 'Barra' },
  { id: 'ex-059', name: 'Farmer Walk', aliases: ['Farmers Carry', 'Farmer Carry'], muscleGroup: 'Antebraço', equipment: 'Haltere' },

  // QUADRÍCEPS
  { id: 'ex-060', name: 'Agachamento (Barra)', aliases: ['Squat', 'Back Squat', 'Barbell Squat'], muscleGroup: 'Quadríceps', equipment: 'Barra' },
  { id: 'ex-061', name: 'Agachamento Frontal (Barra)', aliases: ['Front Squat'], muscleGroup: 'Quadríceps', equipment: 'Barra' },
  { id: 'ex-062', name: 'Leg Press (Máquina)', aliases: ['Leg Press'], muscleGroup: 'Quadríceps', equipment: 'Máquina' },
  { id: 'ex-063', name: 'Extensão de Pernas (Máquina)', aliases: ['Leg Extension', 'Quad Extension'], muscleGroup: 'Quadríceps', equipment: 'Máquina' },
  { id: 'ex-064', name: 'Avanço (Haltere)', aliases: ['Lunge', 'Dumbbell Lunge', 'Walking Lunge'], muscleGroup: 'Quadríceps', equipment: 'Haltere' },
  { id: 'ex-065', name: 'Avanço (Barra)', aliases: ['Barbell Lunge'], muscleGroup: 'Quadríceps', equipment: 'Barra' },
  { id: 'ex-066', name: 'Hack Squat (Máquina)', aliases: ['Hack Squat'], muscleGroup: 'Quadríceps', equipment: 'Máquina' },
  { id: 'ex-067', name: 'Agachamento Búlgaro', aliases: ['Bulgarian Split Squat', 'Split Squat'], muscleGroup: 'Quadríceps', equipment: 'Haltere' },
  { id: 'ex-068', name: 'Agachamento no Smith', aliases: ['Smith Machine Squat'], muscleGroup: 'Quadríceps', equipment: 'Smith' },
  { id: 'ex-069', name: 'Agachamento Goblet', aliases: ['Goblet Squat'], muscleGroup: 'Quadríceps', equipment: 'Kettlebell' },

  // ISQUIOTIBIAIS
  { id: 'ex-070', name: 'Flexão de Pernas (Máquina)', aliases: ['Leg Curl', 'Hamstring Curl', 'Seated Leg Curl'], muscleGroup: 'Isquiotibiais', equipment: 'Máquina' },
  { id: 'ex-071', name: 'Flexão de Pernas Deitado (Máquina)', aliases: ['Lying Leg Curl', 'Prone Leg Curl'], muscleGroup: 'Isquiotibiais', equipment: 'Máquina' },
  { id: 'ex-072', name: 'Levantamento Terra Romeno (Haltere)', aliases: ['Dumbbell Romanian Deadlift', 'DB RDL'], muscleGroup: 'Isquiotibiais', equipment: 'Haltere' },
  { id: 'ex-073', name: 'Stiff (Barra)', aliases: ['Stiff Leg Deadlift', 'Straight Leg Deadlift'], muscleGroup: 'Isquiotibiais', equipment: 'Barra' },
  { id: 'ex-074', name: 'Curl Nórdico', aliases: ['Nordic Curl', 'Nordic Hamstring Curl'], muscleGroup: 'Isquiotibiais', equipment: 'Peso Corporal' },

  // PANTURRILHA
  { id: 'ex-075', name: 'Elevação de Calcanhares em Pé', aliases: ['Standing Calf Raise', 'Calf Raise'], muscleGroup: 'Panturrilha', equipment: 'Máquina' },
  { id: 'ex-076', name: 'Elevação de Calcanhares Sentado', aliases: ['Seated Calf Raise'], muscleGroup: 'Panturrilha', equipment: 'Máquina' },
  { id: 'ex-077', name: 'Elevação de Calcanhares (Leg Press)', aliases: ['Leg Press Calf Raise'], muscleGroup: 'Panturrilha', equipment: 'Máquina' },
  { id: 'ex-078', name: 'Elevação de Calcanhares (Haltere)', aliases: ['Dumbbell Calf Raise', 'Single Leg Calf Raise'], muscleGroup: 'Panturrilha', equipment: 'Haltere' },

  // GLÚTEO
  { id: 'ex-079', name: 'Hip Thrust (Barra)', aliases: ['Barbell Hip Thrust', 'Hip Thrust'], muscleGroup: 'Glúteo', equipment: 'Barra' },
  { id: 'ex-080', name: 'Abdução de Quadril (Máquina)', aliases: ['Hip Abduction', 'Hip Abduction Machine'], muscleGroup: 'Glúteo', equipment: 'Máquina' },
  { id: 'ex-081', name: 'Adução de Quadril (Máquina)', aliases: ['Hip Adduction', 'Hip Adduction Machine'], muscleGroup: 'Glúteo', equipment: 'Máquina' },
  { id: 'ex-082', name: 'Glúteo no Cabo (Quatro Apoios)', aliases: ['Cable Kickback', 'Donkey Kick'], muscleGroup: 'Glúteo', equipment: 'Cabo' },
  { id: 'ex-083', name: 'Ponte de Glúteo', aliases: ['Glute Bridge', 'Hip Bridge'], muscleGroup: 'Glúteo', equipment: 'Peso Corporal' },
  { id: 'ex-084', name: 'Agachamento Sumô (Haltere)', aliases: ['Sumo Squat', 'Plie Squat'], muscleGroup: 'Glúteo', equipment: 'Haltere' },
  { id: 'ex-085', name: 'Step Up (Haltere)', aliases: ['Step Up', 'Box Step Up'], muscleGroup: 'Glúteo', equipment: 'Haltere' },

  // CORE
  { id: 'ex-086', name: 'Abdominal Crunch', aliases: ['Crunch', 'Ab Crunch', 'Situp'], muscleGroup: 'Core', equipment: 'Peso Corporal' },
  { id: 'ex-087', name: 'Prancha', aliases: ['Plank', 'Front Plank'], muscleGroup: 'Core', equipment: 'Peso Corporal' },
  { id: 'ex-088', name: 'Prancha Lateral', aliases: ['Side Plank'], muscleGroup: 'Core', equipment: 'Peso Corporal' },
  { id: 'ex-089', name: 'Abdominal no Cabo', aliases: ['Cable Crunch', 'Kneeling Cable Crunch'], muscleGroup: 'Core', equipment: 'Cabo' },
  { id: 'ex-090', name: 'Elevação de Pernas', aliases: ['Leg Raise', 'Hanging Leg Raise'], muscleGroup: 'Core', equipment: 'Peso Corporal' },
  { id: 'ex-091', name: 'Russian Twist', aliases: ['Russian Twist'], muscleGroup: 'Core', equipment: 'Peso Corporal' },
  { id: 'ex-092', name: 'Dead Bug', aliases: ['Dead Bug'], muscleGroup: 'Core', equipment: 'Peso Corporal' },
  { id: 'ex-093', name: 'Roda Abdominal', aliases: ['Ab Wheel', 'Ab Roller'], muscleGroup: 'Core', equipment: 'Outro' },
  { id: 'ex-094', name: 'Vacúo Abdominal', aliases: ['Stomach Vacuum'], muscleGroup: 'Core', equipment: 'Peso Corporal' },

  // TRAPÉZIO
  { id: 'ex-095', name: 'Encolhimento (Barra)', aliases: ['Barbell Shrug', 'Shrug'], muscleGroup: 'Trapézio', equipment: 'Barra' },
  { id: 'ex-096', name: 'Encolhimento (Haltere)', aliases: ['Dumbbell Shrug', 'DB Shrug'], muscleGroup: 'Trapézio', equipment: 'Haltere' },
  { id: 'ex-097', name: 'Encolhimento (Cabo)', aliases: ['Cable Shrug'], muscleGroup: 'Trapézio', equipment: 'Cabo' },

  // PESCOÇO
  { id: 'ex-098', name: 'Flexão de Pescoço', aliases: ['Neck Flexion', 'Neck Curl'], muscleGroup: 'Pescoço', equipment: 'Peso Corporal' },
  { id: 'ex-099', name: 'Extensão de Pescoço', aliases: ['Neck Extension'], muscleGroup: 'Pescoço', equipment: 'Peso Corporal' },

  // CARDIO
  { id: 'ex-100', name: 'Corrida (Esteira)', aliases: ['Treadmill', 'Running'], muscleGroup: 'Cardio', equipment: 'Máquina' },
  { id: 'ex-101', name: 'Bicicleta Ergométrica', aliases: ['Stationary Bike', 'Cycling'], muscleGroup: 'Cardio', equipment: 'Máquina' },
  { id: 'ex-102', name: 'Elíptico', aliases: ['Elliptical', 'Cross Trainer'], muscleGroup: 'Cardio', equipment: 'Máquina' },
  { id: 'ex-103', name: 'Remo Ergométrico', aliases: ['Rowing Machine', 'Erg'], muscleGroup: 'Cardio', equipment: 'Máquina' },
  { id: 'ex-104', name: 'Pular Corda', aliases: ['Jump Rope', 'Skipping'], muscleGroup: 'Cardio', equipment: 'Outro' },
  { id: 'ex-105', name: 'Burpee', aliases: ['Burpees'], muscleGroup: 'Cardio', equipment: 'Peso Corporal' },

  // FULL BODY
  { id: 'ex-106', name: 'Levantamento Olímpico', aliases: ['Clean and Jerk', 'Power Clean'], muscleGroup: 'Full Body', equipment: 'Barra' },
  { id: 'ex-107', name: 'Snatch', aliases: ['Snatch', 'Power Snatch'], muscleGroup: 'Full Body', equipment: 'Barra' },
  { id: 'ex-108', name: 'Thruster', aliases: ['Thruster', 'DB Thruster'], muscleGroup: 'Full Body', equipment: 'Barra' },
  { id: 'ex-109', name: 'Turkish Get Up', aliases: ['Turkish Get Up', 'TGU'], muscleGroup: 'Full Body', equipment: 'Kettlebell' },
  { id: 'ex-110', name: 'Swing (Kettlebell)', aliases: ['Kettlebell Swing', 'KB Swing'], muscleGroup: 'Full Body', equipment: 'Kettlebell' },
];

export function searchExercises(query: string): ExerciseTemplate[] {
  if (!query || query.trim() === '') return EXERCISES;
  const q = query.toLowerCase().trim();
  return EXERCISES.filter(
    (ex) =>
      ex.name.toLowerCase().includes(q) ||
      ex.aliases.some((a) => a.toLowerCase().includes(q)) ||
      ex.muscleGroup.toLowerCase().includes(q) ||
      ex.equipment.toLowerCase().includes(q)
  );
}

export function getExercisesByMuscle(muscle: string): ExerciseTemplate[] {
  return EXERCISES.filter((ex) => ex.muscleGroup === muscle);
}

export const MUSCLE_GROUPS = [
  'Todos',
  'Peito',
  'Costas',
  'Ombro',
  'Bíceps',
  'Tríceps',
  'Antebraço',
  'Quadríceps',
  'Isquiotibiais',
  'Panturrilha',
  'Glúteo',
  'Core',
  'Trapézio',
  'Pescoço',
  'Cardio',
  'Full Body',
];