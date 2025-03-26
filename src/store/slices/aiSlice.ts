import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  generateTaskSuggestions, 
  suggestTaskOrder, 
  suggestTaskDistribution, 
  optimizeSchedule 
} from '../../services/ai/suggest';

// AI提案の状態定義
interface AIState {
  suggestions: any[];
  loading: boolean;
  error: string | null;
  hasAppliedSuggestion: boolean;
}

// 初期状態
const initialState: AIState = {
  suggestions: [],
  loading: false,
  error: null,
  hasAppliedSuggestion: false,
};

// AI提案を生成
export const generateSuggestions = createAsyncThunk(
  'ai/generateSuggestions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { tasks } = getState().tasks;
      const { user } = getState().auth;
      
      // ユーザーとパートナーのスケジュール（実際の実装ではFirestoreから取得）
      const userSchedule = {}; // モック
      const partnerSchedule = {}; // モック
      
      const suggestions = generateTaskSuggestions(tasks, userSchedule, partnerSchedule);
      return suggestions;
    } catch (error) {
      return rejectWithValue('提案の生成に失敗しました');
    }
  }
);

// 提案を適用
export const applySuggestion = createAsyncThunk(
  'ai/applySuggestion',
  async (suggestionId: string, { getState, dispatch, rejectWithValue }) => {
    try {
      const { suggestions } = getState().ai;
      const suggestion = suggestions.find(s => s.id === suggestionId);
      
      if (!suggestion) {
        throw new Error('提案が見つかりません');
      }
      
      // 提案の種類に応じた処理を実装
      // 実際の実装では、ここでタスクの更新などを行う
      
      return suggestionId;
    } catch (error) {
      return rejectWithValue('提案の適用に失敗しました');
    }
  }
);

// AIスライス
const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
    resetAppliedSuggestion: (state) => {
      state.hasAppliedSuggestion = false;
    },
  },
  extraReducers: (builder) => {
    // 提案生成
    builder
      .addCase(generateSuggestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
        state.loading = false;
      })
      .addCase(generateSuggestions.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
    
    // 提案適用
      .addCase(applySuggestion.fulfilled, (state, action) => {
        state.hasAppliedSuggestion = true;
        // 適用された提案を配列から削除
        state.suggestions = state.suggestions.filter(s => s.id !== action.payload);
      });
  },
});

export const { clearSuggestions, resetAppliedSuggestion } = aiSlice.actions;
export default aiSlice.reducer;
