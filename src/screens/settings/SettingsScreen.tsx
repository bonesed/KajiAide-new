import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../store/hooks/useRedux';
import { logout } from '../../store/slices/authSlice';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '../../theme';
import Card from '../../components/common/Card';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  // 設定の状態
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(30); // 分単位
  
  // ログアウト処理
  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'ログアウト', 
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
          }
        },
      ]
    );
  };
  
  // パートナー連携画面へ移動
  const navigateToPartnerConnect = () => {
    // navigation.navigate('PartnerConnect');
    console.log('パートナー連携へ');
  };
  
  // プロフィール編集画面へ移動
  const navigateToEditProfile = () => {
    // navigation.navigate('EditProfile');
    console.log('プロフィール編集へ');
  };
  
  // アプリケーション情報画面へ移動
  const navigateToAbout = () => {
    // navigation.navigate('About');
    console.log('アプリケーション情報へ');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>設定</Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* プロフィールセクション */}
        <Card style={styles.profileCard}>
          <View style={styles.profileContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.displayName ? user.displayName[0].toUpperCase() : 'G'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.displayName || 'ゲスト'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'guest@example.com'}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={navigateToEditProfile}
          >
            <Text style={styles.editProfileButtonText}>プロフィール編集</Text>
          </TouchableOpacity>
        </Card>
        
        {/* パートナー連携セクション */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>パートナー連携</Text>
          {user?.partnerId ? (
            <View style={styles.partnerConnected}>
              <Text style={styles.partnerName}>パートナー：鈴木花子</Text>
              <TouchableOpacity style={styles.disconnectButton}>
                <Text style={styles.disconnectButtonText}>連携解除</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.partnerNotConnected}>
              <Text style={styles.partnerNotConnectedText}>
                パートナーとの連携で家事分担を効率化します
              </Text>
              <TouchableOpacity 
                style={styles.connectButton}
                onPress={navigateToPartnerConnect}
              >
                <Text style={styles.connectButtonText}>パートナーと連携する</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
        
        {/* 通知設定セクション */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>通知設定</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>通知</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.background}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>リマインダー（タスク開始前）</Text>
            <View style={styles.reminderSelector}>
              {[15, 30, 60].map(time => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.reminderOption,
                    reminderTime === time && styles.selectedReminderOption
                  ]}
                  onPress={() => setReminderTime(time)}
                >
                  <Text 
                    style={[
                      styles.reminderOptionText,
                      reminderTime === time && styles.selectedReminderOptionText
                    ]}
                  >
                    {time}分前
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>
        
        {/* 表示設定セクション */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>表示設定</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>ダークモード</Text>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.background}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>週の開始日</Text>
            <View style={styles.weekStartSelector}>
              <TouchableOpacity style={[styles.weekOption, styles.selectedWeekOption]}>
                <Text style={styles.selectedWeekOptionText}>日曜日</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.weekOption}>
                <Text style={styles.weekOptionText}>月曜日</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
        
        {/* その他セクション */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>その他</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={navigateToAbout}
          >
            <Text style={styles.menuItemText}>アプリケーション情報</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>お問い合わせ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>利用規約</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>プライバシーポリシー</Text>
          </TouchableOpacity>
        </Card>
        
        {/* ログアウトボタン */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>ログアウト</Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: Spacing.lg,
    padding: Spacing.lg,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    ...Typography.h2,
    color: Colors.background,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    ...Typography.body2,
    color: Colors.textLight,
  },
  editProfileButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editProfileButtonText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: Typography.medium,
  },
  sectionCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  partnerConnected: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerName: {
    ...Typography.body1,
    color: Colors.text,
  },
  disconnectButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  disconnectButtonText: {
    ...Typography.caption,
    color: Colors.error,
  },
  partnerNotConnected: {
    alignItems: 'center',
  },
  partnerNotConnectedText: {
    ...Typography.body2,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  connectButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
  },
  connectButtonText: {
    ...Typography.body2,
    color: Colors.background,
    fontWeight: Typography.medium,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  settingLabel: {
    ...Typography.body1,
    color: Colors.text,
  },
  reminderSelector: {
    flexDirection: 'row',
  },
  reminderOption: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.xs,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedReminderOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  reminderOptionText: {
    ...Typography.caption,
    color: Colors.text,
  },
  selectedReminderOptionText: {
    color: Colors.background,
    fontWeight: Typography.medium,
  },
  weekStartSelector: {
    flexDirection: 'row',
  },
  weekOption: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.xs,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedWeekOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  weekOptionText: {
    ...Typography.caption,
    color: Colors.text,
  },
  selectedWeekOptionText: {
    color: Colors.background,
    fontWeight: Typography.medium,
  },
  menuItem: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemText: {
    ...Typography.body1,
    color: Colors.text,
  },
  logoutButton: {
    margin: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: 'center',
  },
  logoutButtonText: {
    ...Typography.body1,
    color: Colors.error,
    fontWeight: Typography.medium,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  versionText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});

export default SettingsScreen;
