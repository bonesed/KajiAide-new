// app/(tabs)/index.tsx
import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { TaskItem } from '@/components/TaskItem';

export default function HomeScreen() {
  // サンプルタスク
  const tasks = [
    { id: '1', title: '洗濯機を回す', category: '洗濯', duration: 15, priority: 'medium' },
    { id: '2', title: '掃除機をかける', category: '掃除', duration: 30, priority: 'high' },
    { id: '3', title: '夕食の準備', category: '料理', duration: 45, priority: 'high' },
    { id: '4', title: '食材の買い出し', category: '買い物', duration: 60, priority: 'medium' },
  ];

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>カジエイド</ThemedText>
          <ThemedText style={styles.subtitle}>AI家事コンシェルジュ</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>今日のタスク</ThemedText>
          
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              title={task.title}
              category={task.category}
              duration={task.duration}
              priority={task.priority}
              onPress={() => console.log(`タスク選択: ${task.title}`)}
            />
          ))}
        </ThemedView>
        
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>AI提案</ThemedText>
          <ThemedText style={styles.cardContent}>
            洗濯タスクを水曜日の朝に移動すると、あなたの朝の余裕時間を活用でき、他の平日の負担が減ります。
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 20,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 8,
    fontSize: 18,
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 20,
  }
});