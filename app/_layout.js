import React from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { TransitionPresets } from '@react-navigation/stack';
import { useTheme } from '../src/theme/ThemeContext';

// カスタムトランジション設定
const customTransition = {
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 300,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 300,
      },
    },
  },
  cardStyleInterpolator: ({ current, next, layouts }) => {
    return {
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.width, 0],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    };
  },
};

export default function RootLayout() {
  const theme = useTheme();

  // iOSとAndroidでトランジションを分ける
  const transitionPreset = Platform.select({
    ios: TransitionPresets.SlideFromRightIOS,
    android: customTransition,
  });

  return (
    <Stack
      screenOptions={{
        ...transitionPreset,
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      
      <Stack.Screen
        name="task/[id]"
        options={{
          title: 'タスク詳細',
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      
      <Stack.Screen
        name="task/edit"
        options={{
          title: 'タスク編集',
          presentation: 'modal',
          ...Platform.select({
            ios: TransitionPresets.ModalPresentationIOS,
            android: TransitionPresets.RevealFromBottomAndroid,
          }),
        }}
      />
      
      <Stack.Screen
        name="ai/suggestions"
        options={{
          title: 'AI提案',
          ...Platform.select({
            ios: TransitionPresets.ModalSlideFromBottomIOS,
            android: TransitionPresets.FadeFromBottomAndroid,
          }),
        }}
      />
    </Stack>
  );
}