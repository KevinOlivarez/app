import { Text, TextProps } from 'react-native';

export function RegularText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'Poppins-Regular' }]} />;
}

export function MediumText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'Poppins-Medium' }]} />;
}

export function SemiBoldText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'Poppins-SemiBold' }]} />;
}

export function BoldText(props: TextProps) {
  return <Text {...props} style={[props.style, { fontFamily: 'Poppins-Bold' }]} />;
}