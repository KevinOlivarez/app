import React from 'react';
import { TouchableOpacity, StyleSheet, View, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';
import { RegularText } from '../StyledText';

type FeatureButtonProps = {
  title: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
  style?: ViewStyle;
};

export default function FeatureButton({ title, icon, color, onPress, style }: FeatureButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: color }, style]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <RegularText style={styles.title}>{title}</RegularText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
    shadowColor: Colors.light.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginBottom: 10,
  },
  title: {
    color: Colors.light.white,
    fontSize: 14,
    textAlign: 'center',
  },
});