import { writeFileSync } from 'fs';

const BASE_URL = 'https://wger.de/api/v2/exerciseinfo/?format=json&language=2&limit=100&offset=';

async function fetchAllExercises() {
  let all = [];
  let offset = 0;
  while (true) {
    const res = await fetch(BASE_URL + offset);
    const data = await res.json();
    all = all.concat(data.results);
    console.log(`Buscando... ${all.length}/${data.count}`);
    if (!data.next) break;
    offset += 100;
    await new Promise(r => setTimeout(r, 200));
  }
  return all;
}

const EXERCISES = [
  { id: 'ex-001', aliases: ['Barbell Bench Press', 'Bench Press'] },
  { id: 'ex-002', aliases: ['Incline Barbell Press', 'Incline Bench Press'] },
  { id: 'ex-003', aliases: ['Decline Bench Press'] },
  { id: 'ex-004', aliases: ['Dumbbell Bench Press'] },
  { id: 'ex-005', aliases: ['Incline Dumbbell Press'] },
  { id: 'ex-006', aliases: ['Decline Dumbbell Press'] },
  { id: 'ex-007', aliases: ['Dumbbell Fly', 'Chest Fly'] },
  { id: 'ex-008', aliases: ['Incline Dumbbell Fly'] },
  { id: 'ex-009', aliases: ['Pec Deck'] },
  { id: 'ex-010', aliases: ['Cable Crossover'] },
  { id: 'ex-011', aliases: ['Push Up', 'Pushup'] },
  { id: 'ex-012', aliases: ['Incline Push Up'] },
  { id: 'ex-013', aliases: ['Smith Machine Bench Press'] },
  { id: 'ex-014', aliases: ['Lat Pulldown'] },
  { id: 'ex-015', aliases: ['Behind the Neck Pulldown'] },
  { id: 'ex-016', aliases: ['Barbell Row', 'Bent Over Row'] },
  { id: 'ex-017', aliases: ['Dumbbell Row', 'One Arm Row'] },
  { id: 'ex-018', aliases: ['Seated Row Machine'] },
  { id: 'ex-019', aliases: ['Seated Cable Row'] },
  { id: 'ex-020', aliases: ['Deadlift'] },
  { id: 'ex-021', aliases: ['Romanian Deadlift'] },
  { id: 'ex-022', aliases: ['Sumo Deadlift'] },
  { id: 'ex-023', aliases: ['Pull Up', 'Chin Up'] },
  { id: 'ex-024', aliases: ['Chest Supported Row'] },
  { id: 'ex-025', aliases: ['Dumbbell Pullover'] },
  { id: 'ex-026', aliases: ['Back Extension', 'Hyperextension'] },
  { id: 'ex-027', aliases: ['T-Bar Row'] },
  { id: 'ex-028', aliases: ['Overhead Press', 'Military Press'] },
  { id: 'ex-029', aliases: ['Dumbbell Shoulder Press'] },
  { id: 'ex-030', aliases: ['Lateral Raise'] },
  { id: 'ex-031', aliases: ['Cable Lateral Raise'] },
  { id: 'ex-032', aliases: ['Front Raise'] },
  { id: 'ex-033', aliases: ['Barbell Front Raise'] },
  { id: 'ex-034', aliases: ['Upright Row'] },
  { id: 'ex-035', aliases: ['Reverse Fly'] },
  { id: 'ex-036', aliases: ['Face Pull'] },
  { id: 'ex-037', aliases: ['Smith Machine Shoulder Press'] },
  { id: 'ex-038', aliases: ['Cable Lateral Raise'] },
  { id: 'ex-039', aliases: ['Barbell Curl'] },
  { id: 'ex-040', aliases: ['Dumbbell Curl'] },
  { id: 'ex-041', aliases: ['Alternating Dumbbell Curl'] },
  { id: 'ex-042', aliases: ['Hammer Curl'] },
  { id: 'ex-043', aliases: ['Concentration Curl'] },
  { id: 'ex-044', aliases: ['Preacher Curl'] },
  { id: 'ex-045', aliases: ['Cable Curl'] },
  { id: 'ex-046', aliases: ['Reverse Curl'] },
  { id: 'ex-047', aliases: ['21s'] },
  { id: 'ex-048', aliases: ['Triceps Pushdown'] },
  { id: 'ex-049', aliases: ['Triceps Rope Pushdown'] },
  { id: 'ex-050', aliases: ['Skull Crusher'] },
  { id: 'ex-051', aliases: ['Dumbbell Skull Crusher'] },
  { id: 'ex-052', aliases: ['Dips'] },
  { id: 'ex-053', aliases: ['French Press', 'Overhead Tricep Extension'] },
  { id: 'ex-054', aliases: ['Tricep Kickback'] },
  { id: 'ex-055', aliases: ['Bench Dips'] },
  { id: 'ex-056', aliases: ['Single Arm Pushdown'] },
  { id: 'ex-057', aliases: ['Wrist Curl'] },
  { id: 'ex-058', aliases: ['Reverse Wrist Curl'] },
  { id: 'ex-059', aliases: ['Farmers Carry'] },
  { id: 'ex-060', aliases: ['Barbell Squat', 'Back Squat'] },
  { id: 'ex-061', aliases: ['Front Squat'] },
  { id: 'ex-062', aliases: ['Leg Press'] },
  { id: 'ex-063', aliases: ['Leg Extension'] },
  { id: 'ex-064', aliases: ['Dumbbell Lunge', 'Lunge'] },
  { id: 'ex-065', aliases: ['Barbell Lunge'] },
  { id: 'ex-066', aliases: ['Hack Squat'] },
  { id: 'ex-067', aliases: ['Bulgarian Split Squat'] },
  { id: 'ex-068', aliases: ['Smith Machine Squat'] },
  { id: 'ex-069', aliases: ['Goblet Squat'] },
  { id: 'ex-070', aliases: ['Seated Leg Curl', 'Hamstring Curl'] },
  { id: 'ex-071', aliases: ['Lying Leg Curl'] },
  { id: 'ex-072', aliases: ['Dumbbell Romanian Deadlift'] },
  { id: 'ex-073', aliases: ['Stiff Leg Deadlift'] },
  { id: 'ex-074', aliases: ['Nordic Curl'] },
  { id: 'ex-075', aliases: ['Standing Calf Raise', 'Calf Raise'] },
  { id: 'ex-076', aliases: ['Seated Calf Raise'] },
  { id: 'ex-077', aliases: ['Leg Press Calf Raise'] },
  { id: 'ex-078', aliases: ['Dumbbell Calf Raise'] },
  { id: 'ex-079', aliases: ['Barbell Hip Thrust', 'Hip Thrust'] },
  { id: 'ex-080', aliases: ['Hip Abduction'] },
  { id: 'ex-081', aliases: ['Hip Adduction'] },
  { id: 'ex-082', aliases: ['Cable Kickback'] },
  { id: 'ex-083', aliases: ['Glute Bridge'] },
  { id: 'ex-084', aliases: ['Sumo Squat'] },
  { id: 'ex-085', aliases: ['Step Up'] },
  { id: 'ex-086', aliases: ['Crunch'] },
  { id: 'ex-087', aliases: ['Plank'] },
  { id: 'ex-088', aliases: ['Side Plank'] },
  { id: 'ex-089', aliases: ['Cable Crunch'] },
  { id: 'ex-090', aliases: ['Leg Raise', 'Hanging Leg Raise'] },
  { id: 'ex-091', aliases: ['Russian Twist'] },
  { id: 'ex-092', aliases: ['Dead Bug'] },
  { id: 'ex-093', aliases: ['Ab Wheel'] },
  { id: 'ex-094', aliases: ['Stomach Vacuum'] },
  { id: 'ex-095', aliases: ['Barbell Shrug', 'Shrug'] },
  { id: 'ex-096', aliases: ['Dumbbell Shrug'] },
  { id: 'ex-097', aliases: ['Cable Shrug'] },
  { id: 'ex-098', aliases: ['Neck Flexion'] },
  { id: 'ex-099', aliases: ['Neck Extension'] },
  { id: 'ex-100', aliases: ['Treadmill', 'Running'] },
  { id: 'ex-101', aliases: ['Stationary Bike'] },
  { id: 'ex-102', aliases: ['Elliptical'] },
  { id: 'ex-103', aliases: ['Rowing Machine'] },
  { id: 'ex-104', aliases: ['Jump Rope'] },
  { id: 'ex-105', aliases: ['Burpee'] },
  { id: 'ex-106', aliases: ['Power Clean'] },
  { id: 'ex-107', aliases: ['Power Snatch'] },
  { id: 'ex-108', aliases: ['Thruster'] },
  { id: 'ex-109', aliases: ['Turkish Get Up'] },
  { id: 'ex-110', aliases: ['Kettlebell Swing'] },
];

