import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { RegularText, SemiBoldText } from '@/components/StyledText';
import Button from '@/components/ui/Button';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Bienvenido a Recreo Lovers',
    description: 'Tu programa de recompensas exclusivo del Centro Comercial El Recreo',
    image: { uri: 'https://images.pexels.com/photos/5650048/pexels-photo-5650048.jpeg' },
  },
  {
    id: '2',
    title: 'Gana Puntos',
    description: 'Registra tus facturas y acumula puntos por cada compra que realices',
    image: { uri: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg' },
  },
  {
    id: '3',
    title: 'Eventos Exclusivos',
    description: 'Participa en eventos especiales y obtén beneficios únicos',
    image: { uri: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg' },
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof slides[0] }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <SemiBoldText style={styles.title}>{item.title}</SemiBoldText>
        <RegularText style={styles.description}>{item.description}</RegularText>
      </View>
    </View>
  );

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleSkip}>
            <RegularText style={styles.skipText}>Omitir</RegularText>
          </TouchableOpacity>
          <Button
            title={currentIndex === slides.length - 1 ? 'Comenzar' : 'Siguiente'}
            onPress={handleNext}
            style={styles.nextButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
  slide: {
    width,
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 40,
    paddingBottom: 140,
  },
  title: {
    fontSize: 32,
    color: Colors.light.white,
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    color: Colors.light.white,
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.white + '80',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: Colors.light.white,
    width: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipText: {
    color: Colors.light.white,
    fontSize: 16,
  },
  nextButton: {
    paddingHorizontal: 32,
  },
});