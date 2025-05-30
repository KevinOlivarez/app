import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { RegularText, SemiBoldText, BoldText } from '@/components/StyledText';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  LogOut,
  ArrowLeft,
} from 'lucide-react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { clearAuthSession, getUserInfo } from '@/utils/storage';

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userData, setUserData] = useState({
    nombres: '',
    apellidos: '',
    identificacion: '',
    tipoIdentificacion: '',
    sexo: '',
    fechaNacimiento: new Date(),
    telefono: '',
    email: '',
    direccion: '',
    estado: '',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = await getUserInfo();
      console.log('Usuario almacenado:', user);

      if (!user || !user.ID_CUENTAS) {
        Alert.alert('Error', 'ID de usuario no encontrado');
        return;
      }

      const response = await axios.get(
        `https://backend.ccelrecreo.com/server.php/api/cuentascra/${user.ID_CUENTAS}`
      );
      console.log('Respuesta API:', response.data);

      const data = response.data.data || user;

      setUserData({
        nombres: data.NOMBRE_CUENTAS || '',
        apellidos: data.APELLIDO_CUENTAS || '',
        identificacion: data.IDENTIFICACION_CUENTAS || '',
        tipoIdentificacion: data.TIPOIDENTIFICACION_CUENTAS || '',
        sexo: data.SEXO_CUENTAS || '',
        fechaNacimiento: data.FECHANACIMIENTO_CUENTAS
          ? new Date(data.FECHANACIMIENTO_CUENTAS)
          : new Date(),
        telefono: data.CELULAR_CUENTAS || '',
        email: data.EMAIL_CUENTAS || '',
        direccion: data.DIRECCION_CUENTAS || '',
        estado: data.ESTADO_CUENTAS || '',
      });
    } catch (error) {
      console.error('Error al cargar datos usuario:', error);
      Alert.alert('Error', 'No se pudo cargar la información del usuario');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const user = await getUserInfo();
      if (!user || !user.ID_CUENTAS) {
        Alert.alert('Error', 'ID de usuario no encontrado');
        setLoading(false);
        return;
      }

      await axios.post(
        `https://backend.ccelrecreo.com/server.php/api/scrCuentasUpdate/${user.ID_CUENTAS}`,
        {
          _method: 'PUT',
          NOMBRE_CUENTAS: userData.nombres,
          APELLIDO_CUENTAS: userData.apellidos,
          IDENTIFICACION_CUENTAS: userData.identificacion,
          TIPOIDENTIFICACION_CUENTAS: userData.tipoIdentificacion,
          SEXO_CUENTAS: userData.sexo,
          FECHANACIMIENTO_CUENTAS: userData.fechaNacimiento.toISOString(),
          CELULAR_CUENTAS: userData.telefono,
          EMAIL_CUENTAS: userData.email,
          DIRECCION_CUENTAS: userData.direccion,
          ESTADO_CUENTAS: userData.estado,
        }
      );

      Alert.alert('Éxito', 'Información actualizada correctamente');
    } catch (error) {
      console.error('Error al guardar datos:', error);
      Alert.alert('Error', 'No se pudo actualizar la información');
    } finally {
      setLoading(false);
    }
  };

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
    <View style={styles.container}>
      <ArrowLeft
        size={24}
        color="#fff"
        onPress={() => router.back()}
        style={styles.MenuButton}
      />
      <View style={styles.header}>
        <BoldText style={styles.title}>Mi Perfil</BoldText>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={24} color={Colors.light.white} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color={Colors.light.primary} />
            </View>
            <BoldText style={styles.userName}>
              {userData.nombres} {userData.apellidos}
            </BoldText>
            <RegularText style={styles.userEmail}>{userData.email}</RegularText>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Nombres"
              value={userData.nombres}
              onChangeText={(text) =>
                setUserData({ ...userData, nombres: text })
              }
              leftIcon={<User size={20} color={Colors.light.darkGray} />}
            />

            <Input
              label="Apellidos"
              value={userData.apellidos}
              onChangeText={(text) =>
                setUserData({ ...userData, apellidos: text })
              }
              leftIcon={<User size={20} color={Colors.light.darkGray} />}
            />

            <Input
              label="Identificación"
              value={userData.identificacion}
              onChangeText={(text) =>
                setUserData({ ...userData, identificacion: text })
              }
              leftIcon={<User size={20} color={Colors.light.darkGray} />}
              editable={false}
            />

            <View style={{ marginBottom: 16 }}>
              <RegularText
                style={{
                  marginBottom: 6,
                  fontWeight: '600',
                  color: Colors.light.black,
                }}
              >
                Fecha de nacimiento
              </RegularText>

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color={Colors.light.darkGray} />
                <RegularText style={styles.dateButtonText}>
                  {userData.fechaNacimiento.toLocaleDateString()}
                </RegularText>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={userData.fechaNacimiento}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setUserData({
                        ...userData,
                        fechaNacimiento: selectedDate,
                      });
                    }
                  }}
                />
              )}
            </View>

            <Input
              label="Correo Electrónico"
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              leftIcon={<Mail size={20} color={Colors.light.darkGray} />}
              keyboardType="email-address"
            />

            <Input
              label="Teléfono"
              value={userData.telefono}
              onChangeText={(text) =>
                setUserData({ ...userData, telefono: text })
              }
              leftIcon={<Phone size={20} color={Colors.light.darkGray} />}
              keyboardType="phone-pad"
            />

            <Input
              label="Dirección"
              value={userData.direccion}
              onChangeText={(text) =>
                setUserData({ ...userData, direccion: text })
              }
              leftIcon={<MapPin size={20} color={Colors.light.darkGray} />}
            />

            <Button
              title="Guardar Cambios"
              onPress={handleSave}
              loading={loading}
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoutButton: {
    position: 'absolute',
    right: 16,
    top: 48,
  },
  MenuButton: {
    position: 'absolute',
    left: 10,
    top: 50,
  },
  title: {
    fontSize: 20,
    top: 16,
    color: Colors.light.white,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.light.lightGray,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    color: Colors.light.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.light.darkGray,
  },
  formContainer: {
    padding: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.light.white,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    marginLeft: 8,
    color: Colors.light.darkGray,
  },
  saveButton: {
    marginTop: 24,
  },
});
