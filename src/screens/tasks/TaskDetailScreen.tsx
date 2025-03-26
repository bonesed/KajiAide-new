import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../store/hooks/useRedux';
import { updateTask, deleteTask } from '../../store/slices/tasksSlice';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '../../theme';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const TaskDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { selectedTask } = useAppSelector(state => state.tasks);
  
  // タスクが選択されていない場合は空の状態を表示
  if (!selectedTask) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>タスクが選択されていません</Text>
          <Button 
            title="タスク一覧に戻る" 
            onPress={() => navigation.goBack()} 
            style={styles.backButton} 
          />
        </View>
      </SafeAreaView>
    );
  }
  
  // タスクの編集画面へ移動
  const navigateToEditTask = () => {
    // navigation.navigate('TaskForm', { taskId: selectedTask.id });
    console.log('タスク編集へ', selectedTask.id);
  };
  
  // タスクのステータス更新
  const updateTaskStatus = (newStatus) => {
    dispatch(updateTask({ 
      taskId: selectedTask.id, 
      task: { status: newStatus } 
    }));
  };
  
  // タスクの削除
  const handleDeleteTask = () => {
    Alert.alert(
      'タスクの削除',
      'このタスクを削除してもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive',
          onPress: () => {
            dispatch(deleteTask(selectedTask.id));
            navigation.goBack();
          }
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{selectedTask.title}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(selectedTask.priority) }]}>
              <Text style={styles.priorityText}>{getPriorityLabel(selectedTask.priority)}</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={navigateToEditTask}
            >
              <Text style={styles.editButtonText}>編集</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>カテゴリ:</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{getCategoryLabel(selectedTask.category)}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ステータス:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedTask.status) }]}>
              <Text style={styles.statusText}>{getStatusLabel(selectedTask.status)}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>所要時間:</Text>
            <Text style={styles.infoValue}>{selectedTask.estimatedDuration}分</Text>
          </View>
          
          {selectedTask.dueDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>期限:</Text>
              <Text style={styles.infoValue}>{formatDate(selectedTask.dueDate)}</Text>
            </View>
          )}
          
          {selectedTask.assignedTo && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>担当者:</Text>
              <Text style={styles.infoValue}>{selectedTask.assignedTo}</Text>
            </View>
          )}
        </Card>
        
        {selectedTask.description && (
          <Card style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>詳細</Text>
            <Text style={styles.descriptionText}>{selectedTask.description}</Text>
          </Card>
        )}
        
        <Card style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>ステータスの変更</Text>
          <View style={styles.actionButtons}>
            {selectedTask.status !== 'pending' && (
              <Button 
                title="未着手" 
                onPress={() => updateTaskStatus('pending')} 
                variant="outline"
                style={styles.actionButton}
              />
            )}
            
            {selectedTask.status !== 'in-progress' && (
              <Button 
                title="進行中" 
                onPress={() => updateTaskStatus('in-progress')} 
                variant={selectedTask.status === 'pending' ? 'primary' : 'outline'}
                style={styles.actionButton}
              />
            )}
            
            {selectedTask.status !== 'completed' && (
              <Button 
                title="完了" 
                onPress={() => updateTaskStatus('completed')} 
                variant={selectedTask.status === 'in-progress' ? 'primary' : 'outline'}
                style={styles.actionButton}
              />
            )}
            
            {selectedTask.status !== 'skipped' && (
              <Button 
                title="スキップ" 
                onPress={() => updateTaskStatus('skipped')} 
                variant="outline"
                style={styles.actionButton}
              />
            )}
          </View>
        </Card>
        
        <Button 
          title="タスクを削除" 
          onPress={handleDeleteTask} 
          variant="outline"
          style={styles.deleteButton}
        />
      </ScrollView>
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

