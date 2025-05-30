import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { BoldText, RegularText } from '../StyledText';
import { getUserInfo } from '@/utils/storage';

const BASE_URL = 'https://backend.ccelrecreo.com/server.php/api/canjeappPuntos';

export default function PointsCard() {
  const [userName, setUserName] = useState('');
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const user = await getUserInfo();

        if (!user || !user.ID_CUENTAS) {
          Alert.alert('Error', 'ID de usuario no encontrado');
          return;
        }

        console.log('Obteniendo puntos con ID_CUENTAS:', user.ID_CUENTAS);
        console.log(
          'URL generada:',
          `${BASE_URL}?ID_CUENTAS=${user.ID_CUENTAS}`
        );

        setUserName(user.NOMBRE_CUENTAS);

        const response = await axios.get(
          `${BASE_URL}?ID_CUENTAS=${user.ID_CUENTAS}`
        );
        console.log('Respuesta completa:', response);

        const json = response.data;

        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const puntos = json.data[0].PUNTOSDISPONIBLES_PUNTOSCUENTAPP ?? 0;
          setPoints(puntos);
        } else {
          Alert.alert('Advertencia', 'No se encontraron puntos disponibles.');
        }
      } catch (error) {
        console.error('Error al obtener puntos:', error?.message ?? error);
        Alert.alert('Error', 'Hubo un problema al obtener los puntos');
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(1, { duration: 500 }),
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    fontSize: withTiming(80, {
      duration: 1000,
      easing: Easing.out(Easing.ease),
    }),
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <View style={styles.content}>
          <RegularText style={styles.greeting}>
            Hola {userName}, tienes
          </RegularText>
          <View style={styles.pointsContainer}>
            <Animated.Text style={[styles.points, animatedTextStyle]}>
              {points}
            </Animated.Text>
            <RegularText style={styles.pointsLabel}>PUNTOS</RegularText>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 4,
  },
  greeting: {
    fontSize: 24,
    color: Colors.light.white,
    marginBottom: 8,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  points: {
    fontFamily: 'Poppins-Bold',
    color: Colors.light.white,
    marginRight: 8,
  },
  pointsLabel: {
    fontSize: 18,
    color: Colors.light.white,
    marginBottom: 16,
  },
});
