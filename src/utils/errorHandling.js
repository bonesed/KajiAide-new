import { Alert, Linking } from 'react-native';
import * as Sentry from '@sentry/react-native';
import NetInfo from '@react-native-community/netinfo';

// エラータイプの定義
export const ERROR_TYPES = {
  NETWORK: 'network_error',
  AUTH: 'authentication_error',
  PERMISSION: 'permission_error',
  TIMEOUT: 'timeout_error',
  SERVER: 'server_error',
  VALIDATION: 'validation_error',
  NOT_FOUND: 'not_found_error',
  CLIENT: 'client_error',
  UNKNOWN: 'unknown_error'
};

// エラーコードからエラータイプへのマッピング
const mapHttpErrorToType = (status) => {
  if (!status) return ERROR_TYPES.UNKNOWN;
  
  if (status === 0 || status === 'ECONNABORTED') return ERROR_TYPES.NETWORK;
  if (status === 401 || status === 403) return ERROR_TYPES.AUTH;
  if (status === 404) return ERROR_TYPES.NOT_FOUND;
  if (status === 408 || status === 504) return ERROR_TYPES.TIMEOUT;
  if (status >= 400 && status < 500) return ERROR_TYPES.CLIENT;
  if (status >= 500) return ERROR_TYPES.SERVER;
  
  return ERROR_TYPES.UNKNOWN;
};

// ユーザーフレンドリーなエラーメッセージ
const getErrorMessage = (type, originalMessage = '') => {
  switch (type) {
    case ERROR_TYPES.NETWORK:
      return 'インターネット接続に問題があります。ネットワーク設定を確認してください。';
    case ERROR_TYPES.AUTH:
      return 'ログインセッションが切れたか、権限がありません。再度ログインしてください。';
    case ERROR_TYPES.PERMISSION:
      return '必要な権限がありません。アプリの設定から権限を許可してください。';
    case ERROR_TYPES.TIMEOUT:
      return 'サーバーからの応答がありません。時間をおいて再度お試しください。';
    case ERROR_TYPES.SERVER:
      return 'サーバーでエラーが発生しました。時間をおいて再度お試しください。';
    case ERROR_TYPES.VALIDATION:
      return '入力データに問題があります。入力内容を確認してください。';
    case ERROR_TYPES.NOT_FOUND:
      return '要求されたリソースが見つかりませんでした。';
    case ERROR_TYPES.CLIENT:
      return 'リクエストに問題があります。入力内容を確認してください。';
    default:
      return originalMessage || '予期しないエラーが発生しました。時間をおいて再度お試しください。';
  }
};

/**
 * グローバルエラーハンドラー
 * @param {Error} error - 発生したエラー
 * @param {Object} options - オプション設定
 * @returns {Object} 処理されたエラー情報
 */
export const handleError = async (error, options = {}) => {
  const {
    showAlert = true,
    logToSentry = true,
    context = {},
  } = options;
  
  // エラーが正規のオブジェクトでない場合の対応
  if (!error) {
    error = new Error('不明なエラーが発生しました');
  } else if (typeof error === 'string') {
    error = new Error(error);
  }
  
  // エラータイプの判別
  let errorType = ERROR_TYPES.UNKNOWN;
  let originalMessage = error.message || '';
  let errorCode = null;
  
  // Axios/Fetchエラーの場合
  if (error.response) {
    // Axiosエラー
    errorCode = error.response.status;
    errorType = mapHttpErrorToType(errorCode);
    originalMessage = error.response.data?.message || originalMessage;
  } else if (error.status) {
    // Fetchエラー
    errorCode = error.status;
    errorType = mapHttpErrorToType(errorCode);
  } else if (error.code) {
    // Firebase等のエラー
    errorCode = error.code;
    
    // Firebaseエラーコードの例
    if (errorCode.includes('auth/')) {
      errorType = ERROR_TYPES.AUTH;
    } else if (errorCode.includes('permission-denied')) {
      errorType = ERROR_TYPES.PERMISSION;
    } else if (errorCode.includes('unavailable') || errorCode.includes('network-request-failed')) {
      errorType = ERROR_TYPES.NETWORK;
    }
  }
  
  // ネットワーク接続を確認
  const netInfo = await NetInfo.fetch();
  const isConnected = netInfo.isConnected;
  
  if (!isConnected && errorType === ERROR_TYPES.UNKNOWN) {
    errorType = ERROR_TYPES.NETWORK;
  }
  
  // ユーザーフレンドリーなメッセージを取得
  const userMessage = getErrorMessage(errorType, originalMessage);
  
  // エラーを処理した形式にまとめる
  const processedError = {
    type: errorType,
    code: errorCode,
    originalMessage,
    userMessage,
    timestamp: new Date().toISOString(),
    ...context,
  };
  
  // Sentryに記録
  if (logToSentry) {
    Sentry.captureException(error, {
      extra: processedError,
    });
  }
  
  // コンソールにログ出力
  console.error('[ErrorHandler]', processedError);
  
  // ユーザーに通知
  if (showAlert) {
    Alert.alert(
      'エラーが発生しました',
      userMessage,
      [{ text: 'OK' }]
    );
  }
  
  return processedError;
};

/**
 * ネットワークエラーを処理し、回復アクションを提示
 * @param {Error} error - ネットワークエラー
 * @returns {Promise<boolean>} - 回復アクションの結果
 */
export const handleNetworkError = async (error) => {
  const netInfo = await NetInfo.fetch();
  
  if (!netInfo.isConnected) {
    return new Promise((resolve) => {
      Alert.alert(
        'ネットワークエラー',
        'インターネット接続がありません。Wi-Fiやモバイルデータ通信をオンにして、再度お試しください。',
        [
          {
            text: '設定を開く',
            onPress: () => {
              Linking.openSettings();
              resolve(false);
            },
          },
          {
            text: '再試行',
            onPress: () => {
              // 再試行処理
              NetInfo.fetch().then(state => {
                resolve(state.isConnected);
              });
            },
          },
        ],
        { cancelable: false }
      );
    });
  }
  
  // その他のネットワークエラー
  const processedError = await handleError(error, {
    showAlert: true,
    context: { networkState: netInfo },
  });
  
  return false;
};

/**
 * タイムアウトエラーを処理
 * @param {number} timeout - タイムアウト時間（ミリ秒）
 * @returns {Promise} タイムアウト付きのPromise
 */
export const withTimeout = (promise, timeout = 30000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`操作がタイムアウトしました (${timeout}ms)`));
      }, timeout);
    }),
  ]);
};

/**
 * Firebase認証エラーメッセージの変換
 * @param {string} errorCode - Firebaseエラーコード
 * @returns {string} ユーザーフレンドリーなエラーメッセージ
 */
export const getFirebaseAuthErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません。';
    case 'auth/user-disabled':
      return 'このアカウントは無効になっています。';
    case 'auth/user-not-found':
      return 'メールアドレスまたはパスワードが間違っています。';
    case 'auth/wrong-password':
      return 'メールアドレスまたはパスワードが間違っています。';
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に使用されています。';
    case 'auth/weak-password':
      return 'パスワードが脆弱です。より強力なパスワードを設定してください。';
    case 'auth/network-request-failed':
      return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
    case 'auth/too-many-requests':
      return '短時間に多くのリクエストが行われました。しばらく待ってから再度お試しください。';
    default:
      return '認証エラーが発生しました。';
  }
};