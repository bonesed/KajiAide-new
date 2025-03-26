// app/task-detail.tsx
import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAppSelector, useAppDispatch } from '@/src/store/hooks';
import { updateTask, deleteTask, clearSelectedTask } from '@/src/store/slices/tasksSlice';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TaskDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const { selectedTask } = useAppSelector(state => state.tasks);
  
  // タスクが選択されていない場合は戻る
  if (!selectedTask) {
    router.back();
    return null;
  }
  
  // タスクの編集画面へ移動
  const handleEditTask = () => {
    router.push('/task-form');
  };
  
  // タスクのステータス更新
  const handleUpdateStatus = (newStatus) => {
    dispatch(updateTask({ 
      id: selectedTask.id, 
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
            dispatch(clearSelectedTask());
            router.back();
          }
        },
      ]
    );
  };
  
  // 日付のフォーマット
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long'
    });
  };
  
  // 優先度のラベル
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '中';
    }
  };
  
  // カテゴリのラベル
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
  
  // ステータスのラベル
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return '未着手';
      case 'in-progress': return '進行中';
      case 'completed': return '完了';
      case 'skipped': return 'スキップ';
      default: return '未着手';
    }
  };
  
  // ステータスの色
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'in-progress': return colors.primary;
      case 'skipped': return colors.textLight;
      default: return colors.warning;
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>{selectedTask.title}</ThemedText>
        <TouchableOpacity style={styles.editButton} onPress={handleEditTask}>
          <FontAwesome name="pencil" size={18} color={colors.primary} />
        </TouchableOpacity>
      </ThemedView>
      
      <ThemedView style={styles.card}>
        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>カテゴリ:</ThemedText>
          <ThemedView style={styles.categoryBadge}>
            <ThemedText style={styles.categoryText}>
              {getCategoryLabel(selectedTask.category)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>ステータス:</ThemedText>
          <ThemedView 
            style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(selectedTask.status) }
            ]}
          >
            <ThemedText style={styles.statusText}>
              {getStatusLabel(selectedTask.status)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>優先度:</ThemedText>
          <ThemedText style={styles.infoValue}>
            {getPriorityLabel(selectedTask.priority)}
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.infoLabel}>所要時間:</ThemedText>
          <ThemedText style={styles.infoValue}>{selectedTask.estimatedDuration}分</ThemedText>
        </ThemedView>
        
        {selectedTask.dueDate && (
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>期限:</ThemedText>
            <ThemedText style={styles.infoValue}>{formatDate(selectedTask.dueDate)}</ThemedText>
          </ThemedView>
        )}
        
        {selectedTask.assignedTo && (
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>担当者:</ThemedText>
            <ThemedText style={styles.infoValue}>{selectedTask.assignedTo}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
      
      {selectedTask.description && (
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>詳細</ThemedText>
          <ThemedText style={styles.description}>{selectedTask.description}</ThemedText>
        </ThemedView>
      )}
      
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>ステータスの変更</ThemedText>
        <ThemedView style={styles.statusActions}>
          {selectedTask.status !== 'pending' && (
            <TouchableOpacity 
              style={[styles.statusButton, { borderColor: colors.warning }]}
              onPress={() => handleUpdateStatus('pending')}
            >
              <ThemedText style={[styles.statusButtonText, { color: colors.warning }]}>
                未着手
              </ThemedText>
            </TouchableOpacity>
          )}
          
          {selectedTask.status !== 'in-progress' && (
            <TouchableOpacity 
              style={[
                styles.statusButton, 
                { 
                  borderColor: colors.primary,
                  backgroundColor: selectedTask.status === 'pending' ? colors.primary : 'transparent'
                }
              ]}
              onPress={() => handleUpdateStatus('in-progress')}
            >
              <ThemedText style={[
                styles.statusButtonText, 
                { color: selectedTask.status === 'pending' ? 'white' : colors.primary }
              ]}>
                進行中
              </ThemedText>
            </TouchableOpacity>
          )}
          
          {selectedTask.status !== 'completed' && (
            <TouchableOpacity 
              style={[
                styles.statusButton, 
                { 
                  borderColor: colors.success,
                  backgroundColor: selectedTask.status === 'in-progress' ? colors.success : 'transparent'
                }
              ]}
              onPress={() => handleUpdateStatus('completed')}
            >
              <ThemedText style={[
                styles.statusButtonText, 
                { color: selectedTask.status === 'in-progress' ? 'white' : colors.success }
              ]}>
                完了
              </ThemedText>
            </TouchableOpacity>
          )}
          
          {selectedTask.status !== 'skipped' && (
            <TouchableOpacity 
              style={[styles.statusButton, { borderColor: colors.textLight }]}
              onPress={() => handleUpdateStatus('skipped')}
            >
              <ThemedText style={[styles.statusButtonText, { color: colors.textLight }]}>
                スキップ
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      </ThemedView>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={handleDeleteTask}
      >
        <ThemedText style={styles.deleteButtonText}>タスクを削除</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 24,
  },
  editButton: {
    padding: 8,
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    width: 80,
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
  },
  categoryBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    width: '48%',
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#F45B69',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 16,
  },
  deleteButtonText: {
    color: '#F45B69',
    fontSize: 16,
    fontWeight: '500',
  },
});