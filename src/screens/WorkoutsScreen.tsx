import { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserRoutine } from '../types';
import { getUserRoutines } from '../data/storage';
import { ROUTINES } from '../data/routines';
import { colors, spacing, typography } from '../theme';
import { userRoutineToRoutine } from '../utils/routines';
import { WorkoutsStackParamList } from '../navigation/types';

type WorkoutsNavProp = NativeStackNavigationProp<WorkoutsStackParamList, 'Workouts'>;

export default function WorkoutsScreen() {
  const navigation = useNavigation<WorkoutsNavProp>();
  const [userRoutines, setUserRoutines] = useState<UserRoutine[]>([]);

  useFocusEffect(
    useCallback(() => {
      getUserRoutines().then(setUserRoutines);
    }, [])
  );

  const allRoutines = [...ROUTINES, ...userRoutines.map(userRoutineToRoutine)];
  const userRoutineIds = userRoutines.map((r) => r.id);
  const userRoutinesMap = Object.fromEntries(userRoutines.map((r) => [r.id, r]));

  function handleLongPress(routineId: string, routineName: string) {
    if (!userRoutineIds.includes(routineId)) return;
    Alert.alert(routineName, undefined, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Editar',
        onPress: () =>
          navigation.navigate('CreateRoutine', { editingRoutine: userRoutinesMap[routineId] }),
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Treinos</Text>
      <Text style={styles.subheader}>Escolha uma rotina</Text>

      <FlatList
        data={allRoutines}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('Workout', {
                routine: item,
                deletable: userRoutineIds.includes(item.id),
              })
            }
            onLongPress={() => handleLongPress(item.id, item.name)}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardExerciseCount}>{item.exercises.length}</Text>
              <Text style={styles.cardExerciseLabel}>exercícios</Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateRoutine', {})}
          >
            <Text style={styles.createButtonText}>+ Novo treino</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.screenTop,
    paddingHorizontal: spacing.screenHorizontal,
  },
  header: { ...typography.appTitle, color: colors.text },
  subheader: {
    ...typography.small,
    color: colors.textSubtle,
    marginTop: 2,
    marginBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: { flex: 1 },
  cardTitle: { ...typography.label, color: colors.text, fontWeight: '600' },
  cardSubtitle: { ...typography.small, color: colors.textSubtle, marginTop: 3 },
  cardRight: { alignItems: 'center', marginLeft: spacing.md },
  cardExerciseCount: { fontSize: 22, fontWeight: '700', color: colors.primary },
  cardExerciseLabel: { ...typography.tiny, color: colors.textSubtle },
  createButton: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: 100,
  },
  createButtonText: { ...typography.label, color: colors.textSubtle },
});
