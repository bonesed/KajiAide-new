import React, { useState, useEffect } from 'react';
import { 
 View, 
 Text, 
 StyleSheet, 
 ScrollView, 
 TouchableOpacity,
 Platform,
 KeyboardAvoidingView,
 Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../store/hooks/useRedux';
import { createTask, updateTask } from '../../store/slices/tasksSlice';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import TextField from '../../components/common/TextField';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const TaskFormScreen = ({ route }) => {
 const navigation = useNavigation();
 const dispatch = useAppDispatch();
 const { selectedTask, loading } = useAppSelector(state => state.tasks);
 const { user } = useAppSelector(state => state.auth);
 
 const isEditMode = !!selectedTask;
 const initialValues = isEditMode ? selectedTask : null;
 
 // フォームの状態
 const [title, setTitle] = useState(initialValues?.title || '');
 const [description, setDescription] = useState(initialValues?.description || '');
 const [category, setCategory] = useState(initialValues?.category || 'cleaning');
 const [estimatedDuration, setEstimatedDuration] = useState(
   initialValues?.estimatedDuration ? initialValues.estimatedDuration.toString() : '30'
 );
 const [priority, setPriority] = useState(initialValues?.priority || 'medium');
 const [dueDate, setDueDate] = useState(initialValues?.dueDate ? new Date(initialValues.dueDate) : new Date());
 const [showDatePicker, setShowDatePicker] = useState(false);
 
 const [errors, setErrors] = useState({});
 
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
     description,
     category,
     estimatedDuration: parseInt(estimatedDuration),
     priority,
     status: initialValues?.status || 'pending',
     dueDate,
     createdBy: user?.uid || 'user1',
   };
   
   if (isEditMode) {
     dispatch(updateTask({ 
       taskId: selectedTask.id, 
       task: taskData 
     }));
   } else {
     dispatch(createTask(taskData));
   }
   
   navigation.goBack();
 };
 
 // カテゴリー選択UI
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
     <View style={styles.selectorContainer}>
       <Text style={styles.label}>カテゴリ</Text>
       <View style={styles.categoryButtons}>
         {categories.map(cat => (
           <TouchableOpacity
             key={cat.id}
             style={[
               styles.categoryButton,
               category === cat.id && styles.selectedCategoryButton
             ]}
             onPress={() => setCategory(cat.id)}
           >
             <Text 
               style={[
                 styles.categoryButtonText,
                 category === cat.id && styles.selectedCategoryButtonText
               ]}
             >
               {cat.label}
             </Text>
           </TouchableOpacity>
         ))}
       </View>
     </View>
   );
 };
 
 // 優先度選択UI
 const renderPrioritySelector = () => {
   const priorities = [
     { id: 'low', label: '低' },
     { id: 'medium', label: '中' },
     { id: 'high', label: '高' },
   ];
   
   return (
     <View style={styles.selectorContainer}>
       <Text style={styles.label}>優先度</Text>
       <View style={styles.priorityButtons}>
         {priorities.map(p => (
           <TouchableOpacity
             key={p.id}
             style={[
               styles.priorityButton,
               priority === p.id && styles.selectedPriorityButton,
               priority === p.id && { backgroundColor: getPriorityColor(p.id) }
             ]}
             onPress={() => setPriority(p.id)}
           >
             <Text 
               style={[
                 styles.priorityButtonText,
                 priority === p.id && styles.selectedPriorityButtonText
               ]}
             >
               {p.label}
             </Text>
           </TouchableOpacity>
         ))}
       </View>
     </View>
   );
 };
 
 // 日付選択UI（実際の実装ではDatePickerを使用）
 const renderDateSelector = () => {
   return (
     <View style={styles.selectorContainer}>
       <Text style={styles.label}>期限</Text>
       <TouchableOpacity 
         style={styles.dateButton}
         onPress={() => console.log('日付選択')}
       >
         <Text style={styles.dateText}>
           {dueDate.toLocaleDateString('ja-JP', { 
             year: 'numeric', 
             month: 'long', 
             day: 'numeric',
             hour: '2-digit',
             minute: '2-digit'
           })}
         </Text>
       </TouchableOpacity>
     </View>
   );
 };
 
 return (
   <SafeAreaView style={styles.container}>
     <KeyboardAvoidingView
       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
       style={styles.keyboardAvoidingView}
     >
       <ScrollView style={styles.scrollView}>
         <View style={styles.header}>
           <Text style={styles.title}>{isEditMode ? 'タスクを編集' : '新規タスク作成'}</Text>
         </View>
         
         <Card style={styles.formCard}>
           <TextField
             label="タイトル"
             placeholder="タスクのタイトルを入力"
             value={title}
             onChangeText={setTitle}
             error={errors.title}
             containerStyle={styles.inputContainer}
           />
           
           <TextField
             label="詳細 (任意)"
             placeholder="タスクの詳細を入力"
             value={description}
             onChangeText={setDescription}
             multiline
             numberOfLines={4}
             containerStyle={styles.inputContainer}
             style={styles.textArea}
           />
           
           <TextField
             label="所要時間 (分)"
             placeholder="30"
             value={estimatedDuration}
             onChangeText={setEstimatedDuration}
             keyboardType="numeric"
             error={errors.estimatedDuration}
             containerStyle={styles.inputContainer}
           />
           
           {renderCategorySelector()}
           {renderPrioritySelector()}
           {renderDateSelector()}
           
           <View style={styles.buttonsContainer}>
             <Button 
               title="キャンセル" 
               onPress={() => navigation.goBack()} 
               variant="outline"
               style={styles.cancelButton}
             />
             <Button 
               title={isEditMode ? '更新' : '作成'} 
               onPress={handleSave} 
               loading={loading}
               style={styles.saveButton}
             />
           </View>
         </Card>
       </ScrollView>
     </KeyboardAvoidingView>
   </SafeAreaView>
 );
};

