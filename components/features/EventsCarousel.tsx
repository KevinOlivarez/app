import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';
import axios from 'axios';
import EventCard from './EventCard';
import { SemiBoldText } from '../StyledText';
import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');

const API_BASE = 'https://backend.ccelrecreo.com/server.php/api';

interface EventoAPI {
  ID_EVENTO: string;
  NOMBRE_EVENTO: string;
  FECHA_EVENTO: string;
  LUGAR_EVENTO: string;
  FOLLETO_EVENTO: string;
}

interface EventoFormatted {
  id: string;
  title: string;
  date: string;
  location: string;
  image: ImageSourcePropType;
}

export default function EventsCarousel() {
  const [eventos, setEventos] = useState<EventoFormatted[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isFutureDate = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);

    return eventDate > today;
  };

  const cargarEventos = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/listEventos`);

      const eventosFuturos = data.filter((item: EventoAPI) =>
        isFutureDate(item.FECHA_EVENTO)
      );

      const eventosFormateados = eventosFuturos.map((item: EventoAPI) => ({
        id: item.ID_EVENTO,
        title: item.NOMBRE_EVENTO,
        date: formatDate(item.FECHA_EVENTO),
        location: item.LUGAR_EVENTO,
        image: {
          uri: `https://backend.ccelrecreo.com/storage/app/public/${item.FOLLETO_EVENTO}`,
        },
      }));

      setEventos(eventosFormateados);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  const handleEventPress = (id: string) => {
    console.log('Event pressed:', id);
  };

  const renderDot = (index: number) => (
    <View
      key={index}
      style={[styles.dot, activeIndex === index && styles.activeDot]}
    />
  );

  const handleScroll = (event: any) => {
    const slideWidth = width - 32;
    const offset = event.nativeEvent.contentOffset.x;
    const activeIndex = Math.round(offset / slideWidth);
    setActiveIndex(activeIndex);
  };

  return (
    <View style={styles.container}>
      <SemiBoldText style={styles.title}>Próximos eventos</SemiBoldText>

      <FlatList
        ref={flatListRef}
        data={eventos}
        renderItem={({ item }) => (
          <EventCard
            title={item.title}
            date={item.date}
            location={item.location}
            image={item.image}
            onPress={() => handleEventPress(item.id)}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={width - 32}
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.pagination}>
        {eventos.map((_, index) => renderDot(index))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    color: '#333',
  },
  flatListContent: {
    paddingHorizontal: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.darkGray,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.light.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
