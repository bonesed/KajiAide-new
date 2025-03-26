// components/TaskItem.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface TaskItemProps {
  title: string;
  category: string;
  duration: number;
  priority: 'high' | 'medium' | 'low';
  onPress?: () => void;
}

export function TaskItem({ title, category, duration, priority, onPress }: TaskItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      default: return colors.accent;
    }
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <ThemedView style={styles.container}>
        <ThemedView style={[styles.priorityIndicator, { backgroundColor: getPriorityColor() }]} />
        <ThemedView style={styles.content}>
          <ThemedText type="defaultSemiBold" style={styles.title}>{title}</ThemedText>
          <ThemedView style={styles.metaContainer}>
            <ThemedView style={styles.categoryBadge}>
              <ThemedText style={styles.categoryText}>{category}</ThemedText>
            </ThemedView>
            <ThemedText style={styles.duration}>{duration}分</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priorityIndicator: {
    width: 4,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  duration: {
    fontSize: 12,
    color: '#666',
  },
});