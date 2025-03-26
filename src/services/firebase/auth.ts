import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// ユーザー登録
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    // Firebase Auth でユーザー作成
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    
    // ユーザープロフィールの更新
    await userCredential.user.updateProfile({
      displayName,
    });
    
    // Firestoreにユーザーデータを保存
    await firestore().collection('users').doc(userCredential.user.uid).set({
      email,
      displayName,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
      preferences: {
        theme: 'light',
        notificationsEnabled: true,
        reminderTime: 30,
        weekStartsOn: 0,
        language: 'ja',
      },
      schedule: getDefaultWeeklySchedule(),
    });
    
    return userCredential.user;
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    throw error;
  }
};

// ログイン
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error('ログインエラー:', error);
    throw error;
  }
};

// ログアウト
export const logoutUser = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    console.error('ログアウトエラー:', error);
    throw error;
  }
};

// パスワードリセット
export const resetPassword = async (email: string) => {
  try {
    await auth().sendPasswordResetEmail(email);
  } catch (error) {
    console.error('パスワードリセットエラー:', error);
    throw error;
  }
};

// 現在のユーザーを取得
export const getCurrentUser = () => {
  return auth().currentUser;
};

// 認証状態の変更を監視
export const onAuthStateChanged = (callback) => {
  return auth().onAuthStateChanged(callback);
};

// デフォルトの週間スケジュール
function getDefaultWeeklySchedule() {
  const defaultDaySchedule = {
    isWorkDay: true,
    workHours: {
      start: '09:00',
      end: '18:00',
    },
    commuteTime: {
      toWork: 30,
      fromWork: 30,
    },
    availability: {
      morning: 3,
      afternoon: 2,
      evening: 5,
    },
  };
  
  const defaultWeekendSchedule = {
    isWorkDay: false,
    availability: {
      morning: 7,
      afternoon: 7,
      evening: 7,
    },
  };
  
  return {
    monday: defaultDaySchedule,
    tuesday: defaultDaySchedule,
    wednesday: defaultDaySchedule,
    thursday: defaultDaySchedule,
    friday: defaultDaySchedule,
    saturday: defaultWeekendSchedule,
    sunday: defaultWeekendSchedule,
  };
}
