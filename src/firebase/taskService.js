import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    getDocs, 
    query, 
    where,
    orderBy,
    serverTimestamp
  } from 'firebase/firestore';
  import { db, auth } from './config';
  
  // タスクコレクションの参照を取得
  const getTasksRef = () => {
    const user = auth.currentUser;
    if (!user) throw new Error('ユーザーがログインしていません');
    return collection(db, 'users', user.uid, 'tasks');
  };
  
  // タスク一覧の取得
  export const fetchTasks = async () => {
    try {
      const tasksRef = getTasksRef();
      const q = query(
        tasksRef,
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return tasks;
    } catch (error) {
      console.error('タスクの取得に失敗:', error);
      throw error;
    }
  };
  
  // タスクの追加
  export const addTask = async (taskData) => {
    try {
      const tasksRef = getTasksRef();
      const newTask = {
        ...taskData,
        completed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(tasksRef, newTask);
      return {
        id: docRef.id,
        ...newTask
      };
    } catch (error) {
      console.error('タスクの追加に失敗:', error);
      throw error;
    }
  };
  
  // タスクの更新
  export const updateTask = async (taskId, taskData) => {
    try {
      const taskRef = doc(getTasksRef(), taskId);
      
      const updatedTask = {
        ...taskData,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(taskRef, updatedTask);
      return {
        id: taskId,
        ...updatedTask
      };
    } catch (error) {
      console.error('タスクの更新に失敗:', error);
      throw error;
    }
  };
  
  // タスクの削除
  export const deleteTask = async (taskId) => {
    try {
      const taskRef = doc(getTasksRef(), taskId);
      await deleteDoc(taskRef);
      return taskId;
    } catch (error) {
      console.error('タスクの削除に失敗:', error);
      throw error;
    }
  };
  
  // 完了タスクの切り替え
  export const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      const taskRef = doc(getTasksRef(), taskId);
      await updateDoc(taskRef, {
        completed: !currentStatus,
        updatedAt: serverTimestamp()
      });
      return {
        id: taskId,
        completed: !currentStatus
      };
    } catch (error) {
      console.error('タスク完了状態の切り替えに失敗:', error);
      throw error;
    }
  };
  
  // 指定日のタスク取得
  export const fetchTasksByDate = async (date) => {
    try {
      const tasksRef = getTasksRef();
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      const q = query(
        tasksRef,
        where('dueDate', '>=', startDate),
        where('dueDate', '<=', endDate)
      );
      
      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        tasks.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return tasks;
    } catch (error) {
      console.error('日付によるタスク取得に失敗:', error);
      throw error;
    }
  };