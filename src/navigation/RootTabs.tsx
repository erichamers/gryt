import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootTabParamList } from './types';
import HomeStack from './HomeStack';
import WorkoutsStack from './WorkoutsStack';
import HistoryStack from './HistoryStack';
import EnduranceStack from './EnduranceStack';
import { colors, typography } from '../theme';
import { View } from 'react-native';
import ActiveWorkoutBanner from '../components/ActiveWorkoutBanner';
import { useState } from 'react';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function RootTabs() {
  const [currentScreen, setCurrentScreen] = useState('');

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSubtle,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 0.5,
            borderTopColor: colors.border,
          },
          tabBarLabelStyle: {
            ...(typography.tiny as object),
            marginTop: -2,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: React.ComponentProps<typeof Ionicons>['name'];
            if (route.name === 'HomeTab') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'WorkoutsTab') {
              iconName = focused ? 'barbell' : 'barbell-outline';
            } else if (route.name === 'HistoryTab') {
              iconName = focused ? 'time' : 'time-outline';
            } else {
              iconName = focused ? 'bicycle' : 'bicycle-outline';
            }
            return <Ionicons name={iconName} size={24} color={color} />;
          },
        })}
        screenListeners={{
          state: (e) => {
            const state = e.data.state;
            const route = state.routes[state.index];
            const stackState = route.state;
            const screenName = stackState?.routes[(stackState?.index ?? 0)]?.name ?? '';
            const tabName = route.name;
            setCurrentScreen(tabName === 'HomeTab' ? screenName : '');
          },
        }}
      >
        <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Início' }} />
        <Tab.Screen name="WorkoutsTab" component={WorkoutsStack} options={{ tabBarLabel: 'Treinos' }} />
        <Tab.Screen name="HistoryTab" component={HistoryStack} options={{ tabBarLabel: 'Histórico' }} />
        <Tab.Screen name="EnduranceTab" component={EnduranceStack} options={{ tabBarLabel: 'Endurance' }} />
      </Tab.Navigator>
      {currentScreen !== 'Workout' && <ActiveWorkoutBanner />}
    </View>
  );
}