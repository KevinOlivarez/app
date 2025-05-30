import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';
import Colors from '@/constants/Colors';
import { RegularText, SemiBoldText } from '../StyledText';
import { Calendar, MapPin } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 64) / 2;

type EventCardProps = {
  title: string;
  date: string;
  location: string;
  image: ImageSourcePropType;
  onPress: () => void;
};

export default function EventCard({ title, date, location, image, onPress }: EventCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <Image source={image} style={styles.image} />
      <View style={styles.content}>
        <SemiBoldText style={styles.title} numberOfLines={2}>
          {title}
        </SemiBoldText>
        <View style={styles.infoItem}>
          <Calendar size={14} color={Colors.light.text} />
          <RegularText style={styles.infoText}>{date}</RegularText>
        </View>
        <View style={styles.infoItem}>
          <MapPin size={14} color={Colors.light.text} />
          <RegularText style={styles.infoText}>{location}</RegularText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.light.white,
    marginHorizontal: 8,
  },
  image: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  content: {
    padding: 8,
  },
  title: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: Colors.light.text,
    marginLeft: 4,
  },
});