function findMatch(wgerExercises, aliases) {
  for (const alias of aliases) {
    const term = alias.toLowerCase();
    const match = wgerExercises.find(ex => {
      const names = [
        ...(ex.translations || []).map(t => t.name.toLowerCase()),
        ...(ex.aliases || []).map(a => a.alias.toLowerCase()),
      ];
      return names.some(n => n.includes(term) || term.includes(n));
    });
    if (match) {
      const image = match.images.find(i => i.is_main) || match.images[0];
      if (image) return image.image;
    }
  }
  return null;
}

async function main() {
  console.log('Baixando todos os exercícios do wger...');
  const wgerExercises = await fetchAllExercises();
  console.log(`Total: ${wgerExercises.length} exercícios\n`);

  const result = {};
  let found = 0;

  for (const ex of EXERCISES) {
    const imageUrl = findMatch(wgerExercises, ex.aliases);
    result[ex.id] = imageUrl;
    if (imageUrl) found++;
    console.log(`${ex.id}: ${imageUrl ? '✓' : '✗'}`);
  }

  console.log(`\nEncontrados: ${found}/${EXERCISES.length}`);
  writeFileSync('scripts/exercise-images.json', JSON.stringify(result, null, 2));
  console.log('Salvo em scripts/exercise-images.json');
}

main();