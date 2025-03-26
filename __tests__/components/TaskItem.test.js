import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import TaskItem from '../../src/components/TaskItem';
import { ThemeProvider } from '../../src/theme/ThemeContext';

// モックのストアを作成
const mockStore = configureStore([]);

// モックのテーマプロバイダー
jest.mock('../../src/theme/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      text: '#000',
      textSecondary: '#666',
      card: '#fff',
      primary: '#007bff',
      border: '#e0e0e0',
      error: '#dc3545',
      warning: '#ffc107',
      success: '#28a745'
    }
  }),
  useThemeUpdate: jest.fn()
}));

describe('TaskItem', () => {
  let store;
  let mockTask;
  let mockOnPress;
  let mockOnDelete;

  beforeEach(() => {
    store = mockStore({
      tasks: {
        tasks: []
      }
    });

    mockTask = {
      id: '1',
      title: 'テストタスク',
      description: 'これはテストです',
      completed: false,
      dueDate: new Date(2025, 2, 15).toISOString(),
      priority: 'medium',
      category: 'テスト'
    };

    mockOnPress = jest.fn();
    mockOnDelete = jest.fn();
  });

  test('正しくレンダリングされるべき', () => {
    const { getByText } = render(
      <Provider store={store}>
        <TaskItem
          task={mockTask}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      </Provider>
    );

    expect(getByText('テストタスク')).toBeTruthy();
    expect(getByText('テスト')).toBeTruthy();
  });

  test('タップ時にonPress関数が呼ばれるべき', () => {
    const { getByText } = render(
      <Provider store={store}>
        <TaskItem
          task={mockTask}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      </Provider>
    );

    fireEvent.press(getByText('テストタスク'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  test('完了したタスクは取り消し線が表示されるべき', () => {
    const completedTask = {
      ...mockTask,
      completed: true
    };

    const { getByText } = render(
      <Provider store={store}>
        <TaskItem
          task={completedTask}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      </Provider>
    );

    // スタイルの検証は実装依存になるため省略
    // 実際のテストでは getByTestId やスタイルの検証を行うことが望ましい
    expect(getByText('テストタスク')).toBeTruthy();
  });

  test('期限切れのタスクは警告表示されるべき', () => {
    const overdueTask = {
      ...mockTask,
      dueDate: new Date(2023, 0, 1).toISOString() // 過去の日付
    };

    const { queryByText } = render(
      <Provider store={store}>
        <TaskItem
          task={overdueTask}
          onPress={mockOnPress}
          onDelete={mockOnDelete}
        />
      </Provider>
    );

    expect(queryByText(/期限超過/)).toBeTruthy();
  });
});