const getPriorityLabel = (priority) => {
  switch (priority) {
    case 'high': return '高';
    case 'medium': return '中';
    case 'low': return '低';
    default: return '中';
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

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('ja-JP', { 
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long'
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyStateText: {
    ...Typography.body1,
    color: Colors.textLight,
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 200,
  },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  priorityText: {
    ...Typography.caption,
    fontWeight: Typography.bold,
    color: Colors.background,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editButtonText: {
    ...Typography.body2,
    fontWeight: Typography.medium,
    color: Colors.primary,
  },
  infoCard: {
    margin: Spacing.lg,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    ...Typography.body2,
    fontWeight: Typography.medium,
    color: Colors.textLight,
    width: 80,
  },
  infoValue: {
    ...Typography.body2,
    color: Colors.text,
  },
  categoryBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: Typography.medium,
    color: Colors.background
cat > src/screens/tasks/TaskDetailScreen.tsx << 'EOL'
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../store/hooks/useRedux';
import { updateTask, deleteTask } from '../../store/slices/tasksSlice';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '../../theme';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const TaskDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { selectedTask } = useAppSelector(state => state.tasks);
  
  // タスクが選択されていない場合は空の状態を表示
  if (!selectedTask) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>タスクが選択されていません</Text>
          <Button 
            title="タスク一覧に戻る" 
            onPress={() => navigation.goBack()} 
            style={styles.backButton} 
          />
        </View>
      </SafeAreaView>
    );
  }
  
  // タスクの編集画面へ移動
  const navigateToEditTask = () => {
    // navigation.navigate('TaskForm', { taskId: selectedTask.id });
    console.log('タスク編集へ', selectedTask.id);
  };
  
  // タスクのステータス更新
  const updateTaskStatus = (newStatus) => {
    dispatch(updateTask({ 
      taskId: selectedTask.id, 
      task: { status: newStatus } 
    }));
  };
  
  // タスクの削除
  const handleDeleteTask = () => {
    Alert.alert(
      'タスクの削除',
      'このタスクを削除してもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive',
          onPress: () => {
            dispatch(deleteTask(selectedTask.id));
            navigation.goBack();
          }
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{selectedTask.title}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(selectedTask.priority) }]}>
              <Text style={styles.priorityText}>{getPriorityLabel(selectedTask.priority)}</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={navigateToEditTask}
            >
              <Text style={styles.editButtonText}>編集</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>カテゴリ:</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{getCategoryLabel(selectedTask.category)}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ステータス:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedTask.status) }]}>
              <Text style={styles.statusText}>{getStatusLabel(selectedTask.status)}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>所要時間:</Text>
            <Text style={styles.infoValue}>{selectedTask.estimatedDuration}分</Text>
          </View>
          
          {selectedTask.dueDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>期限:</Text>
              <Text style={styles.infoValue}>{formatDate(selectedTask.dueDate)}</Text>
            </View>
          )}
          
          {selectedTask.assignedTo && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>担当者:</Text>
              <Text style={styles.infoValue}>{selectedTask.assignedTo}</Text>
            </View>
          )}
        </Card>
        
        {selectedTask.description && (
          <Card style={styles.descriptionCard}>
            <Text style={styles.descriptionTitle}>詳細</Text>
            <Text style={styles.descriptionText}>{selectedTask.description}</Text>
          </Card>
        )}
        
        <Card style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>ステータスの変更</Text>
          <View style={styles.actionButtons}>
            {selectedTask.status !== 'pending' && (
              <Button 
                title="未着手" 
                onPress={() => updateTaskStatus('pending')} 
                variant="outline"
                style={styles.actionButton}
              />
            )}
            
            {selectedTask.status !== 'in-progress' && (
              <Button 
                title="進行中" 
                onPress={() => updateTaskStatus('in-progress')} 
                variant={selectedTask.status === 'pending' ? 'primary' : 'outline'}
                style={styles.actionButton}
              />
            )}
            
            {selectedTask.status !== 'completed' && (
              <Button 
                title="完了" 
                onPress={() => updateTaskStatus('completed')} 
                variant={selectedTask.status === 'in-progress' ? 'primary' : 'outline'}
                style={styles.actionButton}
              />
            )}
            
            {selectedTask.status !== 'skipped' && (
              <Button 
                title="スキップ" 
                onPress={() => updateTaskStatus('skipped')} 
                variant="outline"
                style={styles.actionButton}
              />
            )}
          </View>
        </Card>
        
        <Button 
          title="タスクを削除" 
          onPress={handleDeleteTask} 
          variant="outline"
          style={styles.deleteButton}
        />
      </ScrollView>
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

const getPriorityLabel = (priority) => {
  switch (priority) {
    case 'high': return '高';
    case 'medium': return '中';
    case 'low': return '低';
    default: return '中';
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

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('ja-JP', { 
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long'
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyStateText: {
    ...Typography.body1,
    color: Colors.textLight,
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 200,
  },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  priorityText: {
    ...Typography.caption,
    fontWeight: Typography.bold,
    color: Colors.background,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editButtonText: {
    ...Typography.body2,
    fontWeight: Typography.medium,
    color: Colors.primary,
  },
  infoCard: {
    margin: Spacing.lg,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    ...Typography.body2,
    fontWeight: Typography.medium,
    color: Colors.textLight,
    width: 80,
  },
  infoValue: {
    ...Typography.body2,
    color: Colors.text,
  },
  categoryBadge: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: Typography.medium,
    color: Colors.background,
  },
  descriptionCard: {
    margin: Spacing.lg,
    marginTop: 0,
    marginBottom: Spacing.md,
  },
  descriptionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    ...Typography.body1,
    color: Colors.text,
  },
  actionsCard: {
    margin: Spacing.lg,
    marginTop: 0,
  },
  actionsTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    marginBottom: Spacing.sm,
    width: '48%',
  },
  deleteButton: {
    margin: Spacing.lg,
    marginTop: 0,
    marginBottom: Spacing.xl,
    borderColor: Colors.error,
  },
});

export default TaskDetailScreen;
