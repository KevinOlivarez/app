import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  Text,
} from 'react-native';
import axios from 'axios';
import Colors from '@/constants/Colors';
import { RegularText, SemiBoldText, BoldText } from '@/components/StyledText';
import Card from '@/components/ui/Card';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getUserData } from '@/utils/auth';

const { width } = Dimensions.get('window');
const API_BASE = 'https://backend.ccelrecreo.com/server.php/api';

export default function RedeemScreen() {
  const router = useRouter();
  const [userPoints, setUserPoints] = useState<number>(0);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [rewardSeleccionado, setRewardSeleccionado] = useState(null);
  const [canjesPendientes, setCanjesPendientes] = useState([]);
  const [historialVisible, setHistorialVisible] = useState(false);

  const fetchCanjesPendientes = async () => {
    try {
      const user = await getUserData();
      if (!user || !user.ID_CUENTAS) return;

      const response = await axios.get(`${API_BASE}/productosappCanjeados`, {
        params: {
          ID_CUENTAS: user.ID_CUENTAS,
          ESTADO_CANJESPRODUCTOSAPP: 'P',
        },
      });
      console.log('kevin', response);

      if (Array.isArray(response.data)) {
        setCanjesPendientes(response.data);
        setHistorialVisible(true);
      }
    } catch (error) {
      console.error('Error al obtener historial de canjes:', error);
      Alert.alert('Error', 'No se pudo cargar el historial.');
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await axios.get(`${API_BASE}/productosapp`);

      if (Array.isArray(response.data)) {
        const activos = response.data.filter(
          (item) => item.ESTADO_PRODUCTOSAPP === 'A'
        );
        setRewards(activos);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      Alert.alert('Error', 'No se pudieron cargar las recompensas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  useEffect(() => {
    const loadPoints = async () => {
      try {
        const user = await getUserData();
        if (user && user.ID_CUENTAS) {
          const response = await axios.get(
            `${API_BASE}/canjeappPuntos?ID_CUENTAS=${user.ID_CUENTAS}`
          );

          if (response.data?.success && response.data.data?.length > 0) {
            const puntos =
              response.data.data[0].PUNTOSDISPONIBLES_PUNTOSCUENTAPP ?? 0;
            setUserPoints(puntos);
          } else {
            console.warn('No se encontraron puntos disponibles.');
          }
        }
      } catch (error) {
        console.error('Error al cargar puntos del usuario:', error);
      }
    };

    loadPoints();
    fetchRewards();
  }, []);

  const redeemReward = async (reward) => {
    try {
      const user = await getUserData();
      if (!user || !user.ID_CUENTAS) {
        Alert.alert('Error', 'Usuario no válido');
        return;
      }

      if (userPoints < reward.PUNTOS_PRODUCTOSAPP) {
        Alert.alert(
          'Puntos insuficientes',
          `Necesitas ${
            reward.PUNTOS_PRODUCTOSAPP - userPoints
          } puntos más para canjear esta recompensa.`
        );
        return;
      }

      Alert.alert(
        'Confirmar Canje',
        `¿Estás seguro de canjear "${reward.NOMBRE_PRODUCTOSAPP}" por ${reward.PUNTOS_PRODUCTOSAPP} puntos?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: async () => {
              try {
                const response = await axios.post(
                  `${API_BASE}/productosappCliente`, // <-- Aquí se arregla
                  {
                    ID_PRODUCTOSAPP: reward.ID_PRODUCTOSAPP,
                    ID_CUENTAS: user.ID_CUENTAS,
                  }
                );

                if (response.data?.success) {
                  Alert.alert('¡Canje Exitoso!', response.data.message);
                  setUserPoints((prev) => prev - reward.PUNTOS_PRODUCTOSAPP);
                  setModalVisible(false);
                } else {
                  Alert.alert(
                    'Error',
                    response.data.message || 'No se pudo canjear.'
                  );
                }
              } catch (error) {
                console.error('Error al canjear producto:', error);
                Alert.alert('Error', 'Ocurrió un error durante el canje.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error al canjear producto:', error);

      const errorMessage =
        error.response?.data?.message || 'Ocurrió un error durante el canje.';

      const backendError = error.response?.data?.error || ''; // Esto es lo que envía Laravel en el catch

      Alert.alert('Error', `${errorMessage}\n${backendError}`);
    }
  };

  const handlePressReward = (reward) => {
    setRewardSeleccionado(reward);
    setModalVisible(true);
  };

  const renderGroupedRewards = () => {
    const rows = [];
    for (let i = 0; i < rewards.length; i += 2) {
      const group = rewards.slice(i, i + 2);
      rows.push(
        <View key={i} style={styles.rewardRow}>
          {group.map((item) => (
            <View key={item.ID_PRODUCTOSAPP} style={styles.rewardColumn}>
              {renderRewardItem(item)}
            </View>
          ))}
          {group.length === 1 && <View style={styles.rewardColumn} />}
        </View>
      );
    }
    return rows;
  };

  const renderRewardItem = (item) => {
    const imageUrl = `https://backend.ccelrecreo.com/storage/app/public/${item.IMAGEN_PRODUCTOSAPP}`;
    return (
      <TouchableOpacity
        onPress={() => handlePressReward(item)}
        style={styles.imageContainer}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.eventImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ArrowLeft
          size={24}
          color="#fff"
          onPress={() => router.back()}
          style={styles.MenuButton}
        />
        <BoldText style={styles.title}>Canjear Puntos</BoldText>
      </View>

      <View style={styles.content}>
        <Card style={styles.pointsCard}>
          <View style={styles.pointsRow}>
            <View>
              <RegularText style={styles.pointsLabel}>
                Tus puntos disponibles
              </RegularText>
              <View style={styles.pointsDisplay}>
                <Star size={24} color={Colors.light.secondary} />
                <BoldText style={styles.availablePoints}>{userPoints}</BoldText>
              </View>
            </View>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={fetchCanjesPendientes}
            >
              <RegularText style={styles.historyButtonText}>
                Historial
              </RegularText>
            </TouchableOpacity>
          </View>
        </Card>

        <SemiBoldText style={styles.sectionTitle}>
          Recompensas Disponibles
        </SemiBoldText>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.light.primary} />
        ) : (
          <View style={styles.rewardsContainer}>{renderGroupedRewards()}</View>
        )}
      </View>

      {/* Modal estilo Card elegante */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <Card style={styles.rewardCard}>
            {rewardSeleccionado && (
              <>
                <Image
                  source={{
                    uri: `https://backend.ccelrecreo.com/storage/app/public/${rewardSeleccionado.IMAGEN_PRODUCTOSAPP}`,
                  }}
                  style={styles.rewardImage}
                />

                <View style={styles.rewardContent}>
                  <SemiBoldText style={styles.rewardTitle}>
                    {rewardSeleccionado.NOMBRE_PRODUCTOSAPP}
                  </SemiBoldText>

                  <RegularText style={styles.rewardDescription}>
                    {rewardSeleccionado.DESCRIPCION_PRODUCTOSAPP}
                  </RegularText>

                  <View style={styles.rewardFooter}>
                    <View style={styles.pointsContainer}>
                      <Star size={16} color={Colors.light.secondary} />
                      <BoldText style={styles.pointsText}>
                        {rewardSeleccionado.PUNTOS_PRODUCTOSAPP} puntos
                      </BoldText>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.redeemButton,
                        userPoints < rewardSeleccionado.PUNTOS_PRODUCTOSAPP &&
                          styles.disabledButton,
                      ]}
                      onPress={() => redeemReward(rewardSeleccionado)}
                      disabled={
                        userPoints < rewardSeleccionado.PUNTOS_PRODUCTOSAPP
                      }
                    >
                      <RegularText style={styles.redeemButtonText}>
                        {userPoints >= rewardSeleccionado.PUNTOS_PRODUCTOSAPP
                          ? 'Canjear'
                          : 'Puntos insuficientes'}
                      </RegularText>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </Card>
        </View>
      </Modal>
      {/**modal del historial */}
      <Modal visible={historialVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <Card style={{ padding: 20, maxHeight: '80%' }}>
            <BoldText style={{ fontSize: 18, marginBottom: 10 }}>
              Productos por Entregar
            </BoldText>
            <ScrollView>
              {canjesPendientes.length === 0 ? (
                <RegularText>
                  No tienes productos pendientes de entrega.
                </RegularText>
              ) : (
                canjesPendientes.map((item) => (
                  <View
                    key={item.ID_PRODUCTOSAPP_CANJEADOS}
                    style={{ marginBottom: 12 }}
                  >
                    <Image
                      source={{
                        uri: `https://backend.ccelrecreo.com/storage/app/public/${item.IMAGEN_PRODUCTOSAPP}`,
                      }}
                      style={{ width: 80, height: 80, borderRadius: 8 }}
                    />
                    <RegularText>{item.NOMBRE_PRODUCTOSAPP}</RegularText>
                    <RegularText>Fecha Canje: {item.FECHA_CANJE}</RegularText>
                  </View>
                ))
              )}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setHistorialVisible(false)}
              style={{
                marginTop: 20,
                backgroundColor: Colors.light.primary,
                padding: 10,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff' }}>Cerrar</Text>
            </TouchableOpacity>
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    top: 5,
    color: Colors.light.white,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.light.lightGray,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  pointsCard: {
    marginBottom: 16,
    padding: 16,
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginBottom: 4,
  },
  pointsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availablePoints: {
    fontSize: 26,
    color: Colors.light.secondary,
    marginLeft: 8,
  },
  historyButton: {
    backgroundColor: Colors.light.primary + '20',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  historyButtonText: {
    color: Colors.light.primary,
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: Colors.light.text,
  },
  rewardsContainer: {
    paddingBottom: 16,
  },
  rewardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rewardColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.light.white,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },

  modalBackground: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    padding: 20,
  },
  rewardCard: {
    backgroundColor: Colors.light.white,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  rewardImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 12,
  },
  rewardContent: {
    paddingBottom: 8,
  },
  rewardTitle: {
    fontSize: 20,
    color: Colors.light.primary,
    marginBottom: 6,
  },
  rewardDescription: {
    fontSize: 14,
    color: Colors.light.darkGray,
    marginBottom: 12,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 16,
    color: Colors.light.secondary,
    marginLeft: 4,
  },
  redeemButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: Colors.light.darkGray,
  },
  redeemButtonText: {
    color: Colors.light.white,
    fontSize: 14,
  },
  closeButton: {
    marginTop: 12,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: Colors.light.primary,
    fontSize: 16,
  },
  MenuButton: {
    position: 'absolute',
    left: 10,
    top: 59,
  },
});
