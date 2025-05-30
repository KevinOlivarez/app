import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { RegularText } from '../StyledText';
import Colors from '@/constants/Colors';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  secureTextEntry?: boolean;
}

export default function Input({
  label,
  error,
  leftIcon,
  secureTextEntry,
  style,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      {label && <RegularText style={styles.label}>{label}</RegularText>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focused,
          error && styles.error,
          style,
        ]}
      >
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.light.darkGray}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.rightIconContainer} 
            onPress={togglePasswordVisibility}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={Colors.light.darkGray} />
            ) : (
              <Eye size={20} color={Colors.light.darkGray} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <RegularText style={styles.errorText}>{error}</RegularText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: Colors.light.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.darkGray,
    borderRadius: 8,
    backgroundColor: Colors.light.white,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 48,
    paddingVertical: 8,
    fontFamily: 'Poppins-Regular',
    color: Colors.light.text,
  },
  focused: {
    borderColor: Colors.light.primary,
  },
  error: {
    borderColor: Colors.light.error,
  },
  leftIconContainer: {
    marginRight: 10,
  },
  rightIconContainer: {
    padding: 8,
  },
  errorText: {
    fontSize: 12,
    color: Colors.light.error,
    marginTop: 4,
  },
});