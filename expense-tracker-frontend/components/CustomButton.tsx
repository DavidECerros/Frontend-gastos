import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { COLORS } from '../constants';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  size = 'medium',
  disabled,
  style,
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    if (disabled || loading) {
      baseStyle.push(styles.disabled);
    } else {
      baseStyle.push(styles[variant]);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]];
    
    if (variant === 'outline') {
      baseStyle.push(styles.outlineText);
    } else {
      baseStyle.push(styles.solidText);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      {...props}
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? COLORS.primary : COLORS.surface} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  
  // Variants
  primary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: COLORS.primary,
  },
  disabled: {
    backgroundColor: COLORS.textSecondary,
    borderColor: COLORS.textSecondary,
  },
  
  // Sizes
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  solidText: {
    color: COLORS.surface,
  },
  outlineText: {
    color: COLORS.primary,
  },
});