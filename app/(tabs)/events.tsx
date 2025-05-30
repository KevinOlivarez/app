import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  Text,
} from 'react-native';
import axios from 'axios';
import Colors from '@/constants/Colors';
import { BoldText } from '@/components/StyledText';
import { ArrowLeft, CalendarFold, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const API_BASE = 'https://backend.ccelrecreo.com/server.php/api';

export default function EventsScreen() {
  const router = useRouter();
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const cargarEventos = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/listEventos`);
      setEventos(data);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  const cambiarMes = (offset: number) => {
    const newDate = new Date(currentYear, currentMonth + offset);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  const eventosFiltrados = eventos.filter((evento) => {
    const fechaEvento = new Date(evento.FECHA_EVENTO);
    return (
      fechaEvento.getMonth() === currentMonth &&
      fechaEvento.getFullYear() === currentYear
    );
  });

  const openImageModal = (imageUrl: string) => {
    setModalImage(imageUrl);
    setModalVisible(true);
  };

  const renderEvent = ({ item }: { item: any }) => {
    const imageUrl = `https://backend.ccelrecreo.com/storage/app/public/${item.FOLLETO_EVENTO}`;
    return (
      <TouchableOpacity
        onPress={() => openImageModal(imageUrl)}
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
        <ArrowLeft size={24} color="#fff" onPress={() => router.back()} />
        <CalendarFold
          size={24}
          color={Colors.light.white}
          style={styles.icon}
        />
        <BoldText style={styles.title}>Calendario de Eventos</BoldText>
      </View>

      {/* 🔄 Selector de mes */}
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => cambiarMes(-1)}>
          <Text style={styles.monthButton}>← Mes anterior</Text>
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {new Date(currentYear, currentMonth)
            .toLocaleDateString('es-EC', {
              month: 'long',
              year: 'numeric',
            })
            .toUpperCase()}
        </Text>
        <TouchableOpacity onPress={() => cambiarMes(1)}>
          <Text style={styles.monthButton}>Mes siguiente →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.light.primary}
            style={{ marginTop: 32 }}
          />
        ) : (
          <FlatList
            data={eventosFiltrados}
            renderItem={renderEvent}
            numColumns={2}
            keyExtractor={(item) =>
              item.ID_EVENTO?.toString() || Math.random().toString()
            }
            contentContainerStyle={styles.eventsContainer}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay eventos este mes</Text>
            }
          />
        )}
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackground}
          onPress={() => setModalVisible(false)}
        >
          <Image
            source={{ uri: modalImage! }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    color: Colors.light.white,
    marginLeft: 8,
  },

  icon: {
    marginLeft: 10,
  },
  monthSelector: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  monthText: {
    color: Colors.light.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  monthButton: {
    color: Colors.light.white,
    fontSize: 14,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.light.lightGray,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  eventsContainer: {
    paddingBottom: 32,
  },
  imageContainer: {
    width: (width - 64) / 2,
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.light.white,
  },

  eventImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#888',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width * 0.9,
    height: width * 1.2,
  },
});
