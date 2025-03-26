import { StyleSheet } from 'react-native';
import { isWeb } from '../utils/platform';

/**
 * Webプラットフォーム用のグローバルスタイル
 * 特にマウス操作に対応するためのスタイル調整
 */
export const webGlobalStyles = StyleSheet.create({
  // ホバー効果を付与するための基本スタイル
  touchableWithHover: {
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.2s',
  },
  
  // フォーカス時のスタイル
  focusable: {
    outlineWidth: 0,
  },
  
  // スクロールバーのカスタマイズ
  scrollableContainer: {
    scrollbarWidth: 'thin',
    scrollbarColor: '#c1c1c1 #f1f1f1',
  },
  
  // テキスト選択の挙動
  selectableText: {
    userSelect: 'text',
    cursor: 'text',
  },
  
  // 選択不可のテキスト
  nonSelectableText: {
    userSelect: 'none',
  },
  
  // ドラッグ可能なアイテム
  draggable: {
    cursor: 'grab',
  },
  
  // ドラッグ中のアイテム
  dragging: {
    cursor: 'grabbing',
  },
  
  // カード要素の共通スタイル
  card: {
    transition: 'box-shadow 0.3s, transform 0.3s',
  },
  
  // ボタンの共通スタイル
  button: {
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  
  // キーボードフォーカスを示すアウトライン
  keyboardFocus: {
    outline: '2px solid #007bff',
    outlineOffset: 2,
  },
});

/**
 * ウェブ用の特定の要素のスタイルを返す関数
 * @param {string} elementType - 要素の種類
 * @param {Object} customStyles - カスタムスタイル
 * @returns {Object} 結合されたスタイル
 */
export const getWebStyles = (elementType, customStyles = {}) => {
  if (!isWeb) return customStyles;
  
  let webSpecificStyles = {};
  
  switch (elementType) {
    case 'button':
      webSpecificStyles = {
        cursor: 'pointer',
        transition: 'background-color 0.2s, transform 0.1s',
        ':hover': {
          transform: 'translateY(-1px)',
        },
        ':active': {
          transform: 'translateY(1px)',
        },
      };
      break;
      
    case 'card':
      webSpecificStyles = {
        cursor: 'pointer',
        transition: 'box-shadow 0.3s, transform 0.3s',
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
      };
      break;
      
    case 'input':
      webSpecificStyles = {
        cursor: 'text',
        ':focus': {
          outlineColor: '#007bff',
          outlineWidth: 2,
          outlineOffset: 2,
          outlineStyle: 'solid',
        },
      };
      break;
      
    case 'checkbox':
      webSpecificStyles = {
        cursor: 'pointer',
        ':hover': {
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
        },
      };
      break;
      
    case 'link':
      webSpecificStyles = {
        cursor: 'pointer',
        textDecorationLine: 'none',
        ':hover': {
          textDecorationLine: 'underline',
        },
      };
      break;
      
    case 'menu':
      webSpecificStyles = {
        cursor: 'default',
        userSelect: 'none',
      };
      break;
      
    case 'scrollbar':
      webSpecificStyles = {
        scrollbarWidth: 'thin',
        scrollbarColor: '#c1c1c1 #f1f1f1',
        '::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '::-webkit-scrollbar-track': {
          backgroundColor: '#f1f1f1',
          borderRadius: 4,
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: '#c1c1c1',
          borderRadius: 4,
          ':hover': {
            backgroundColor: '#a8a8a8',
          },
        },
      };
      break;
  }
  
  return {
    ...customStyles,
    ...webSpecificStyles,
  };
};

/**
 * ホバー状態を管理するフック (Webのみ)
 * @returns {Object} ホバー関連の状態とハンドラー
 */
export const useHoverState = () => {
  if (!isWeb) {
    // モバイルでは意味がないので空のオブジェクトを返す
    return {
      isHovered: false,
      hoverProps: {},
      getHoverStyle: () => ({}),
    };
  }
  
  const [isHovered, setIsHovered] = React.useState(false);
  
  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onFocus: () => setIsHovered(true),
    onBlur: () => setIsHovered(false),
  };
  
  const getHoverStyle = (baseStyle, hoverStyle) => {
    return isHovered ? { ...baseStyle, ...hoverStyle } : baseStyle;
  };
  
  return {
    isHovered,
    hoverProps,
    getHoverStyle,
  };
};

/**
 * Web用にスタイルを適用する関数
 * モバイルでは何もしない
 * @param {Object} styles - スタイルオブジェクト
 * @returns {Object} 処理されたスタイル
 */
export const applyWebStyles = (styles) => {
  if (!isWeb) return styles;
  
  // CSSプロパティをReact Native Web互換に変換
  const processedStyles = { ...styles };
  
  // 特殊なプロパティの変換
  const cssProperties = [
    'userSelect',
    'cursor',
    'transition',
    'transform',
    'animation',
    'boxShadow',
    'textDecoration',
    'outline',
  ];
  
  cssProperties.forEach(prop => {
    if (styles[prop]) {
      processedStyles[prop] = styles[prop];
    }
  });
  
  return processedStyles;
};