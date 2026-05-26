import 'react-native-gesture-handler';
import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RoutinesScreen from './src/screens/RoutinesScreen';
import WorkoutsScreen from './src/screens/WorkoutsScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import CreateRoutineScreen from './src/screens/CreateRoutineScreen';
import { Routine, UserRoutine, WorkoutSession } from './src/types';
import { getActiveWorkout, getUserRoutines, deleteUserRoutine } from './src/data/storage';
import { ROUTINES } from './src/data/routines';
import { colors, spacing, typography } from './src/theme';

type Tab = 'home' | 'workouts' | 'history';

function userRoutineToRoutine(ur: UserRoutine): Routine {
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

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [currentRoutine, setCurrentRoutine] = useState<Routine | null>(null);
  const [currentRoutineDeletable, setCurrentRoutineDeletable] = useState(false);
  const [userRoutines, setUserRoutines] = useState<UserRoutine[]>([]);
  const [editingRoutine, setEditingRoutine] = useState<UserRoutine | null>(null);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [showWorkout, setShowWorkout] = useState(false);
  const [showCreateRoutine, setShowCreateRoutine] = useState(false);

  useEffect(() => {
    getUserRoutines().then(setUserRoutines);
  }, []);

  async function handleResumeWorkout() {
    const active = await getActiveWorkout();
    if (!active) return;
    const hardcoded = ROUTINES.find((r) => r.id === active.routineId);
    if (hardcoded) {
      setCurrentRoutine(hardcoded);
      setCurrentRoutineDeletable(false);
      setShowWorkout(true);
      return;
    }
    const user = userRoutines.find((r) => r.id === active.routineId);
    if (user) {
      setCurrentRoutine(userRoutineToRoutine(user));
      setCurrentRoutineDeletable(true);
      setShowWorkout(true);
    }
  }

  async function handleDeleteRoutine(routineId: string) {
    await deleteUserRoutine(routineId);
    getUserRoutines().then(setUserRoutines);
    setShowWorkout(false);
  }

  function handleEditRoutine(routine: UserRoutine) {
    setEditingRoutine(routine);
    setShowCreateRoutine(true);
  }

  function handleSelectRoutine(routine: Routine, isDeletable: boolean) {
    setCurrentRoutine(routine);
    setCurrentRoutineDeletable(isDeletable);
    setShowWorkout(true);
  }

  const allRoutines: Routine[] = [
    ...ROUTINES,
    ...userRoutines.map(userRoutineToRoutine),
  ];

  if (showCreateRoutine) {
    return (
      <CreateRoutineScreen
        editingRoutine={editingRoutine}
        onBack={() => {
          setEditingRoutine(null);
          setShowCreateRoutine(false);
        }}
        onSaved={() => {
          setEditingRoutine(null);
          getUserRoutines().then(setUserRoutines);
          setShowCreateRoutine(false);
        }}
      />
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.mainContainer}>
        <View style={styles.content}>
          {showWorkout && currentRoutine ? (
            <WorkoutScreen
              routine={currentRoutine}
              deletable={currentRoutineDeletable}
              onFinish={() => setShowWorkout(false)}
              onBack={() => setShowWorkout(false)}
              onDelete={() => handleDeleteRoutine(currentRoutine.id)}
            />
          ) : (
            <>
              {tab === 'home' && (
                <RoutinesScreen
                  routines={allRoutines}
                  userRoutineIds={userRoutines.map((r) => r.id)}
                  userRoutinesMap={Object.fromEntries(userRoutines.map((r) => [r.id, r]))}
                  onSelectRoutine={handleSelectRoutine}
                  onResumeWorkout={handleResumeWorkout}
                  onCreateRoutine={() => setShowCreateRoutine(true)}
                  onEditRoutine={handleEditRoutine}
                  onOpenSessionDetail={(session) => {
                    setSelectedSession(session);
                    setTab('history');
                  }}
                />
              )}
              {tab === 'workouts' && (
                <WorkoutsScreen
                  routines={allRoutines}
                  userRoutineIds={userRoutines.map((r) => r.id)}
                  userRoutinesMap={Object.fromEntries(userRoutines.map((r) => [r.id, r]))}
                  onSelectRoutine={handleSelectRoutine}
                  onCreateRoutine={() => {
                    setEditingRoutine(null);
                    setShowCreateRoutine(true);
                  }}
                  onEditRoutine={handleEditRoutine}
                />
              )}
              {tab === 'history' && (
                <HistoryScreen
                  onBack={() => {
                    setSelectedSession(null);
                    setTab('home');
                  }}
                  initialSession={selectedSession}
                />
              )}
            </>
          )}
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => { setShowWorkout(false); setTab('home'); }}
          >
            <Ionicons
              name={tab === 'home' && !showWorkout ? 'home' : 'home-outline'}
              size={24}
              color={tab === 'home' && !showWorkout ? colors.primary : colors.textSubtle}
            />
            <Text style={[styles.tabLabel, tab === 'home' && !showWorkout && styles.tabLabelActive]}>
              Início
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => { setShowWorkout(false); setTab('workouts'); }}
          >
            <Ionicons
              name={tab === 'workouts' && !showWorkout ? 'barbell' : 'barbell-outline'}
              size={24}
              color={tab === 'workouts' && !showWorkout ? colors.primary : colors.textSubtle}
            />
            <Text style={[styles.tabLabel, tab === 'workouts' && !showWorkout && styles.tabLabelActive]}>
              Treinos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => { setShowWorkout(false); setTab('history'); }}
          >
            <Ionicons
              name={tab === 'history' && !showWorkout ? 'time' : 'time-outline'}
              size={24}
              color={tab === 'history' && !showWorkout ? colors.primary : colors.textSubtle}
            />
            <Text style={[styles.tabLabel, tab === 'history' && !showWorkout && styles.tabLabelActive]}>
              Histórico
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingBottom: 28,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    ...typography.tiny,
    color: colors.textSubtle,
  },
  tabLabelActive: {
    color: colors.primary,
  },
});