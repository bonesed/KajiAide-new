import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tasksReducer from './slices/tasksSlice';
import aiReducer from './slices/aiSlice';

// ストアの構成
export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    ai: aiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Firebaseのタイムスタンプなど非シリアライズ可能な値を無視
        ignoredActions: [
          'auth/login/fulfilled',
          'auth/register/fulfilled',
          'tasks/fetchAll/fulfilled',
          'ai/generateSuggestions/fulfilled',
        ],
        ignoredPaths: ['auth.user', 'tasks.tasks', 'ai.suggestions'],
      },
    }),
});

// 型定義のエクスポート
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
