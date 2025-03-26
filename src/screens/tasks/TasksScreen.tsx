import React, { useEffect, useState } from 'react';
import { 
 View, 
 Text, 
 StyleSheet, 
 FlatList, 
 TouchableOpacity, 
 TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../store/hooks/useRedux';
import { fetchTasks, selectTask } from '../../store/slices/tasksSlice';
import { Colors, Spacing, Typography, Shadows, BorderRadius } from '../../theme';
import Button from '../../components/common/Button';

const TasksScreen = () => {
 const navigation = useNavigation();
 const dispatch = useAppDispatch();
 const { tasks, loading } = useAppSelector(state => state.tasks);
 
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('all');
 const [selectedStatus, setSelectedStatus] = useState('all');
 
 // タスクの取得
 useEffect(() => {
   dispatch(fetchTasks());
 }, [dispatch]);
 
 // タスクのフィルタリング
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
 const navigateToTaskDetail = (taskId) => {
   dispatch(selectTask(taskId));
   // navigation.navigate('TaskDetail', { taskId });
   console.log('タスク詳細へ', taskId);
 };
 
 // 新規タスク作成画面へ移動
 const navigateToCreateTask = () => {
   // navigation.navigate('TaskForm');
   console.log('タスク作成へ');
 };
 
 // カテゴリーフィルター
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
     <View style={styles.filtersContainer}>
       <FlatList
         horizontal
         data={categories}
         keyExtractor={item => item.id}
         showsHorizontalScrollIndicator={false}
         renderItem={({ item }) => (
           <TouchableOpacity
             style={[
               styles.categoryFilter,
               selectedCategory === item.id && styles.selectedCategoryFilter
             ]}
             onPress={() => setSelectedCategory(item.id)}
           >
             <Text 
               style={[
                 styles.categoryFilterText,
                 selectedCategory === item.id && styles.selectedCategoryFilterText
               ]}
             >
               {item.label}
             </Text>
           </TouchableOpacity>
         )}
       />
     </View>
   );
 };
 
 // ステータスフィルター
 const renderStatusFilters = () => {
   const statuses = [
     { id: 'all', label: 'すべて' },
     { id: 'pending', label: '未着手' },
     { id: 'in-progress', label: '進行中' },
     { id: 'completed', label: '完了' },
   ];
   
   return (
     <View style={styles.statusFiltersContainer}>
       {statuses.map(status => (
         <TouchableOpacity
           key={status.id}
           style={[
             styles.statusFilter,
             selectedStatus === status.id && styles.selectedStatusFilter
           ]}
           onPress={() => setSelectedStatus(status.id)}
         >
           <Text 
             style={[
               styles.statusFilterText,
               selectedStatus === status.id && styles.selectedStatusFilterText
             ]}
           >
             {status.label}
           </Text>
         </TouchableOpacity>
       ))}
     </View>
   );
 };
 
 // タスクアイテムの描画
 const renderTaskItem = ({ item }) => {
   return (
     <TouchableOpacity 
       style={styles.taskItem} 
       onPress={() => navigateToTaskDetail(item.id)}
     >
       <View style={[styles.taskPriority, { backgroundColor: getPriorityColor(item.priority) }]} />
       <View style={styles.taskContent}>
         <View style={styles.taskHeader}>
           <Text style={styles.taskTitle}>{item.title}</Text>
           <View style={[styles.taskStatus, { backgroundColor: getStatusColor(item.status) }]}>
             <Text style={styles.taskStatusText}>{getStatusLabel(item.status)}</Text>
           </View>
         </View>
         
         {item.description && (
           <Text style={styles.taskDescription} numberOfLines={2}>
             {item.description}
           </Text>
         )}
         
         <View style={styles.taskMeta}>
           <View style={styles.taskCategory}>
             <Text style={styles.taskCategoryText}>{getCategoryLabel(item.category)}</Text>
           </View>
           
           <View style={styles.taskInfoContainer}>
             <Text style={styles.taskDuration}>{item.estimatedDuration}分</Text>
             {item.dueDate && (
               <Text style={styles.taskDueDate}>
                 {formatDate(item.dueDate)}
               </Text>
             )}
           </View>
         </View>
       </View>
     </TouchableOpacity>
   );
 };
 
 return (
   <SafeAreaView style={styles.container}>
     <View style={styles.header}>
       <Text style={styles.title}>タスク管理</Text>
       <Button 
         title="新規タスク" 
         onPress={navigateToCreateTask} 
         variant="primary"
         size="small"
       />
     </View>
     
     <View style={styles.searchContainer}>
       <TextInput
         style={styles.searchInput}
         placeholder="タスクを検索..."
         value={searchQuery}
         onChangeText={setSearchQuery}
       />
     </View>
     
     {renderCategoryFilters()}
     {renderStatusFilters()}
     
     <FlatList
       data={filteredTasks}
       keyExtractor={item => item.id}
       renderItem={renderTaskItem}
       contentContainerStyle={styles.tasksList}
       ListEmptyComponent={
         <View style={styles.emptyState}>
           <Text style={styles.emptyStateText}>タスクが見つかりませんでした</Text>
         </View>
       }
     />
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

const formatDate = (date) => {
 const d = new Date(date);
 return d.toLocaleDateString('ja-JP', { 
   month: 'short',
   day: 'numeric',
   hour: '2-digit',
   minute: '2-digit'
 });
};

const styles = StyleSheet.create({
 container: {
   flex: 1,
   backgroundColor: Colors.background,
 },
 header: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   padding: Spacing.lg,
   borderBottomWidth: 1,
   borderBottomColor: Colors.border,
 },
 title: {
   ...Typography.h2,
   color: Colors.text,
 },
 searchContainer: {
   padding: Spacing.md,
   paddingTop: 0,
 },
 searchInput: {
   backgroundColor: Colors.surfaceLight,
   padding: Spacing.md,
   borderRadius: BorderRadius.md,
   borderWidth: 1,
   borderColor: Colors.border,
   ...Typography.body1,
 },
 filtersContainer: {
   paddingHorizontal: Spacing.md,
   marginBottom: Spacing.sm,
 },
 categoryFilter: {
   paddingHorizontal: Spacing.md,
   paddingVertical: Spacing.xs,
   marginRight: Spacing.sm,
   borderRadius: BorderRadius.round,
   backgroundColor: Colors.surfaceLight,
   borderWidth: 1,
   borderColor: Colors.border,
 },
 selectedCategoryFilter: {
   backgroundColor: Colors.primary,
   borderColor: Colors.primary,
 },
 categoryFilterText: {
   ...Typography.body2,
   color: Colors.text,
 },
 selectedCategoryFilterText: {
   color: Colors.background,
   fontWeight: Typography.medium,
 },
 statusFiltersContainer: {
   flexDirection: 'row',
   paddingHorizontal: Spacing.md,
   marginBottom: Spacing.md,
 },
 statusFilter: {
   flex: 1,
   paddingVertical: Spacing.xs,
   alignItems: 'center',
   justifyContent: 'center',
   marginRight: Spacing.xs,
   borderRadius: BorderRadius.sm,
   backgroundColor: Colors.surfaceLight,
   borderWidth: 1,
   borderColor: Colors.border,
 },
 selectedStatusFilter: {
   backgroundColor: Colors.primary,
   borderColor: Colors.primary,
 },
 statusFilterText: {
   ...Typography.caption,
   color: Colors.text,
 },
 selectedStatusFilterText: {
   color: Colors.background,
   fontWeight: Typography.medium,
 },
 tasksList: {
   padding: Spacing.md,
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
 taskHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginBottom: Spacing.xs,
 },
 taskTitle: {
   ...Typography.body1,
   fontWeight: Typography.semibold,
   color: Colors.text,
   flex: 1,
   marginRight: Spacing.sm,
 },
 taskStatus: {
   paddingHorizontal: Spacing.sm,
   paddingVertical: 2,
   borderRadius: BorderRadius.sm,
 },
 taskStatusText: {
   ...Typography.caption,
   fontWeight: Typography.medium,
   color: Colors.background,
 },
 taskDescription: {
   ...Typography.body2,
   color: Colors.textLight,
   marginBottom: Spacing.sm,
 },
 taskMeta: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
 },
 taskCategory: {
   backgroundColor: Colors.surfaceLight,
   paddingHorizontal: Spacing.sm,
   paddingVertical: 2,
   borderRadius: BorderRadius.sm,
 },
 taskCategoryText: {
   ...Typography.caption,
   color: Colors.textLight,
 },
 taskInfoContainer: {
   flexDirection: 'row',
   alignItems: 'center',
 },
 taskDuration: {
   ...Typography.caption,
   color: Colors.primary,
   fontWeight: Typography.medium,
   marginRight: Spacing.sm,
 },
 taskDueDate: {
   ...Typography.caption,
   color: Colors.textLight,
 },
 emptyState: {
   padding: Spacing.xl,
   alignItems: 'center',
   justifyContent: 'center',
 },
 emptyStateText: {
   ...Typography.body1,
   color: Colors.textLight,
 },
});

export default TasksScreen;