// ユーティリティ関数
const getPriorityColor = (priority) => {
 switch (priority) {
   case 'high': return Colors.error;
   case 'medium': return Colors.warning;
   case 'low': return Colors.accent;
   default: return Colors.warning;
 }
};

const styles = StyleSheet.create({
 container: {
   flex: 1,
   backgroundColor: Colors.background,
 },
 keyboardAvoidingView: {
   flex: 1,
 },
 scrollView: {
   flex: 1,
 },
 header: {
   padding: Spacing.lg,
   borderBottomWidth: 1,
   borderBottomColor: Colors.border,
   backgroundColor: Colors.surface,
 },
 title: {
   ...Typography.h2,
   color: Colors.text,
 },
 formCard: {
   margin: Spacing.lg,
 },
 inputContainer: {
   marginBottom: Spacing.md,
 },
 textArea: {
   height: 120,
   textAlignVertical: 'top',
 },
 label: {
   ...Typography.body2,
   fontWeight: Typography.medium,
   color: Colors.text,
   marginBottom: Spacing.sm,
 },
 selectorContainer: {
   marginBottom: Spacing.lg,
 },
 categoryButtons: {
   flexDirection: 'row',
   flexWrap: 'wrap',
   marginHorizontal: -Spacing.xs,
 },
 categoryButton: {
   paddingHorizontal: Spacing.md,
   paddingVertical: Spacing.sm,
   borderRadius: BorderRadius.md,
   backgroundColor: Colors.surfaceLight,
   marginHorizontal: Spacing.xs,
   marginBottom: Spacing.xs,
   borderWidth: 1,
   borderColor: Colors.border,
 },
 selectedCategoryButton: {
   backgroundColor: Colors.primary,
   borderColor: Colors.primary,
 },
 categoryButtonText: {
   ...Typography.body2,
   color: Colors.text,
 },
 selectedCategoryButtonText: {
   color: Colors.background,
   fontWeight: Typography.medium,
 },
 priorityButtons: {
   flexDirection: 'row',
   justifyContent: 'space-between',
 },
 priorityButton: {
   flex: 1,
   alignItems: 'center',
   paddingVertical: Spacing.sm,
   marginHorizontal: Spacing.xs,
   borderRadius: BorderRadius.md,
   backgroundColor: Colors.surfaceLight,
   borderWidth: 1,
   borderColor: Colors.border,
 },
 selectedPriorityButton: {
   borderColor: 'transparent',
 },
 priorityButtonText: {
   ...Typography.body2,
   color: Colors.text,
 },
 selectedPriorityButtonText: {
   color: Colors.background,
   fontWeight: Typography.medium,
 },
 dateButton: {
   padding: Spacing.md,
   borderRadius: BorderRadius.md,
   backgroundColor: Colors.surfaceLight,
   borderWidth: 1,
   borderColor: Colors.border,
 },
 dateText: {
   ...Typography.body1,
   color: Colors.text,
 },
 buttonsContainer: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   marginTop: Spacing.md,
 },
 cancelButton: {
   flex: 1,
   marginRight: Spacing.sm,
 },
 saveButton: {
   flex: 1,
   marginLeft: Spacing.sm,
 },
});

export default TaskFormScreen;
