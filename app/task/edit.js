import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { useDispatch } from 'react-redux';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addTask, updateTask } from '../../src/store/slices/tasksSlice';
import { scheduleTaskReminder } from '../../src/services/notificationService';

const TaskEditScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const router = useRouter();
  const { id, initialData } = useLocalSearchParams();
  
  // アニメーション用の値
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // フォームの状態
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(new Date());
  const [hasDueDate, setHasDueDate] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // 既存のタスクがある場合はフォームに設定
  useEffect(() => {
    if (initialData) {
      try {
        const taskData = JSON.parse(initialData);
        setTitle(taskData.title || '');
        setDescription(taskData.description || '');
        setCategory(taskData.category || '');
        setPriority(taskData.priority || 'medium');
        
        if (taskData.dueDate) {
          setDueDate(new Date(taskData.dueDate));
          setHasDueDate(true);
        }
      } catch (e) {
        console.error('初期データの解析に失敗:', e);
      }
    }
    
    // アニメーションの開始
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [initialData]);

  // 日付ピッカーの処理
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
      setHasDueDate(true);
    }
  };
  
  // 優先度選択ボタン
  const PriorityButton = ({ value, label, color }) => (
    <TouchableOpacity
      style={[
        styles.priorityButton,
        {
          backgroundColor: priority === value ? color : 'transparent',
          borderColor: color,
        },
      ]}
      onPress={() => setPriority(value)}
    >
      <Text
        style={[
          styles.priorityButtonText,
          { color: priority === value ? '#fff' : color },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // タスクの保存処理
  const handleSaveTask = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      priority,
      dueDate: hasDueDate ? dueDate.toISOString() : null,
      completed: false,
    };

    try {
      if (id) {
        // 既存タスクの更新
        await dispatch(updateTask({ taskId: id, taskData })).unwrap();
      } else {
        // 新規タスクの追加
        const newTask = await dispatch(addTask(taskData)).unwrap();
        
        // 通知のスケジュール
        if (hasDueDate) {
          const notificationId = await scheduleTaskReminder({
            ...newTask,
            dueDate
          });
          
          if (notificationId) {
            // 通知IDを保存
            dispatch(updateTask({
              taskId: newTask.id,
              taskData: { ...newTask, notificationId }
            }));
          }
        }
      }
      
      // 保存成功後に前の画面に戻る
      router.back();
    } catch (error) {
      Alert.alert('エラー', `タスクの保存に失敗しました: ${error.message}`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          title: id ? 'タスクを編集' : '新しいタスク',
          headerRight: () => (
            <TouchableOpacity onPress={handleSaveTask}>
              <Text style={{ color: theme.colors.primary, fontWeight: '600', fontSize: 16 }}>
                保存
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: opacityAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>タイトル *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="タスクのタイトル"
              placeholderTextColor={theme.colors.textSecondary}
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>説明</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="タスクの詳細を入力（任意）"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>カテゴリー</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={category}
              onChangeText={setCategory}
              placeholder="カテゴリーを入力（任意）"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>優先度</Text>
            <View style={styles.priorityContainer}>
              <PriorityButton
                value="low"
                label="低"
                color={theme.colors.success}
              />
              <PriorityButton
                value="medium"
                label="中"
                color={theme.colors.warning}
              />
              <PriorityButton
                value="high"
                label="高"
                color={theme.colors.error}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.dueDateHeader}>
              <Text style={[styles.label, { color: theme.colors.text }]}>期限</Text>
              <TouchableOpacity
                style={styles.dueDateToggle}
                onPress={() => setHasDueDate(!hasDueDate)}
              >
                <View
                  style={[
                    styles.toggleTrack,
                    {
                      backgroundColor: hasDueDate
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.toggleThumb,
                      {
                        transform: [
                          {
                            translateX: hasDueDate ? 18 : 0,
                          },
                        ],
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {hasDueDate && (
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.dateIcon}
                />
                <Text style={[styles.dateText, { color: theme.colors.text }]}>
                  {dueDate.toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                  {'  '}
                  {dueDate.toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="datetime"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleSaveTask}
            >
              <Text style={styles.saveButtonText}>
                {id ? 'タスクを更新' : 'タスクを追加'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  backgroundColor: 'transparent',
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => router.back()}
            >
              <Text
                style={[styles.cancelButtonText, { color: theme.colors.text }]}
              >
                キャンセル
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  priorityButtonText: {
    fontWeight: '600',
  },
  dueDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dueDateToggle: {
    padding: 4,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
  saveButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
  },
});

export default TaskEditScreen;