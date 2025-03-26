import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { useTheme } from '../theme/ThemeContext';
import * as Sentry from '@sentry/react-native';

// エラーの詳細を表示するコンポーネント
const ErrorDetails = ({ error, resetError, theme }) => (
  <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
    <View style={styles.iconContainer}>
      <Ionicons name="alert-circle" size={60} color={theme.colors.error} />
    </View>
    
    <Text style={[styles.title, { color: theme.colors.text }]}>
      エラーが発生しました
    </Text>
    
    <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
      アプリで予期しないエラーが発生しました。以下のオプションをお試しください。
    </Text>
    
    <ScrollView style={styles.errorContainer} contentContainerStyle={styles.errorContent}>
      <Text style={[styles.errorText, { color: theme.colors.error }]}>
        {error.toString()}
      </Text>
      {error.stack && (
        <Text style={[styles.stackText, { color: theme.colors.textSecondary }]}>
          {error.stack}
        </Text>
      )}
    </ScrollView>
    
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={resetError}
      >
        <Text style={styles.buttonText}>再試行</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.error }]}
        onPress={async () => {
          try {
            await Updates.reloadAsync();
          } catch (e) {
            resetError();
          }
        }}
      >
        <Text style={styles.buttonText}>アプリを再起動</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// エラーバウンダリークラスコンポーネント
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // エラー発生時の状態更新
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // エラーロギング
    console.error('エラーバウンダリーでキャッチしたエラー:', error, errorInfo);
    
    // Sentryにエラーを送信
    Sentry.captureException(error);
    
    // カスタムエラーレポート
    this.logErrorToService(error, errorInfo);
  }
  
  // エラーをリセット
  resetError = () => {
    this.setState({ hasError: false, error: null });
  };
  
  // エラーログをサービスに送信（実際の実装はプロジェクトに合わせて行う）
  logErrorToService(error, errorInfo) {
    // Firebase Analyticsなどにエラー情報を送信
    // この部分は実際のエラーロギングサービスに合わせて実装
  }

  render() {
    if (this.state.hasError) {
      // エラー状態のUI
      return (
        <ErrorDetailsWithTheme
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    // 通常のレンダリング
    return this.props.children;
  }
}

// テーマを取得するためのラッパーコンポーネント
const ErrorDetailsWithTheme = props => {
  const theme = useTheme();
  return <ErrorDetails {...props} theme={theme} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  errorContainer: {
    maxHeight: 200,
    width: '100%',
    marginBottom: 20,
  },
  errorContent: {
    padding: 10,
  },
  errorText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  stackText: {
    fontSize: 12,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ErrorBoundary;