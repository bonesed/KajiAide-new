import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../store/hooks/useRedux';
import { Colors, Spacing } from '../theme';

// 認証関連の画面
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// メイン画面
import HomeScreen from '../screens/home/HomeScreen';
import TasksScreen from '../screens/tasks/TasksScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import TaskFormScreen from '../screens/tasks/TaskFormScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import AIRecommendationsScreen from '../screens/ai/AIRecommendationsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// ナビゲーションのタイプ定義
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

type HomeStackParamList = {
  Home: undefined;
};

type TasksStackParamList = {
  TasksList: undefined;
  TaskDetail: { taskId: string };
  TaskForm: { taskId?: string; initialDate?: string };
};

type CalendarStackParamList = {
  Calendar: undefined;
};

type AIStackParamList = {
  AIRecommendations: undefined;
};

type SettingsStackParamList = {
  Settings: undefined;
};

type MainTabParamList = {
  HomeStack: undefined;
  TasksStack: undefined;
  CalendarStack: undefined;
  AIStack: undefined;
  SettingsStack: undefined;
};

// スタックナビゲーター
const AuthStack = createStackNavigator<AuthStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const TasksStack = createStackNavigator<TasksStackParamList>();
const CalendarStack = createStackNavigator<CalendarStackParamList>();
const AIStack = createStackNavigator<AIStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// 認証スタックナビゲーター
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// ホームスタックナビゲーター
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
};

// タスクスタックナビゲーター
const TasksStackNavigator = () => {
  return (
    <TasksStack.Navigator>
      <TasksStack.Screen 
        name="TasksList" 
        component={TasksScreen} 
        options={{ headerShown: false }}
      />
      <TasksStack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen} 
        options={{ headerTitle: 'タスク詳細' }}
      />
      <TasksStack.Screen 
        name="TaskForm" 
        component={TaskFormScreen} 
        options={({ route }) => ({ 
          headerTitle: route.params?.taskId ? 'タスク編集' : '新規タスク作成'
        })}
      />
    </TasksStack.Navigator>
  );
};

// カレンダースタックナビゲーター
const CalendarStackNavigator = () => {
  return (
    <CalendarStack.Navigator>
      <CalendarStack.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{ headerShown: false }}
      />
    </CalendarStack.Navigator>
  );
};

// AIスタックナビゲーター
const AIStackNavigator = () => {
  return (
    <AIStack.Navigator>
      <AIStack.Screen 
        name="AIRecommendations" 
        component={AIRecommendationsScreen} 
        options={{ headerShown: false }}
      />
    </AIStack.Navigator>
  );
};

// 設定スタックナビゲーター
const SettingsStackNavigator
cat > src/navigation/index.tsx << 'EOL'
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../store/hooks/useRedux';
import { Colors, Spacing } from '../theme';

// 認証関連の画面
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// メイン画面
import HomeScreen from '../screens/home/HomeScreen';
import TasksScreen from '../screens/tasks/TasksScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import TaskFormScreen from '../screens/tasks/TaskFormScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import AIRecommendationsScreen from '../screens/ai/AIRecommendationsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// ナビゲーションのタイプ定義
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

type HomeStackParamList = {
  Home: undefined;
};

type TasksStackParamList = {
  TasksList: undefined;
  TaskDetail: { taskId: string };
  TaskForm: { taskId?: string; initialDate?: string };
};

type CalendarStackParamList = {
  Calendar: undefined;
};

type AIStackParamList = {
  AIRecommendations: undefined;
};

type SettingsStackParamList = {
  Settings: undefined;
};

type MainTabParamList = {
  HomeStack: undefined;
  TasksStack: undefined;
  CalendarStack: undefined;
  AIStack: undefined;
  SettingsStack: undefined;
};

// スタックナビゲーター
const AuthStack = createStackNavigator<AuthStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const TasksStack = createStackNavigator<TasksStackParamList>();
const CalendarStack = createStackNavigator<CalendarStackParamList>();
const AIStack = createStackNavigator<AIStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// 認証スタックナビゲーター
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// ホームスタックナビゲーター
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
};

// タスクスタックナビゲーター
const TasksStackNavigator = () => {
  return (
    <TasksStack.Navigator>
      <TasksStack.Screen 
        name="TasksList" 
        component={TasksScreen} 
        options={{ headerShown: false }}
      />
      <TasksStack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen} 
        options={{ headerTitle: 'タスク詳細' }}
      />
      <TasksStack.Screen 
        name="TaskForm" 
        component={TaskFormScreen} 
        options={({ route }) => ({ 
          headerTitle: route.params?.taskId ? 'タスク編集' : '新規タスク作成'
        })}
      />
    </TasksStack.Navigator>
  );
};

// カレンダースタックナビゲーター
const CalendarStackNavigator = () => {
  return (
    <CalendarStack.Navigator>
      <CalendarStack.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{ headerShown: false }}
      />
    </CalendarStack.Navigator>
  );
};

// AIスタックナビゲーター
const AIStackNavigator = () => {
  return (
    <AIStack.Navigator>
      <AIStack.Screen 
        name="AIRecommendations" 
        component={AIRecommendationsScreen} 
        options={{ headerShown: false }}
      />
    </AIStack.Navigator>
  );
};

// 設定スタックナビゲーター
const SettingsStackNavigator = () => {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ headerShown: false }}
      />
    </SettingsStack.Navigator>
  );
};

// メインタブナビゲーター
const MainNavigator = () => {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeStack') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'TasksStack') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'CalendarStack') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'AIStack') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          } else if (route.name === 'SettingsStack') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        headerShown: false,
      })}
    >
      <MainTab.Screen 
        name="HomeStack" 
        component={HomeStackNavigator} 
        options={{ tabBarLabel: 'ホーム' }}
      />
      <MainTab.Screen 
        name="TasksStack" 
        component={TasksStackNavigator} 
        options={{ tabBarLabel: 'タスク' }}
      />
      <MainTab.Screen 
        name="CalendarStack" 
        component={CalendarStackNavigator} 
        options={{ tabBarLabel: 'カレンダー' }}
      />
      <MainTab.Screen 
        name="AIStack" 
        component={AIStackNavigator} 
        options={{ tabBarLabel: 'AI提案' }}
      />
      <MainTab.Screen 
        name="SettingsStack" 
        component={SettingsStackNavigator} 
        options={{ tabBarLabel: '設定' }}
      />
    </MainTab.Navigator>
  );
};

// メインナビゲーション
const AppNavigator = () => {
  // 認証状態を管理（本番環境ではReduxと連携）
  const [isLoggedIn, setIsLoggedIn] = useState(true); // 開発用に常にtrueに設定
  
  return (
    <NavigationContainer>
      {isLoggedIn ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
