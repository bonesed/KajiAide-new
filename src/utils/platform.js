import { Platform } from 'react-native';

/**
 * プラットフォーム固有の値を返す関数
 * @param {Object} options - 各プラットフォーム向けの値を含むオブジェクト
 * @returns {any} プラットフォームに対応する値
 */
export const platformSpecific = (options) => {
  const { web, ios, android, default: defaultValue } = options;
  
  if (Platform.OS === 'web' && web !== undefined) {
    return web;
  }
  
  if (Platform.OS === 'ios' && ios !== undefined) {
    return ios;
  }
  
  if (Platform.OS === 'android' && android !== undefined) {
    return android;
  }
  
  return defaultValue;
};

/**
 * Webプラットフォームかどうかを判定
 * @returns {boolean} Webプラットフォームの場合true
 */
export const isWeb = Platform.OS === 'web';

/**
 * モバイルプラットフォームかどうかを判定
 * @returns {boolean} モバイルプラットフォームの場合true
 */
export const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Webでキーボードショートカットを設定
 * @param {Function} callback - ショートカットのコールバック関数
 * @param {Array<string>} keys - キーの組み合わせ
 * @param {Object} options - オプション
 * @returns {Function} クリーンアップ関数
 */
export const useKeyboardShortcut = (callback, keys, options = {}) => {
  if (!isWeb) return () => {};
  
  const { preventDefault = true } = options;
  
  const handleKeyDown = (event) => {
    const { key, ctrlKey, metaKey, altKey, shiftKey } = event;
    
    // キーの組み合わせをチェック
    const isMatch = keys.some(keyCombo => {
      const parts = keyCombo.toLowerCase().split('+');
      const mainKey = parts[parts.length - 1];
      
      const needCtrl = parts.includes('ctrl');
      const needMeta = parts.includes('meta') || parts.includes('cmd');
      const needAlt = parts.includes('alt');
      const needShift = parts.includes('shift');
      
      return (
        key.toLowerCase() === mainKey &&
        ctrlKey === needCtrl &&
        metaKey === needMeta &&
        altKey === needAlt &&
        shiftKey === needShift
      );
    });
    
    if (isMatch) {
      if (preventDefault) {
        event.preventDefault();
      }
      callback(event);
    }
  };
  
  // イベントリスナーを追加
  document.addEventListener('keydown', handleKeyDown);
  
  // クリーンアップ関数を返す
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * ウェブ向けのホバー状態を検知
 * @returns {Object} ホバー状態の検知オブジェクト
 */
export const useHover = () => {
  if (!isWeb) {
    // モバイルではホバーなし
    return { hoverProps: {}, isHovered: false };
  }
  
  const [isHovered, setIsHovered] = React.useState(false);
  
  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };
  
  return { hoverProps, isHovered };
};

/**
 * Web専用のCSSをスタイルに適用
 * @param {Object} webStyles - Web向けのスタイル
 * @param {Object} defaultStyles - デフォルトのスタイル
 * @returns {Object} 結合されたスタイル
 */
export const applyWebStyles = (webStyles, defaultStyles = {}) => {
  if (!isWeb) return defaultStyles;
  
  return {
    ...defaultStyles,
    ...webStyles,
  };
};