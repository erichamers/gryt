import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { colors, spacing, typography } from '../theme';

import { Animated } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

function RightAction({ progress, dragX, onDelete }: { progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, onDelete: () => void }) {
  const translateX = dragX.interpolate({
    inputRange: [-80, 0],
    outputRange: [0, 80],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={{ transform: [{ translateX }], width: 80 }}>
    <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteText}>Deletar</Text>
    </TouchableOpacity>
    </Animated.View>
  );
}

export function SwipeableRow({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  return (
    <Swipeable
      friction={2}
      rightThreshold={40}
      renderRightActions={(progress, dragX) => (
        <RightAction progress={progress} dragX={dragX} onDelete={onDelete} />
      )}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  deleteAction: {
    width: 80,
    marginBottom: spacing.xs,
  },
    deleteButton: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    flex: 1,
    marginBottom: spacing.xs,
    borderRadius: 8,
    },
    deleteText: {
    ...typography.small,
    color: '#fff',
    fontWeight: '600',
    },
});