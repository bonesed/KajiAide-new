import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// キャッシュのデフォルト有効期限 (10分)
const DEFAULT_CACHE_EXPIRY = 10 * 60 * 1000;

// APIリクエストのキャッシュ設定
export const API_CACHE_CONFIG = {
  TASKS: {
    key: 'cache_tasks',
    expiry: 5 * 60 * 1000 // 5分
  },
  USER_PREFERENCES: {
    key: 'cache_user_prefs',
    expiry: 60 * 60 * 1000 // 1時間
  },
  AI_SUGGESTIONS: {
    key: 'cache_ai_suggestions',
    expiry: 24 * 60 * 60 * 1000 // 24時間
  }
};

// ネットワーク接続状態を監視
let isConnected = true;
NetInfo.addEventListener(state => {
  isConnected = state.isConnected;
});

/**
 * キャッシュ対応のフェッチ関数
 * @param {string} url - フェッチするURL
 * @param {Object} options - フェッチオプション
 * @param {Object} cacheConfig - キャッシュ設定
 * @returns {Promise<Object>} レスポンスデータ
 */
export const fetchWithCache = async (url, options = {}, cacheConfig = {}) => {
  const { key, expiry = DEFAULT_CACHE_EXPIRY } = cacheConfig;
  
  // キャッシュキーが指定されていない場合は通常のフェッチ
  if (!key) {
    return fetch(url, options).then(res => res.json());
  }

  try {
    // キャッシュからデータを取得
    const cachedData = await AsyncStorage.getItem(key);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const isExpired = Date.now() - timestamp > expiry;
      
      // キャッシュが有効期限内かつネットワークが切断されている場合はキャッシュを使用
      if (!isExpired || !isConnected) {
        return data;
      }
    }
    
    // キャッシュがない、期限切れ、またはネットワーク接続があれば新しいデータを取得
    if (isConnected) {
      const response = await fetch(url, options);
      const data = await response.json();
      
      // キャッシュを更新
      await AsyncStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
      
      return data;
    } else if (cachedData) {
      // ネットワークがなくキャッシュがある場合は期限切れでも使用
      return JSON.parse(cachedData).data;
    }
    
    throw new Error('ネットワーク接続がなく、キャッシュデータもありません');
  } catch (error) {
    console.error('キャッシュフェッチエラー:', error);
    throw error;
  }
};

/**
 * バッテリーに優しいフェッチ - バッテリー節約モードでの動作を最適化
 * @param {Function} fetchFunction - 実行するフェッチ関数
 * @param {boolean} isEssential - 必須操作かどうか
 * @returns {Promise<any>} フェッチ結果
 */
export const powerEfficientFetch = async (fetchFunction, isEssential = false) => {
  // iOSの場合、Low Power Modeの状態はネイティブモジュールが必要
  // ここではNetInfoの接続タイプで代用
  const netInfo = await NetInfo.fetch();
  
  // バッテリー節約条件の判定
  const shouldOptimize = 
    (Platform.OS === 'ios' && netInfo.type !== 'wifi') || 
    (Platform.OS === 'android' && netInfo.isConnectionExpensive);
  
  if (shouldOptimize && !isEssential) {
    // 非必須操作は接続状態が良くなるまで遅延
    console.log('バッテリー節約のため操作を最適化します');
    return new Promise((resolve) => {
      const checkAndExecute = async () => {
        const currentInfo = await NetInfo.fetch();
        if (currentInfo.type === 'wifi' || isConnected === false) {
          // Wi-Fi接続時または接続なしの場合は実行
          try {
            const result = await fetchFunction();
            resolve(result);
          } catch (error) {
            console.error('遅延実行エラー:', error);
            resolve(null);
          }
        } else {
          // 10秒後に再試行
          setTimeout(checkAndExecute, 10000);
        }
      };
      
      checkAndExecute();
    });
  }
  
  // 通常の実行
  return fetchFunction();
};

/**
 * キャッシュを無効化
 * @param {string} key - キャッシュキー、未指定の場合はすべて
 */
export const invalidateCache = async (key = null) => {
  try {
    if (key) {
      await AsyncStorage.removeItem(key);
    } else {
      // すべてのキャッシュキーを削除
      const allKeys = Object.values(API_CACHE_CONFIG).map(config => config.key);
      await Promise.all(allKeys.map(k => AsyncStorage.removeItem(k)));
    }
  } catch (error) {
    console.error('キャッシュ無効化エラー:', error);
  }
};

/**
 * ネットワーク状態を取得
 * @returns {Promise<Object>} ネットワーク状態
 */
export const getNetworkStatus = async () => {
  return NetInfo.fetch();
};