import tasksReducer, {
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion
  } from '../../../src/store/slices/tasksSlice';
  
  // モックのタスクサービス
  jest.mock('../../../src/firebase/taskService', () => ({
    fetchTasks: jest.fn(),
    addTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    toggleTaskCompletion: jest.fn()
  }));
  
  describe('tasksSlice', () => {
    let initialState;
  
    beforeEach(() => {
      initialState = {
        tasks: [],
        status: 'idle',
        error: null
      };
    });
  
    test('初期状態を返すべき', () => {
      expect(tasksReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  
    describe('fetchTasks', () => {
      test('pending状態を正しく処理すべき', () => {
        const action = { type: fetchTasks.pending.type };
        const state = tasksReducer(initialState, action);
        expect(state.status).toEqual('loading');
      });
  
      test('fulfilled状態を正しく処理すべき', () => {
        const mockTasks = [
          { id: '1', title: 'テストタスク1' },
          { id: '2', title: 'テストタスク2' }
        ];
        const action = { 
          type: fetchTasks.fulfilled.type,
          payload: mockTasks
        };
        const state = tasksReducer(initialState, action);
        expect(state.status).toEqual('succeeded');
        expect(state.tasks).toEqual(mockTasks);
      });
  
      test('rejected状態を正しく処理すべき', () => {
        const action = { 
          type: fetchTasks.rejected.type,
          payload: 'エラーメッセージ'
        };
        const state = tasksReducer(initialState, action);
        expect(state.status).toEqual('failed');
        expect(state.error).toEqual('エラーメッセージ');
      });
    });
  
    describe('addTask', () => {
      test('新しいタスクを追加すべき', () => {
        const newTask = { id: '3', title: '新しいタスク' };
        const action = {
          type: addTask.fulfilled.type,
          payload: newTask
        };
        const state = tasksReducer(initialState, action);
        expect(state.tasks).toContainEqual(newTask);
      });
    });
  
    describe('updateTask', () => {
      test('既存のタスクを更新すべき', () => {
        const stateWithTasks = {
          ...initialState,
          tasks: [
            { id: '1', title: 'タスク1', completed: false },
            { id: '2', title: 'タスク2', completed: false }
          ]
        };
        
        const updatedTask = { id: '1', title: '更新済みタスク', completed: false };
        const action = {
          type: updateTask.fulfilled.type,
          payload: updatedTask
        };
        
        const state = tasksReducer(stateWithTasks, action);
        expect(state.tasks.find(task => task.id === '1')).toEqual(updatedTask);
        expect(state.tasks.length).toBe(2);
      });
    });
  
    describe('deleteTask', () => {
      test('タスクを削除すべき', () => {
        const stateWithTasks = {
          ...initialState,
          tasks: [
            { id: '1', title: 'タスク1' },
            { id: '2', title: 'タスク2' }
          ]
        };
        
        const action = {
          type: deleteTask.fulfilled.type,
          payload: '1'
        };
        
        const state = tasksReducer(stateWithTasks, action);
        expect(state.tasks.length).toBe(1);
        expect(state.tasks[0].id).toBe('2');
      });
    });
  
    describe('toggleTaskCompletion', () => {
      test('タスクの完了状態を切り替えるべき', () => {
        const stateWithTasks = {
          ...initialState,
          tasks: [
            { id: '1', title: 'タスク1', completed: false },
            { id: '2', title: 'タスク2', completed: true }
          ]
        };
        
        const action = {
          type: toggleTaskCompletion.fulfilled.type,
          payload: { id: '1', completed: true }
        };
        
        const state = tasksReducer(stateWithTasks, action);
        expect(state.tasks.find(task => task.id === '1').completed).toBe(true);
        expect(state.tasks.find(task => task.id === '2').completed).toBe(true);
      });
    });
  });
  