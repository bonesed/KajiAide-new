import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme, useThemeUpdate } from '../../src/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// スイッチ付きの設定項目コンポーネント
const SettingsSwitchItem = ({ icon, title, value, onValueChange, description }) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.settingItemContent}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.backgroundSecondary }]}>
          <Ionicons name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
          {description && (
            <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#767577', true: theme.colors.primaryLight }}
        thumbColor={value ? theme.colors.primary : '#f4f3f4'}
      />
    </View>
  );
};

// 押せる設定項目コンポーネント
const SettingsButton = ({ icon, title, onPress, description, rightText }) => {
  const theme = useTheme();
  
  return (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: theme.colors.border }]} 
      onPress={onPress}
    >
      <View style={styles.settingItemContent}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.backgroundSecondary }]}>
          <Ionicons name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
          {description && (
            <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingItemRight}>
        {rightText && (
          <Text style={[styles.rightText, { color: theme.colors.textSecondary }]}>{rightText}</Text>
        )}
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
};

// 設定セクションのヘッダー
const SectionHeader = ({ title }) => {
  const theme = useTheme();
  
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>{title}</Text>
    </View>
  );
};

export default function SettingsScreen() {
  const theme = useTheme();
  const toggleTheme = useThemeUpdate();
  const dispatch = useDispatch();
  
  // 通知設定のステート
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [dailySummaryEnabled, setDailySummaryEnabled] = useState(true);
  const [completionSoundEnabled, setCompletionSoundEnabled] = useState(true);
  
  // 通知許可の確認と設定
  const checkAndRequestNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      return newStatus === 'granted';
    }
    return true;
  };

  // 通知設定を切り替える
  const toggleNotificationSetting = async (settingName, value, setter) => {
    if (value && !await checkAndRequestNotificationPermission()) {
      Alert.alert(
        '通知許可が必要です',
        'この機能を有効にするには、アプリの通知を許可してください。',
        [{ text: '閉じる' }]
      );
      return;
    }
    setter(value);
    try {
      await AsyncStorage.setItem(`notification_${settingName}`, value.toString());
    } catch (e) {
      console.error('通知設定の保存に失敗しました', e);
    }
  };

  // テーマ選択ダイアログを表示
  const showThemeOptions = () => {
    Alert.alert(
      'テーマ設定',
      '表示テーマを選択してください',
      [
        {
          text: 'ライト',
          onPress: () => toggleTheme('light')
        },
        {
          text: 'ダーク',
          onPress: () => toggleTheme('dark')
        },
        {
          text: 'システム設定に合わせる',
          onPress: () => toggleTheme('system')
        },
        {
          text: 'キャンセル',
          style: 'cancel'
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SectionHeader title="アプリ設定" />
      
      <SettingsButton
        icon="color-palette-outline"
        title="テーマ"
        onPress={showThemeOptions}
        rightText={theme.mode === 'system' ? 'システム' : (theme.mode === 'dark' ? 'ダーク' : 'ライト')}
      />

      <SectionHeader title="通知" />
      
      <SettingsSwitchItem
        icon="notifications-outline"
        title="リマインダー"
        description="タスクの期限が近づいたときに通知"
        value={reminderEnabled}
        onValueChange={(value) => toggleNotificationSetting('reminder', value, setReminderEnabled)}
      />
      
      <SettingsSwitchItem
        icon="sunny-outline"
        title="デイリーサマリー"
        description="毎朝、今日のタスクを通知"
        value={dailySummaryEnabled}
        onValueChange={(value) => toggleNotificationSetting('daily_summary', value, setDailySummaryEnabled)}
      />
      
      <SettingsSwitchItem
        icon="volume-high-outline"
        title="完了サウンド"
        description="タスク完了時に音を鳴らす"
        value={completionSoundEnabled}
        onValueChange={setCompletionSoundEnabled}
      />

      <SectionHeader title="データ管理" />
      
      <SettingsButton
        icon="cloud-upload-outline"
        title="データのバックアップ"
        description="タスクと設定をクラウドに保存"
        onPress={() => {
          // バックアップ実行ロジック
          Alert.alert('バックアップ', 'この機能は近日実装予定です');
        }}
      />
      
      <SettingsButton
        icon="cloud-download-outline"
        title="データの復元"
        description="バックアップからデータを復元"
        onPress={() => {
          // リストア実行ロジック
          Alert.alert('データ復元', 'この機能は近日実装予定です');
        }}
      />
      
      <SettingsButton
        icon="trash-outline"
        title="すべてのデータを削除"
        description="アプリのデータをリセット"
        onPress={() => {
          Alert.alert(
            'データ削除の確認',
            'すべてのタスクと設定が削除されます。この操作は元に戻せません。',
            [
              {
                text: 'キャンセル',
                style: 'cancel'
              },
              {
                text: '削除',
                style: 'destructive',
                onPress: () => {
                  // データ削除ロジック
                  // ReduxストアのリセットとAsyncStorageのクリア
                }
              }
            ]
          );
        }}
      />

      <SectionHeader title="アプリについて" />
      
      <SettingsButton
        icon="information-circle-outline"
        title="バージョン情報"
        rightText="1.0.0"
        onPress={() => {
          // バージョン情報画面へ
        }}
      />
      
      <SettingsButton
        icon="help-circle-outline"
        title="ヘルプ＆サポート"
        onPress={() => {
          // サポート画面へ
        }}
      />
      
      <SettingsButton
        icon="document-text-outline"
        title="利用規約・プライバシーポリシー"
        onPress={() => {
          // 規約画面へ
        }}
      />
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          カジエイド - AI家事コンシェルジュ
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightText: {
    marginRight: 8,
    fontSize: 14,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
});