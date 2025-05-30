import { TouchableOpacity, StyleSheet, ViewStyle, View } from 'react-native';
import { RegularText } from '../StyledText';
import Colors from '@/constants/Colors';

type SocialButtonProps = {
  title: string;
  onPress: () => void;
  icon: React.ReactNode;
  color?: string;
  style?: ViewStyle;
};

export default function SocialButton({
  title,
  onPress,
  icon,
  color = Colors.light.white,
  style,
}: SocialButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: color },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>{icon}</View>
        <RegularText style={styles.text}>{title}</RegularText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    color: Colors.light.black,
  },
});