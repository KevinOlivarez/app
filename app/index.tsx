import { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useFonts } from 'expo-font';
import Logo from '../assets/logoWhite';
import Icons from '../assets/icon';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [fontsLoaded] = useFonts({
    Ultra: require('./../assets/fonts/MergeBlackW00-Regular.ttf'),
  });
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.centerContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../assets/images/iconsCorazon.png')}
          style={styles.recreoIcon}
          resizeMode="contain"
        />
        <Text
          style={{
            fontFamily: 'Ultra',
            fontSize: 38,
            color: 'white',
            lineHeight: 40,
            textAlign: 'center',
          }}
        >
          RECREO{'\n'}LOVERS
        </Text>
        <Logo style={styles.recreologo} width={200} height={200} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#04833c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 350,
    fontFamily: 'MergeBlackW00-Regular',
  },

  recreoIcon: {
    marginTop: 0,
    marginBottom: 40,
    width: 100,
    height: 100,
  },
  recreologo: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
  },
});
