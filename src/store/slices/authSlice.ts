import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  loginUser as loginUserApi,
  registerUser as registerUserApi,
  logoutUser as logoutUserApi,
  resetPassword as resetPasswordApi,
} from '../../services/firebase/auth';
import firestore from '@react-native-firebase/firestore';

// 状態の定義
interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
  isPasswordResetSent: boolean;
}

// 初期状態
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isPasswordResetSent: false,
};

// ログイン非同期アクション
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const user = await loginUserApi(email, password);
      
      // ユーザーデータをFirestoreから取得
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        ...userData,
      };
    } catch (error) {
      let errorMessage = '認証に失敗しました。もう一度お試しください。';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'メールアドレスまたはパスワードが正しくありません。';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'ログイン試行回数が多すぎます。しばらくしてからお試しください。';
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// ユーザー登録非同期アクション
export const register = createAsyncThunk(
  'auth/register',
  async ({ 
    email, 
    password, 
    displayName 
  }: { 
    email: string; 
    password: string; 
    displayName: string 
  }, { rejectWithValue }) => {
    try {
      const user = await registerUserApi(email, password, displayName);
      
      // ユーザーデータをFirestoreから取得
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const userData = userDoc.data();
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        ...userData,
      };
    } catch (error) {
      let errorMessage = '登録に失敗しました。もう一度お試しください。';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'このメールアドレスは既に使用されています。';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'パスワードが脆弱です。より強力なパスワードを設定してください。';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'メールアドレスの形式が正しくありません。';
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// ログアウト非同期アクション
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutUserApi();
      return null;
    } catch (error) {
      return rejectWithValue('ログアウトに失敗しました。');
    }
  }
);

// パスワードリセット非同期アクション
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      await resetPasswordApi(email);
      return email;
    } catch (error) {
      let errorMessage = 'パスワードリセットに失敗しました。もう一度お試しください。';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'このメールアドレスに該当するユーザーが見つかりません。';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'メールアドレスの形式が正しくありません。';
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// 認証スライス
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetPasswordState: (state) => {
      state.isPasswordResetSent = false;
    },
  },
  extraReducers: (builder) => {
    // ログイン
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
    
    // ユーザー登録
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
    
    // ログアウト
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })
    
    // パスワードリセット
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isPasswordResetSent = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.isPasswordResetSent = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export const { clearError, resetPasswordState } = authSlice.actions;
export default authSlice.reducer;
