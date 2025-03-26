import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

const EmptyState = ({ icon, message, subMessage }) => {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      <Ionicons 
        name={icon || 'information-circle-outline'} 
        size={60} 
        color={theme.colors.textSecondary} 
      />
      <Text style={[styles.message, { color: theme.colors.text }]}>
        {message || 'データがありません'}
      </Text>
      {subMessage && (
        <Text style={[styles.subMessage, { color: theme.colors.textSecondary }]}>
          {subMessage}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  subMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default EmptyState;