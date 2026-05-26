import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Alert,
} from 'react-native';
import { Routine, UserRoutine } from '../types';
import { colors, spacing, typography } from '../theme';

type Props = {
  routines: Routine[];
  userRoutineIds: string[];
  userRoutinesMap: Record<string, UserRoutine>;
  onSelectRoutine: (routine: Routine, isDeletable: boolean) => void;
  onCreateRoutine: () => void;
  onEditRoutine: (routine: UserRoutine) => void;
};

export default function WorkoutsScreen({
  routines,
  userRoutineIds,
  userRoutinesMap,
  onSelectRoutine,
  onCreateRoutine,
  onEditRoutine,
}: Props) {
  function handleLongPress(routine: Routine) {
    if (!userRoutineIds.includes(routine.id)) return;
    Alert.alert(routine.name, undefined, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Editar',
        onPress: () => onEditRoutine(userRoutinesMap[routine.id]),
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Treinos</Text>
      <Text style={styles.subheader}>Escolha uma rotina</Text>

      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onSelectRoutine(item, userRoutineIds.includes(item.id))}
            onLongPress={() => handleLongPress(item)}
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
          <TouchableOpacity style={styles.createButton} onPress={onCreateRoutine}>
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