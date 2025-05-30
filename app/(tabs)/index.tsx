import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import Colors from '@/constants/Colors';
import { RegularText, SemiBoldText } from '@/components/StyledText';
import PointsCard from '@/components/features/PointsCard';
import EventsCarousel from '@/components/features/EventsCarousel';
import FeatureButton from '@/components/features/FeatureButton';
import {
  Receipt,
  CircleCheck as CheckCircle,
  Calendar,
  Gift as GiftIcon,
  Menu,
  Bell,
  LogOut,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { getUserData } from '@/utils/auth';
import { clearAuthSession } from '@/utils/storage';
interface UserData {
  ID_CUENTAS: number;
  IDENTIFICACION_CUENTAS: string;
  NOMBRE_CUENTAS: string;
  APELLIDO_CUENTAS: string;
}
export default function HomeScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

  const navigateToFeature = (route: string) => {
    router.push(route);
  };
  useEffect(() => {
    const loadUser = async () => {
      const data = await getUserData();
      setUserData(data);
    };

    loadUser();
  }, []);

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        onPress: async () => {
          try {
            await clearAuthSession();
          } catch (error) {
            console.error('❌ Error al cerrar sesión:', error);
          } finally {
            router.replace('/login');
          }
        },
      },
    ]);
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Icono izquierdo (Campana) */}
        <TouchableOpacity style={styles.iconButton}>
          <Bell size={24} color="#fff" />
        </TouchableOpacity>

        {/* Logo centrado */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>RECREO{'\n'}LOVERS</Text>
          <Image
            source={require('../../assets/images/iconsCorazon.png')}
            style={styles.recreoLogo}
            resizeMode="contain"
          />
        </View>

        {/* Icono derecho (Menú) */}
        <TouchableOpacity style={styles.iconButton}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={24} color={Colors.light.white} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PointsCard />

        <View style={styles.featuresContainer}>
          <View style={styles.featuresRow}>
            <FeatureButton
              title="Ingresa tus facturas"
              icon={<Receipt size={32} color="#fff" />}
              color={Colors.light.tertiary}
              onPress={() => navigateToFeature('/invoices')}
              style={styles.featureButton}
            />
            <FeatureButton
              title="Factura canjeadas"
              icon={<CheckCircle size={32} color="#fff" />}
              color={Colors.light.accent}
              onPress={() => navigateToFeature('/invoices/redeemed')}
              style={styles.featureButton}
            />
          </View>

          <View style={styles.featuresRow}>
            <FeatureButton
              title="Calendario de eventos"
              icon={<Calendar size={32} color="#fff" />}
              color={Colors.light.primary}
              onPress={() => navigateToFeature('/events')}
              style={styles.featureButton}
            />
            <FeatureButton
              title="Canjea tus puntos"
              icon={<GiftIcon size={32} color="#fff" />}
              color={Colors.light.secondary}
              onPress={() => navigateToFeature('/redeem')}
              style={styles.featureButton}
            />
          </View>
        </View>
        <EventsCarousel />
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: Colors.light.primary,
  },
  iconButton: {
    top: 16,
    padding: 8,
  },
  logoContainer: {
    top: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'Ultra',
    fontSize: 30,
    color: 'white',
    lineHeight: 32,
    textAlign: 'center',
    marginRight: 5,
  },
  recreoLogo: {
    width: 60,
    height: 55,
    marginBottom: 20,
    top: 3,
  },
  avatarContainer: {
    height: 40,
    width: 100,
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 40,
  },
  headerButtons: {
    flexDirection: 'row',
  },

  scrollView: {
    flex: 1,
    backgroundColor: Colors.light.lightGray,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  featuresContainer: {
    padding: 16,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  featureButton: {
    width: '48%',
  },
  logoutButton: {
    position: 'absolute',
    right: 16,
    top: -5,
  },
});
