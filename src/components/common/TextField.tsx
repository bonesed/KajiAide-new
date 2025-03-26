import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TextInputProps,
  TouchableOpacity
} from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../../theme';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: any;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const handleFocus = () => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur();
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.focusedInput,
        error && styles.errorInput,
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.rightIcon} 
            onPress={togglePasswordVisibility}
          >
            <Text style={styles.toggleText}>
              {isPasswordVisible ? '非表示' : '表示'}
            </Text>
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity 
            style={styles.rightIcon} 
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[
          styles.helperText,
          error && styles.errorText
        ]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.body2,
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontWeight: Typography.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  focusedInput: {
    borderColor: Colors.primary,
  },
  errorInput: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
    ...Typography.body1,
  },
  leftIcon: {
    paddingLeft: Spacing.md,
  },
  rightIcon: {
    paddingRight: Spacing.md,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  errorText: {
    color: Colors.error,
  },
  toggleText: {
    color: Colors.primary,
    ...Typography.caption,
    fontWeight: Typography.medium,
  }
});

export default TextField;
