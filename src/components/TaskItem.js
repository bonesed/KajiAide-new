import React, { useRef, useEffect, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useDispatch } from 'react-redux';
import { toggleTaskCompletion } from '../store/slices/tasksSlice';
import { useTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import Swipeable from 'react-native-gesture-handler/Swipeable';

// タスク項目の等価性チェック関数
const areTasksEqual = (prevProps, nextProps) => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.completed === nextProps.task.completed &&
    prevProps.task.dueDate === nextProps.task.dueDate &&
    prevProps.task.priority === nextProps.task.priority &&
    prevProps.task.category === nextProps.task.category
  );
};

const TaskItem = ({ task, onPress, onDelete }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const swipeableRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // クリーンアップ関数
    return () => {
      Animated.timing(scaleAnim).stop();
      Animated.timing(fadeAnim).stop();
    };
  }, []);

  const handleToggleComplete = () => {
    dispatch(toggleTaskCompletion({ taskId: task.id, currentStatus: task.completed }));
  };

  const formatDueDate = () => {
    if (!task.dueDate) return null;
    
    const date = new Date(task.dueDate);
    return format(date, 'M月d日(E) HH:mm', { locale: ja });
  };

  // 削除アクションをレンダリング
  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });
    
    return (
      <TouchableOpacity 
        style={[styles.deleteAction, { backgroundColor: theme.colors.error }]}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete && onDelete(task.id);
        }}
      >
        <Animated.View
          style={[
            styles.deleteActionContent,
            { transform: [{ translateX: trans }] },
          ]}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.deleteActionText}>削除</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const priorityColors = {
    high: theme.colors.error,
    medium: theme.colors.warning,
    low: theme.colors.success,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <Animated.View
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          backgroundColor: theme.colors.card,
          borderColor: isOverdue ? theme.colors.error : theme.colors.border,
        }
      ]}
    >
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        friction={2}
        rightThreshold={40}
      >
        <TouchableOpacity 
          style={styles.content}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={handleToggleComplete}
          >
            <View style={[
              styles.checkbox,
              {
                borderColor: task.completed ? theme.colors.primary : theme.colors.border,
                backgroundColor: task.completed ? theme.colors.primary : 'transparent',
              }
            ]}>
              {task.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>
          
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text 
                style={[
                  styles.title, 
                  { 
                    color: theme.colors.text,
                    textDecorationLine: task.completed ? 'line-through' : 'none',
                    opacity: task.completed ? 0.6 : 1,
                  }
                ]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
              
              {task.priority && (
                <View style={[styles.priorityBadge, { backgroundColor: priorityColors[task.priority] }]}>
                  <Text style={styles.priorityText}>
                    {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                  </Text>
                </View>
              )}
            </View>
            
            {task.dueDate && (
              <View style={styles.dateContainer}>
                <Ionicons 
                  name="calendar-outline" 
                  size={14} 
                  color={isOverdue ? theme.colors.error : theme.colors.textSecondary} 
                />
                <Text 
                  style={[
                    styles.dueDate, 
                    { 
                      color: isOverdue ? theme.colors.error : theme.colors.textSecondary,
                      fontWeight: isOverdue ? '600' : 'normal',
                    }
                  ]}
                >
                  {formatDueDate()}
                  {isOverdue && ' (期限超過)'}
                </Text>
              </View>
            )}
            
            {task.category && (
              <View style={styles.categoryContainer}>
                <Ionicons name="pricetag-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={[styles.category, { color: theme.colors.textSecondary }]}>
                  {task.category}
                </Text>
              </View>
            )}
          </View>
          
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dueDate: {
    fontSize: 12,
    marginLeft: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  category: {
    fontSize: 12,
    marginLeft: 4,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteActionContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  deleteActionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
});

// React.memoを使用して最適化
export default memo(TaskItem, areTasksEqual);