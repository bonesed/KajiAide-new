import React, { useCallback, memo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import TaskItem from './TaskItem';
import EmptyState from './EmptyState';
import { deleteTask } from '../store/slices/tasksSlice';

const TaskList = ({ tasks, emptyStateProps }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // 均等にキーを抽出するための関数
  const keyExtractor = useCallback((item) => item.id, []);
  
  // タスク項目のタップ処理（メモ化）
  const handleTaskPress = useCallback((task) => {
    navigation.navigate('TaskDetail', { id: task.id });
  }, [navigation]);
  
  // タスク削除処理（メモ化）
  const handleTaskDelete = useCallback((taskId) => {
    dispatch(deleteTask(taskId));
  }, [dispatch]);
  
  // レンダーアイテム処理（メモ化）
  const renderItem = useCallback(({ item }) => (
    <TaskItem
      task={item}
      onPress={() => handleTaskPress(item)}
      onDelete={handleTaskDelete}
    />
  ), [handleTaskPress, handleTaskDelete]);
  
  // リストが空の場合のレンダリング
  const renderEmptyComponent = useCallback(() => (
    <EmptyState
      icon={emptyStateProps?.icon || "checkbox-outline"}
      message={emptyStateProps?.message || "タスクがありません"}
      subMessage={emptyStateProps?.subMessage || "新しいタスクを追加してみましょう"}
    />
  ), [emptyStateProps]);
  
  // 最適化: 項目間のセパレーター
  const ItemSeparatorComponent = memo(() => <View style={styles.separator} />);
  
  // WindowSizeを活用した最適化
  const getItemLayout = useCallback((data, index) => ({
    length: 90, // TaskItemの高さ（マージンを含む）
    offset: 90 * index,
    index,
  }), []);
  
  return (
    <FlatList
      data={tasks}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={renderEmptyComponent}
      contentContainerStyle={tasks.length === 0 ? styles.emptyContainer : styles.listContainer}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={ItemSeparatorComponent}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true} // メモリ使用量削減
      maxToRenderPerBatch={10} // 一度にレンダリングする最大数
      windowSize={10} // レンダリングウィンドウサイズ
      initialNumToRender={8} // 初期レンダリング数
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 100, // 下部にスペースを追加
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 8,
  },
});

export default memo(TaskList);