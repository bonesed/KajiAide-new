import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as taskService from '../../firebase/taskService';

// 非同期アクション - タスク読み込み
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await taskService.fetchTasks();
      return tasks;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 非同期アクション - タスク追加
export const addTask = createAsyncThunk(
  'tasks/addTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const newTask = await taskService.addTask(taskData);
      return newTask;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 非同期アクション - タスク更新
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, taskData);
      return updatedTask;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 非同期アクション - タスク削除
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(taskId);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 非同期アクション - タスク完了状態の切り替え
export const toggleTaskCompletion = createAsyncThunk(
  'tasks/toggleTaskCompletion',
  async ({ taskId, currentStatus }, { rejectWithValue }) => {
    try {
      const result = await taskService.toggleTaskCompletion(taskId, currentStatus);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// タスクスライス
const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // タスク読み込み
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // タスク追加
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      
      // タスク更新
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      
      // タスク削除
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
      })
      
      // タスク完了状態の切り替え
      .addCase(toggleTaskCompletion.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index].completed = action.payload.completed;
        }
      });
  }
});

export default tasksSlice.reducer;