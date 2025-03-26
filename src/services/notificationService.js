import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 通知の設定
export const configureNotifications = async () => {
  // デバイスがモバイルの場合のみ通知の設定を行う
  if (Device.isDevice) {
    // 通知ハンドラの設定
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Android向け通知チャンネルの設定
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'デフォルト',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
      
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'リマインダー',
        description: 'タスクのリマインダー通知',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: true,
      });
      
      await Notifications.setNotificationChannelAsync('daily-summary', {
        name: 'デイリーサマリー',
        description: '毎日の予定通知',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        sound: true,
      });
    }
  }
};

// 通知権限の取得
export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    console.log('物理デバイスのみ通知が使用できます');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // すでに許可されていない場合は許可を求める
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('通知許可が得られませんでした');
      return null;
    }
    
    // デバイストークンの取得
    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra?.eas?.projectId,
    });
    
    return expoPushToken.data;
  } catch (error) {
    console.error('通知トークンの取得に失敗:', error);
    return null;
  }
};

// ローカル通知の予約
export const scheduleTaskReminder = async (task) => {
  try {
    // 通知設定がオフの場合はスキップ
    const reminderEnabled = await AsyncStorage.getItem('notification_reminder');
    if (reminderEnabled === 'false') return null;
    
    // 期限日がない場合はスキップ
    if (!task.dueDate) return null;
    
    const dueDate = new Date(task.dueDate);
    
    // リマインダーの時間設定（期限の1時間前）
    const reminderTime = new Date(dueDate);
    reminderTime.setHours(reminderTime.getHours() - 1);
    
    // 現在時刻より後の場合のみ通知をスケジュール
    if (reminderTime > new Date()) {
      // 既存の通知がある場合は削除
      if (task.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(task.notificationId);
      }
      
      // 新しい通知をスケジュール
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'タスクリマインダー',
          body: `「${task.title}」の期限が1時間後に迫っています`,
          data: { taskId: task.id },
          sound: true,
        },
        trigger: {
          date: reminderTime,
        },
        channelId: 'reminders',
      });
      
      return notificationId;
    }
    
    return null;
  } catch (error) {
    console.error('タスクリマインダーの設定に失敗:', error);
    return null;
  }
};

// デイリーサマリーの通知を設定
export const scheduleDailySummary = async (tasks) => {
  try {
    // 通知設定がオフの場合はスキップ
    const dailySummaryEnabled = await AsyncStorage.getItem('notification_daily_summary');
    if (dailySummaryEnabled === 'false') return null;
    
    // 翌日の朝8時に設定
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    
    // 今日の日付で絞り込み
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate >= today && taskDate <= todayEnd;
    });
    
    // 既存のデイリーサマリー通知をキャンセル
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // 通知内容の作成
    let body = '';
    if (todayTasks.length > 0) {
      body = `今日は${todayTasks.length}件のタスクがあります。`;
      if (todayTasks.length <= 3) {
        body += todayTasks.map(task => `・${task.title}`).join('\n');
      }
    } else {
      body = '今日予定されているタスクはありません。';
    }
    
    // 新しい通知をスケジュール
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '今日のタスク',
        body,
        sound: true,
        data: { type: 'daily-summary' },
      },
      trigger: {
        date: tomorrow,
        repeats: true,
      },
      channelId: 'daily-summary',
    });
    
    return notificationId;
  } catch (error) {
    console.error('デイリーサマリー通知の設定に失敗:', error);
    return null;
  }
};

// 通知の受信処理
export const handleNotificationResponse = (response) => {
  const data = response.notification.request.content.data;
  
  // タスク詳細へのナビゲーション処理などをここに記述
  if (data?.taskId) {
    // タスク詳細画面へナビゲーション
    // この部分はナビゲーションコンテキストに応じて適宜実装
    console.log('タスク詳細へ遷移:', data.taskId);
    // navigation.navigate('TaskDetail', { id: data.taskId });
  }
};

// 通知のリスナー設定
export const setupNotificationListeners = () => {
  // 通知を受け取った時のリスナー
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('通知を受信:', notification);
  });
  
  // 通知をタップした時のリスナー
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    handleNotificationResponse(response);
  });
  
  return {
    remove: () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    }
  };
};

// タスクの通知をキャンセル
export const cancelTaskNotification = async (notificationId) => {
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
};

// すべての通知をキャンセル
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};