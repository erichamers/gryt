import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import RoutinesScreen from '../screens/RoutinesScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import CreateRoutineScreen from '../screens/CreateRoutineScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Routines" component={RoutinesScreen} />
      <Stack.Screen name="Workout" component={WorkoutScreen} />
      <Stack.Screen name="CreateRoutine" component={CreateRoutineScreen} />
    </Stack.Navigator>
  );
}
