import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  StatusBar,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Shadows } from '../../theme';
import Button from '../../components/common/Button';
import TextField from '../../components/common/TextField';
import Card from '../../components/common/Card';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // ログイン処理（実装時にはRedux連携）
    setTimeout(() => {
      setLoading(false);
      // 仮実装: ログイン成功とする
      console.log('ログイン成功', { email, password });
    }, 1500);
  };

  const navigateToRegister = () => {
    // navigation.navigate('Register');
    console.log('新規登録へ');
  };

  const navigateToForgotPassword = () => {
    // navigation.navigate('ForgotPassword');
    console.log('パスワード再設定へ');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Text style={styles.logo}>カジエイド</Text>
            <Text style={styles.tagline}>AI家事コンシェルジュ</Text>
          </View>
          
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>ログイン</Text>
            
            <TextField
              label="メールアドレス"
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              error={error && !email ? 'メールアドレスを入力してください' : ''}
            />
            
            <TextField
              label="パスワード"
              placeholder="パスワードを入力"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={error && !password ? 'パスワードを入力してください' : ''}
            />
            
            {error && !(!email || !password) && (
              <Text style={styles.errorText}>{error}</Text>
            )}
            
            <TouchableOpacity 
              onPress={navigateToForgotPassword}
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPasswordText}>パスワードをお忘れですか？</Text>
            </TouchableOpacity>
            
            <Button
              title="ログイン"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
              fullWidth
            />
          </Card>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>アカウントをお持ちでないですか？</Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>新規登録</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  logo: {
    ...Typography.h1,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  tagline: {
    ...Typography.body1,
    color: Colors.textLight,
  },
  formCard: {
    ...Shadows.medium,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  formTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.md,
  },
  forgotPasswordText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: Typography.medium,
  },
  loginButton: {
    marginTop: Spacing.md,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  footerText: {
    ...Typography.body2,
    color: Colors.textLight,
    marginRight: Spacing.xs,
  },
  registerLink: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: Typography.medium,
  },
});

export default LoginScreen;
