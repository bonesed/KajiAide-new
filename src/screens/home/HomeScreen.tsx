import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../store/hooks/useRedux';
import { fetchTasks } from '../../store/slices/tasksSlice';
import { Colors, Spacing, Typography, Shadows } from '../../theme';
import Card from '../../components/common/Card';

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector(state => state.tasks);
  const { user } = useAppSelector(state => state.auth);
  
  // コンポーネントがマウントされたときにタスクを取得
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);
  
  // 今日のタスクをフィルタリング
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    return taskDate >= today && taskDate < tomorrow;
  });
  
  const pendingTasks = todayTasks.filter(task => task.status === 'pending' || task.status === 'in-progress');
  const completedTasks = todayTasks.filter(task => task.status === 'completed');
  
  // カテゴリ別のタスク数
  const tasksByCategory = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {});
  
  // タスク詳細画面へ移動
  const navigateToTaskDetail = (taskId) => {
    // navigation.navigate('TaskDetail', { taskId });
    console.log('タスク詳細へ', taskId);
  };
  
  // 今日の日付をフォーマット
  const formattedDate = today.toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              こんにちは、{user?.displayName || 'ゲスト'}さん
            </Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            {/* プロフィール画像があれば表示、なければイニシャル */}
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.displayName ? user.displayName[0].toUpperCase() : 'G'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* タスク進捗サマリー */}
        <Card style={styles.summaryCard}>
          <Text style={styles.cardTitle}>今日のタスク進捗</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressStats}>
              <Text style={styles.progressNumber}>{completedTasks.length}/{todayTasks.length}</Text>
              <Text style={styles.progressLabel}>完了</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${todayTasks.length > 0 ? (completedTasks.length / todayTasks.length) * 100 : 0}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressPercentage}>
                {todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0}%
              </Text>
            </View>
          </View>
        </Card>
        
        {/* 今日の予定タスク */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日のタスク</Text>
          
          {todayTasks.length > 0 ? (
            pendingTasks.map(task => (
              <TouchableOpacity 
                key={task.id} 
                style={styles.taskItem} 
                onPress={() => navigateToTaskDetail(task.id)}
              >
                <View style={[styles.taskPriority, { backgroundColor: getPriorityColor(task.priority) }]} />
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskCategory}>{getCategoryLabel(task.category)}</Text>
                </View>
                <View style={styles.taskMeta}>
                  <Text style={styles.taskTime}>
                    {task.dueDate ? formatTime(task.dueDate) : '終日'}
                  </Text>
                  <Text style={styles.taskDuration}>{task.estimatedDuration}分</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>今日のタスクはありません</Text>
            </View>
          )}
        </View>
        
        {/* カテゴリサマリー */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>カテゴリ別</Text>
          <View style={styles.categoriesContainer}>
            <CategoryCard 
              category="cleaning" 
              count={tasksByCategory.cleaning || 0} 
            />
            <CategoryCard 
              category="laundry" 
              count={tasksByCategory.laundry || 0} 
            />
            <CategoryCard 
              category="cooking" 
              count={tasksByCategory.cooking || 0} 
            />
            <CategoryCard 
              category="shopping" 
              count={tasksByCategory.shopping || 0} 
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// カテゴリカードコンポーネント
const CategoryCard = ({ category, count }) => {
  return (
    <View style={styles.categoryCard}>
      <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(category) }]}>
        <Text style={styles.categoryIconText}>{category[0].toUpperCase()}</Text>
      </View>
      <Text style={styles.categoryName}>{getCategoryLabel(category)}</Text>
      <Text style={styles.categoryCount}>{count}件</Text>
    </View>
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

const getCategoryColor = (category) => {
  switch (category) {
    case 'cleaning': return '#4ECDC4';
    case 'laundry': return '#6C88C4';
    case 'cooking': return '#FF6B6B';
    case 'shopping': return '#FFE66D';
    case 'maintenance': return '#A594F9';
    default: return Colors.textMuted;
  }
};

const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  date: {
    ...Typography.body1,
    color: Colors.textLight,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...Typography.body1,
    fontWeight: Typography.bold,
    color: 'white',
  },
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
    color: Colors.text,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStats: {
    marginRight: Spacing.lg,
  },
  progressNumber: {
    ...Typography.h2,
    color: Colors.primary,
  },
  progressLabel: {
    ...Typography.body2,
    color: Colors.textLight,
  },
  progressBarContainer: {
    flex: 1,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    marginBottom: Spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  progressPercentage: {
    ...Typography.caption,
    color: Colors.textLight,
    textAlign: 'right',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
    color: Colors.text,
  },
  taskItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
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
  taskCategory: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  taskMeta: {
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  taskTime: {
    ...Typography.body2,
    fontWeight: Typography.medium,
    color: Colors.primary,
  },
  taskDuration: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  emptyState: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
  },
  emptyStateText: {
    ...Typography.body1,
    color: Colors.textLight,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
    ...Shadows.small,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryIconText: {
    ...Typography.body1,
    fontWeight: Typography.bold,
    color: 'white',
  },
  categoryName: {
    ...Typography.body2,
    fontWeight: Typography.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  categoryCount: {
    ...Typography.caption,
    color: Colors.textLight,
  },
});

export default HomeScreen;
