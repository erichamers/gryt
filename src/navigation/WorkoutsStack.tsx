import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WorkoutsStackParamList } from './types';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import CreateRoutineScreen from '../screens/CreateRoutineScreen';

const Stack = createNativeStackNavigator<WorkoutsStackParamList>();

export default function WorkoutsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Workouts" component={WorkoutsScreen} />
      <Stack.Screen name="Workout" component={WorkoutScreen} />
      <Stack.Screen name="CreateRoutine" component={CreateRoutineScreen} />
    </Stack.Navigator>
  );
}
