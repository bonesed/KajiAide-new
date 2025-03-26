import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  TouchableOpacityProps,
  ActivityIndicator,
  View
} from 'react-native';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  leftIcon,
  rightIcon,
  loading = false,
  fullWidth = false,
  style,
  ...props
}) => {
  // スタイルの組み合わせ
  const buttonStyle = [
    styles.button,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    fullWidth && styles.fullWidth,
    (variant === 'primary' || variant === 'secondary') && Shadows.small,
    disabled && styles.disabledButton,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          color={variant === 'primary' || variant === 'secondary' ? Colors.background : Colors.primary} 
          size="small" 
        />
      );
    }

    return (
      <View style={styles.contentContainer}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <Text style={textStyle}>{title}</Text>
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.accent,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
    padding: Spacing.xs,
  },
  smallButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  mediumButton: {},
  largeButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  fullWidth: {
    width: '100%',
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: variant === 'primary' ? Colors.textMuted : undefined,
    borderColor: variant === 'outline' ? Colors.textMuted : undefined,
  },
  text: {
    ...Typography.button,
    textAlign: 'center',
  },
  primaryText: {
    color: Colors.background,
  },
  secondaryText: {
    color: Colors.background,
  },
  outlineText: {
    color: Colors.primary,
  },
  textText: {
    color: Colors.primary,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {},
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    color: variant === 'primary' || variant === 'secondary' ? Colors.background : Colors.textMuted,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: Spacing.xs,
  },
  iconRight: {
    marginLeft: Spacing.xs,
  },
});

export default Button;
