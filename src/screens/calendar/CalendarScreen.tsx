import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useAppSelector, useAppDispatch } from '../../store/hooks/useRedux';
import { fetchTasks, selectTask } from '../../store/slices/tasksSlice';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '../../theme';

// 日本語のカレンダー設定
LocaleConfig.locales['ja'] = {
  monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
  today: '今日'
};
LocaleConfig.defaultLocale = 'ja';

const CalendarScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { tasks, loading } = useAppSelector(state => state.tasks);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // タスクの取得
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);
  
  // 選択した日付のタスクをフィルタリング
  const filteredTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate.toISOString().split('T')[0] === selectedDate;
  });
  
  // カレンダーのマーク付きの日付を作成
  const getMarkedDates = () => {
    const markedDates = {};
    
    // 選択日のスタイル
    markedDates[selectedDate] = { 
      selected: true, 
      selectedColor: Colors.primary 
    };
    
    // タスクがある日のスタイル
    tasks.forEach(task => {
      if (!task.dueDate) return;
      
      const dateString = new Date(task.dueDate).toISOString().split('T')[0];
      
      if (dateString === selectedDate) return; // 選択日は上で設定済み
      
      if (markedDates[dateString]) {
        // 既に他のタスクでマークされている場合はドットを追加
        markedDates[dateString].dots = [
          ...(markedDates[dateString].dots || []),
          { color: getPriorityColor(task.priority) }
        ];
      } else {
        // 初めてのマークの場合
        markedDates[dateString] = {
          dots: [{ color: getPriorityColor(task.priority) }],
          marked: true
        };
      }
    });
    
    return markedDates;
  };
  
  // タスク詳細画面へ移動
  const navigateToTaskDetail = (taskId) => {
    dispatch(selectTask(taskId));
    navigation.navigate('TasksStack', {
      screen: 'TaskDetail',
      params: { taskId }
    });
  };
  
  // タスク作成画面へ移動
  const navigateToCreateTask = () => {
    navigation.navigate('TasksStack', {
      screen: 'TaskForm',
      params: { initialDate: selectedDate }
    });
  };
  
  // タスクアイテムのレンダリング
  const renderTaskItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.taskItem} 
        onPress={() => navigateToTaskDetail(item.id)}
      >
        <View style={[styles.taskPriority, { backgroundColor: getPriorityColor(item.priority) }]} />
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <View style={styles.taskMetaContainer}>
            <View style={styles.taskCategory}>
              <Text style={styles.taskCategoryText}>{getCategoryLabel(item.category)}</Text>
            </View>
            <Text style={styles.taskDuration}>{item.estimatedDuration}分</Text>
          </View>
        </View>
        <View style={[styles.taskStatus, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.taskStatusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  // 選択された日付のフォーマット（例: 2023年3月15日（水））
  const formatSelectedDate = () => {
    const date = new Date(selectedDate);
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    };
    return date.toLocaleDateString('ja-JP', options);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>カレンダー</Text>
      </View>
      
      <Calendar
        markingType={'multi-dot'}
        markedDates={getMarkedDates()}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        monthFormat={'yyyy年 MM月'}
        theme={{
          calendarBackground: Colors.background,
          textSectionTitleColor: Colors.textLight,
          selectedDayBackgroundColor: Colors.primary,
          selectedDayTextColor: Colors.background,
          todayTextColor: Colors.primary,
          dayTextColor: Colors.text,
          textDisabledColor: Colors.textMuted,
          dotColor: Colors.primary,
          selectedDotColor: Colors.background,
          arrowColor: Colors.primary,
          monthTextColor: Colors.text,
          indicatorColor: Colors.primary,
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '400',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13
        }}
      />
      
      <View style={styles.selectedDateContainer}>
        <Text style={styles.selectedDateText}>{formatSelectedDate()}</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={navigateToCreateTask}
        >
          <Text style={styles.addButtonText}>タスク追加</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tasksContainer}>
        <Text style={styles.sectionTitle}>タスク一覧</Text>
        
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="large" style={styles.loader} />
        ) : filteredTasks.length > 0 ? (
          <FlatList
            data={filteredTasks}
            keyExtractor={item => item.id}
            renderItem={renderTaskItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>この日のタスクはありません</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// ユーティリティ関数
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return Colors.error;
    case 'medium': return Colors.warning;
    default: return Colors.accent;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return Colors.success;
    case 'in-progress': return Colors.primary;
    case 'skipped': return Colors.textMuted;
    default: return Colors.warning;
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'pending': return '未着手';
    case 'in-progress': return '進行中';
    case 'completed': return '完了';
    case 'skipped': return 'スキップ';
    default: return '未着手';
  }
};

const getCategoryLabel = (category) => {
  switch (category) {
    case 'cleaning': return '掃除';
    case 'laundry': return '洗濯';
    case 'cooking': return '料理';
    case 'shopping': return '買い物';
    case 'maintenance': return 'メンテナンス';
    default: return 'その他';
  }
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
  selectedDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedDateText: {
    ...Typography.body1,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  addButtonText: {
    ...Typography.caption,
    fontWeight: Typography.medium,
    color: Colors.background,
  },
  tasksContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  taskItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.small,
  },
  taskPriority: {
    width: 4,
    height: '100%',
  },
  taskContent: {
    flex: 1,
    padding: Spacing.md,
  },
  taskTitle: {
    ...Typography.body1,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  taskMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCategory: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
  },
  taskCategoryText: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  taskDuration: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: Typography.medium,
  },
  taskStatus: {
    alignSelf: 'center',
    marginRight: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  taskStatusText: {
    ...Typography.caption,
    fontWeight: Typography.medium,
    color: Colors.background,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    ...Typography.body1,
    color: Colors.textLight,
  },
});

export default CalendarScreen;
