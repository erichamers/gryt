import { NavigatorScreenParams } from '@react-navigation/native';
import { Routine, UserRoutine, WorkoutSession } from '../types';

export type HomeStackParamList = {
  Routines: undefined;
  Workout: { routine: Routine; deletable: boolean };
  CreateRoutine: { editingRoutine?: UserRoutine };
};

export type WorkoutsStackParamList = {
  Workouts: undefined;
  Workout: { routine: Routine; deletable: boolean };
  CreateRoutine: { editingRoutine?: UserRoutine };
};

export type HistoryStackParamList = {
  History: undefined;
  SessionDetail: { session: WorkoutSession };
};

export type EnduranceStackParamList = {
  Endurance: undefined;
};

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  WorkoutsTab: NavigatorScreenParams<WorkoutsStackParamList>;
  HistoryTab: NavigatorScreenParams<HistoryStackParamList>;
  EnduranceTab: NavigatorScreenParams<EnduranceStackParamList>;
};
