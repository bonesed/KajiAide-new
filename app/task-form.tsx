// app/task-form.tsx
import React, { useState, useEffect } from 'react';
import { 
 StyleSheet, 
 ScrollView, 
 TouchableOpacity, 
 TextInput,
 Switch,
 Platform,
 View
} from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAppSelector, useAppDispatch } from '@/src/store/hooks';
import { addTask, updateTask, clearSelectedTask } from '@/src/store/slices/tasksSlice';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TaskFormScreen() {
 const colorScheme = useColorScheme();
 const colors = Colors[colorScheme];
 const dispatch = useAppDispatch();
 const { selectedTask } = useAppSelector(state => state.tasks);
 
 const isEditMode = !!selectedTask;
 
 // フォームの状態
 const [title, setTitle] = useState('');
 const [description, setDescription] = useState('');
 const [category, setCategory] = useState('cleaning');
 const [estimatedDuration, setEstimatedDuration] = useState('30');
 const [priority, setPriority] = useState('medium');
 const [dueDate, setDueDate] = useState(new Date());
 const [hasDueDate, setHasDueDate] = useState(false);
 const [showDatePicker, setShowDatePicker] = useState(false);
 
 // 入力検証エラー
 const [errors, setErrors] = useState({});
 
 // 編集モードの場合、フォームに値をセット
 useEffect(() => {
   if (isEditMode && selectedTask) {
     setTitle(selectedTask.title);
     setDescription(selectedTask.description || '');
     setCategory(selectedTask.category);
     setEstimatedDuration(selectedTask.estimatedDuration.toString());
     setPriority(selectedTask.priority);
     
     if (selectedTask.dueDate) {
       setDueDate(new Date(selectedTask.dueDate));
       setHasDueDate(true);
     }
   }
 }, [isEditMode, selectedTask]);
 
 // フォームの検証
 const validateForm = () => {
   const newErrors = {};
   
   if (!title.trim()) {
     newErrors.title = 'タイトルを入力してください';
   }
   
   if (!estimatedDuration.trim() || isNaN(parseInt(estimatedDuration))) {
     newErrors.estimatedDuration = '有効な所要時間を入力してください';
   }
   
   setErrors(newErrors);
   return Object.keys(newErrors).length === 0;
 };
 
 // タスクの保存
 const handleSave = () => {
   if (!validateForm()) {
     return;
   }
   
   const taskData = {
     title,
     description: description.trim() ? description : undefined,
     category,
     estimatedDuration: parseInt(estimatedDuration),
     priority,
     status: isEditMode ? selectedTask.status : 'pending',
     dueDate: hasDueDate ? dueDate.toISOString() : undefined,
   };
   
   if (isEditMode) {
     dispatch(updateTask({ 
       id: selectedTask.id, 
       task: taskData 
     }));
   } else {
     dispatch(addTask(taskData));
   }
   
   dispatch(clearSelectedTask());
   router.back();
 };
 
 // 日付選択の変更
 const handleDateChange = (event, selectedDate) => {
   setShowDatePicker(Platform.OS === 'ios');
   if (selectedDate) {
     setDueDate(selectedDate);
   }
 };
 
 // カテゴリーの選択UI
 const renderCategorySelector = () => {
   const categories = [
     { id: 'cleaning', label: '掃除' },
     { id: 'laundry', label: '洗濯' },
     { id: 'cooking', label: '料理' },
     { id: 'shopping', label: '買い物' },
     { id: 'maintenance', label: 'メンテナンス' },
     { id: 'other', label: 'その他' },
   ];
   
   return (
     <ThemedView>
       <ThemedText style={styles.label}>カテゴリ</ThemedText>
       <ThemedView style={styles.categoryContainer}>
         {categories.map(cat => (
           <TouchableOpacity
             key={cat.id}
             style={[
               styles.categoryButton,
               category === cat.id && { backgroundColor: colors.primary, borderColor: colors.primary }
             ]}
             onPress={() => setCategory(cat.id)}
           >
             <ThemedText style={[
               styles.categoryButtonText,
               category === cat.id && { color: 'white' }
             ]}>
               {cat.label}
             </ThemedText>
           </TouchableOpacity>
         ))}
       </ThemedView>
     </ThemedView>
   );
 };
 
 // 優先度の選択UI
 const renderPrioritySelector = () => {
   const priorities = [
     { id: 'low', label: '低' },
     { id: 'medium', label: '中' },
     { id: 'high', label: '高' },
   ];
   
   return (
     <ThemedView>
       <ThemedText style={styles.label}>優先度</ThemedText>
       <ThemedView style={styles.priorityContainer}>
         {priorities.map(p => (
           <TouchableOpacity
             key={p.id}
             style={[
               styles.priorityButton,
               priority === p.id && { 
                 backgroundColor: p.id === 'high' ? colors.error : 
                                  p.id === 'medium' ? colors.warning : 
                                  colors.accent,
                 borderColor: p.id === 'high' ? colors.error : 
                             p.id === 'medium' ? colors.warning : 
                             colors.accent,
               }
             ]}
             onPress={() => setPriority(p.id)}
           >
             <ThemedText style={[
               styles.priorityButtonText,
               priority === p.id && { color: 'white' }
             ]}>
               {p.label}
             </ThemedText>
           </TouchableOpacity>
         ))}
       </ThemedView>
     </ThemedView>
   );
 };
 
 return (
   <ScrollView style={styles.container}>
     <ThemedView style={styles.formContainer}>
       <ThemedText style={styles.label}>タイトル</ThemedText>
       <TextInput
         style={[styles.input, errors.title && styles.inputError]}
         value={title}
         onChangeText={setTitle}
         placeholder="タスクのタイトルを入力"
         placeholderTextColor="#999"
       />
       {errors.title && <ThemedText style={styles.errorText}>{errors.title}</ThemedText>}
       
       <ThemedText style={styles.label}>詳細 (任意)</ThemedText>
       <TextInput
         style={[styles.input, styles.textArea]}
         value={description}
         onChangeText={setDescription}
         placeholder="タスクの詳細を入力"
         placeholderTextColor="#999"
         multiline
         numberOfLines={4}
         textAlignVertical="top"
       />
       
       <ThemedText style={styles.label}>所要時間 (分)</ThemedText>
       <TextInput
         style={[styles.input, errors.estimatedDuration && styles.inputError]}
         value={estimatedDuration}
         onChangeText={setEstimatedDuration}
         placeholder="30"
         placeholderTextColor="#999"
         keyboardType="numeric"
       />
       {errors.estimatedDuration && 
         <ThemedText style={styles.errorText}>{errors.estimatedDuration}</ThemedText>
       }
       
       {renderCategorySelector()}
       {renderPrioritySelector()}
       
       <ThemedView style={styles.dueDateContainer}>
         <ThemedText style={styles.label}>期限</ThemedText>
         <View style={styles.dueDateRow}>
           <Switch
             value={hasDueDate}
             onValueChange={setHasDueDate}
             trackColor={{ false: '#ccc', true: colors.primary }}
             thumbColor={'white'}
           />
           <ThemedText style={styles.switchLabel}>
             {hasDueDate ? '期限あり' : '期限なし'}
           </ThemedText>
         </View>
         
         {hasDueDate && (
           <TouchableOpacity 
             style={styles.dateButton}
             onPress={() => setShowDatePicker(true)}
           >
             <ThemedText style={styles.dateButtonText}>
               {dueDate.toLocaleDateString('ja-JP', { 
                 year: 'numeric', 
                 month: 'long', 
                 day: 'numeric',
                 hour: '2-digit',
                 minute: '2-digit'
               })}
             </ThemedText>
           </TouchableOpacity>
         )}
         
         {showDatePicker && (
           <DateTimePicker
             value={dueDate}
             mode="datetime"
             display="default"
             onChange={handleDateChange}
           />
         )}
       </ThemedView>
       
       <ThemedView style={styles.buttonContainer}>
         <TouchableOpacity 
           style={[styles.button, styles.cancelButton]}
           onPress={() => {
             dispatch(clearSelectedTask());
             router.back();
           }}
         >
           <ThemedText style={styles.cancelButtonText}>キャンセル</ThemedText>
         </TouchableOpacity>
         
         <TouchableOpacity 
           style={[styles.button, styles.saveButton]}
           onPress={handleSave}
         >
           <ThemedText style={styles.saveButtonText}>
             {isEditMode ? '更新' : '作成'}
           </ThemedText>
         </TouchableOpacity>
       </ThemedView>
     </ThemedView>
   </ScrollView>
 );
}

