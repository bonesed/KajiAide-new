import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// Firebase設定
// 注意: 実際の値はプロジェクトに合わせて設定してください
const firebaseConfig = {
    apiKey: "AIzaSyB2otaLuK1ZogV4rK2w2ziSJpfPjlRVlrQ",
    authDomain: "kajiaid.firebaseapp.com",
    projectId: "kajiaid",
    storageBucket: "kajiaid.firebasestorage.app",
    messagingSenderId: "273320822961",
    appId: "1:273320822961:web:555872ec93407f374ffa90",
    measurementId: "G-YT00XR4N7G"
  };

// Firebaseの初期化
const app = initializeApp(firebaseConfig);

// サービスのエクスポート
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;