// app/(tabs)/tasks.tsx
import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { TaskItem } from '@/components/TaskItem';
import { useAppSelector, useAppDispatch } from '@/src/store/hooks';
import { selectTask } from '@/src/store/slices/tasksSlice';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TasksScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector(state => state.tasks);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // フィルタリング
  const filteredTasks = tasks.filter(task => {
    // 検索クエリのフィルタリング
    const matchesQuery = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // カテゴリのフィルタリング
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    
    // ステータスのフィルタリング
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    
    return matchesQuery && matchesCategory && matchesStatus;
  });
  
  // タスク詳細画面へ移動
  const handleTaskPress = (taskId) => {
    dispatch(selectTask(taskId));
    router.push('/task-detail');
  };
  
  // 新規タスク作成
  const handleCreateTask = () => {
    router.push('/task-form');
  };
  
  const renderCategoryFilters = () => {
    const categories = [
      { id: 'all', label: 'すべて' },
      { id: 'cleaning', label: '掃除' },
      { id: 'laundry', label: '洗濯' },
      { id: 'cooking', label: '料理' },
      { id: 'shopping', label: '買い物' },
      { id: 'maintenance', label: 'メンテナンス' },
      { id: 'other', label: 'その他' },
    ];
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryFilter,
              selectedCategory === cat.id && { backgroundColor: colors.primary }
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <ThemedText style={[
              styles.categoryFilterText,
              selectedCategory === cat.id && { color: 'white' }
            ]}>
              {cat.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>タスク管理</ThemedText>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateTask}>
          <FontAwesome name="plus" size={16} color="white" />
        </TouchableOpacity>
      </ThemedView>
      
      <ThemedView style={styles.searchContainer}>
        <FontAwesome name="search" size={16} color={colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="タスクを検索..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </ThemedView>
      
      {renderCategoryFilters()}
      
      <ThemedView style={styles.statusFilters}>
        {['all', 'pending', 'in-progress', 'completed'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusFilter,
              selectedStatus === status && { backgroundColor: colors.primary }
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <ThemedText style={[
              styles.statusFilterText,
              selectedStatus === status && { color: 'white' }
            ]}>
              {status === 'all' ? 'すべて' : 
               status === 'pending' ? '未着手' : 
               status === 'in-progress' ? '進行中' : '完了'}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>
      
      <ScrollView style={styles.taskList}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <TaskItem
              key={task.id}
              title={task.title}
              category={task.category}
              duration={task.estimatedDuration}
              priority={task.priority}
              onPress={() => handleTaskPress(task.id)}
            />
          ))
        ) : (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>タスクが見つかりませんでした</ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
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
    fontSize: 24,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3E7BFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterScroll: {
    marginBottom: 12,
  },
  categoryFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  categoryFilterText: {
    fontSize: 14,
  },
  statusFilters: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statusFilter: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    marginHorizontal: 2,
    borderRadius: 4,
  },
  statusFilterText: {
    fontSize: 12,
  },
  taskList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateText: {
    color: '#888',
    fontSize: 16,
  },
});