const styles = StyleSheet.create({
 container: {
   flex: 1,
 },
 formContainer: {
   padding: 16,
 },
 label: {
   fontSize: 16,
   fontWeight: '500',
   marginBottom: 8,
 },
 input: {
   backgroundColor: '#f8f8f8',
   borderWidth: 1,
   borderColor: '#ddd',
   borderRadius: 8,
   padding: 12,
   fontSize: 16,
   marginBottom: 16,
 },
 inputError: {
   borderColor: '#F45B69',
 },
 textArea: {
   height: 100,
   textAlignVertical: 'top',
 },
 errorText: {
   color: '#F45B69',
   marginTop: -12,
   marginBottom: 16,
   fontSize: 14,
 },
 categoryContainer: {
   flexDirection: 'row',
   flexWrap: 'wrap',
   marginBottom: 16,
 },
 categoryButton: {
   borderWidth: 1,
   borderColor: '#ddd',
   borderRadius: 8,
   padding: 10,
   marginRight: 8,
   marginBottom: 8,
 },
 categoryButtonText: {
   fontSize: 14,
 },
 priorityContainer: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   marginBottom: 16,
 },
 priorityButton: {
   flex: 1,
   borderWidth: 1,
   borderColor: '#ddd',
   borderRadius: 8,
   padding: 10,
   marginHorizontal: 4,
   alignItems: 'center',
 },
 priorityButtonText: {
   fontSize: 14,
 },
 dueDateContainer: {
   marginBottom: 16,
 },
 dueDateRow: {
   flexDirection: 'row',
   alignItems: 'center',
   marginBottom: 12,
 },
 switchLabel: {
   marginLeft: 8,
   fontSize: 16,
 },
 dateButton: {
   backgroundColor: '#f8f8f8',
   borderWidth: 1,
   borderColor: '#ddd',
   borderRadius: 8,
   padding: 12,
 },
 dateButtonText: {
   fontSize: 16,
 },
 buttonContainer: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   marginTop: 16,
 },
 button: {
   flex: 1,
   borderRadius: 8,
   padding: 16,
   alignItems: 'center',
 },
 cancelButton: {
   borderWidth: 1,
   borderColor: '#ddd',
   marginRight: 8,
 },
 cancelButtonText: {
   fontSize: 16,
 },
 saveButton: {
   backgroundColor: '#3E7BFA',
   marginLeft: 8,
 },
 saveButtonText: {
   color: 'white',
   fontSize: 16,
   fontWeight: '500',
 },
});