import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors, BorderRadius, Shadows } from '../../theme';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  children,
  style,
  ...props
}) => {
  return (
    <View 
      style={[
        styles.card, 
        styles[`${variant}Card`],
        variant === 'elevated' && Shadows.medium,
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    padding: 16,
    backgroundColor: Colors.card,
  },
  elevatedCard: {
    backgroundColor: Colors.card,
  },
  outlinedCard: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filledCard: {
    backgroundColor: Colors.surfaceLight,
  },
});

export default Card;
