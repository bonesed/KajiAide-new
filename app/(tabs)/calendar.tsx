import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSelector } from 'react-redux';
import { useTheme } from '../../src/theme/ThemeContext';
import TaskItem from '../../src/components/TaskItem';
import EmptyState from '../../src/components/EmptyState';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarScreen() {
  const theme = useTheme();
  const tasks = useSelector((state) => state.tasks.tasks);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState({});
  const [filteredTasks, setFilteredTasks] = useState([]);

  // タスクがある日付にマーカーを設定
  useEffect(() => {
    const marked = {};
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateStr = new Date(task.dueDate).toISOString().split('T')[0];
        marked[dateStr] = {
          marked: true,
          dotColor: theme.colors.primary
        };
      }
    });
    
    // 選択中の日付のスタイルを追加
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: theme.colors.primary,
    };
    
    setMarkedDates(marked);
    
    // 選択中の日付のタスクをフィルタリング
    filterTasksByDate(selectedDate);
  }, [tasks, selectedDate, theme]);

  // 日付でタスクをフィルタリング
  const filterTasksByDate = (date) => {
    const filtered = tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === date;
    });
    setFilteredTasks(filtered);
  };

  // 日付選択時の処理
  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  // 選択中の日付の表示形式を整える
  const formattedSelectedDate = () => {
    const date = new Date(selectedDate);
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Calendar
        current={selectedDate}
        onDayPress={onDayPress}
        markedDates={markedDates}
        monthFormat={'yyyy年 MM月'}
        theme={{
          calendarBackground: theme.colors.background,
          textSectionTitleColor: theme.colors.text,
          selectedDayBackgroundColor: theme.colors.primary,
          selectedDayTextColor: '#ffffff',
          todayTextColor: theme.colors.primary,
          dayTextColor: theme.colors.text,
          textDisabledColor: theme.colors.textSecondary,
          arrowColor: theme.colors.primary,
          monthTextColor: theme.colors.primary,
          indicatorColor: theme.colors.primary,
        }}
      />
      
      <View style={styles.selectedDateContainer}>
        <Text style={[styles.selectedDateText, { color: theme.colors.primary }]}>
          {formattedSelectedDate()}
        </Text>
      </View>
      
      <View style={styles.tasksContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            予定されたタスク
          </Text>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              // タスク追加画面へ遷移（日付をパラメータとして渡す）
              // 実際の遷移コードはナビゲーション設定に応じて調整
            }}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {filteredTasks.length > 0 ? (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskItem
                task={item}
                onPress={() => {
                  // タスク詳細画面へ遷移
                  // 実際の遷移コードはナビゲーション設定に応じて調整
                }}
              />
            )}
            style={styles.taskList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState
            icon="calendar-outline"
            message={`${formattedSelectedDate()}のタスクはありません`}
            subMessage="タスクを追加して予定を立てましょう"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectedDateContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tasksContainer: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  taskList: {
    flex: 1,
  },
});