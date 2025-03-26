import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
    signOut,
    updateProfile,
    onAuthStateChanged
  } from 'firebase/auth';
  import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
  import { auth, db } from './config';
  
  // ユーザー登録
  export const registerUser = async (email, password, displayName) => {
    try {
      // Firebase Authでユーザー作成
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // プロフィールの表示名を設定
      await updateProfile(user, {
        displayName
      });
      
      // Firestoreにユーザー情報を保存
      await setDoc(doc(db, 'users', user.uid), {
        email,
        displayName,
        createdAt: new Date(),
        preferences: {
          theme: 'system',
          notifications: {
            reminder: true,
            dailySummary: true,
            completionSound: true
          }
        }
      });
      
      return user;
    } catch (error) {
      throw error;
    }
  };
  
  // ログイン
  export const loginUser = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };
  
  // ログアウト
  export const logoutUser = async () => {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      throw error;
    }
  };
  
  // パスワードリセット
  export const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      throw error;
    }
  };
  
  // 認証状態監視
  export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, callback);
  };
  
  // ユーザー設定の取得
  export const getUserPreferences = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return null;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        return userDoc.data().preferences;
      }
      return null;
    } catch (error) {
      console.error('ユーザー設定の取得に失敗:', error);
      return null;
    }
  };
  
  // ユーザー設定の更新
  export const updateUserPreferences = async (preferences) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('ユーザーがログインしていません');
      
      await updateDoc(doc(db, 'users', user.uid), {
        preferences
      });
      
      return true;
    } catch (error) {
      console.error('ユーザー設定の更新に失敗:', error);
      throw error;
    }
  };