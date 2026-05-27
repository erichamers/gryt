import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EnduranceStackParamList } from './types';
import { colors, spacing, typography } from '../theme';

function EnduranceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Endurance</Text>
      <Text style={styles.subtitle}>Strava em breve</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.screenTop,
    paddingHorizontal: spacing.screenHorizontal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { ...typography.appTitle, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.small, color: colors.textSubtle },
});

const Stack = createNativeStackNavigator<EnduranceStackParamList>();

export default function EnduranceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Endurance" component={EnduranceScreen} />
    </Stack.Navigator>
  );
}
