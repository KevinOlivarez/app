import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
  Text,
} from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { RegularText, SemiBoldText } from '@/components/StyledText';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  User,
  Mail,
  Phone,
  ArrowLeft,
  Calendar,
} from 'lucide-react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    identificacion: '',
    tipoIdentificacion: '',
    sexo: '',
    fechaNacimiento: new Date(),
    telefono: '',
    email: '',
    direccion: '',
    termsAccepted: false,
  });

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleRegister = async () => {
    const edad = calcularEdad(formData.fechaNacimiento);

    if (
      !formData.nombres ||
      !formData.apellidos ||
      !formData.identificacion ||
      !formData.email ||
      !formData.telefono
    ) {
      Alert.alert('Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    if (edad < 15) {
      Alert.alert('Error', 'Debes tener al menos 15 años para registrarte');
      return;
    }

    if (!formData.termsAccepted) {
      Alert.alert('Error', 'Debe aceptar los términos y condiciones');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'https://backend.ccelrecreo.com/server.php/api/scrCuentas',
        {
          NOMBRE_CUENTAS: formData.nombres,
          APELLIDO_CUENTAS: formData.apellidos,
          IDENTIFICACION_CUENTAS: formData.identificacion,
          TIPOIDENTIFICACION_CUENTAS: formData.tipoIdentificacion,
          SEXO_CUENTAS: formData.sexo,
          FECHANACIMIENTO_CUENTAS: formData.fechaNacimiento.toISOString(),
          CELULAR_CUENTAS: formData.telefono,
          EMAIL_CUENTAS: formData.email,
          PASSWORD_CUENTAS: '', // Eliminamos la contraseña, pero enviamos un valor vacío por compatibilidad
          DIRECCION_CUENTAS: formData.direccion,
          ESTADO_CUENTAS: 'A',
        }
      );

      Alert.alert('Registro Exitoso', 'Tu cuenta ha sido creada exitosamente', [
        { text: 'OK', onPress: () => router.push('/login') },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Error al crear la cuenta'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.backgroundTop} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.logoText}>
            RECREO{'\n'}LOVERS
          </Text>
          <Image
            source={require('../../assets/images/iconsCorazon.png')}
            style={styles.recreoLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
          <SemiBoldText style={styles.title}>Crear Cuenta</SemiBoldText>
          <RegularText style={styles.subtitle}>
            Completa tus datos para registrarte
          </RegularText>

          <Input
            label="Nombres"
            placeholder="Ingresa tus nombres"
            value={formData.nombres}
            onChangeText={(text) => setFormData({ ...formData, nombres: text })}
            leftIcon={<User size={20} color={Colors.light.darkGray} />}
          />

          <Input
            label="Apellidos"
            placeholder="Ingresa tus apellidos"
            value={formData.apellidos}
            onChangeText={(text) => setFormData({ ...formData, apellidos: text })}
            leftIcon={<User size={20} color={Colors.light.darkGray} />}
          />

          <Input
            label="Identificación"
            placeholder="Ingresa tu número de identificación"
            value={formData.identificacion}
            onChangeText={(text) =>
              setFormData({ ...formData, identificacion: text })
            }
            keyboardType="numeric"
            leftIcon={<User size={20} color={Colors.light.darkGray} />}
          />

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color={Colors.light.darkGray} />
            <RegularText style={styles.dateButtonText}>
              {formData.fechaNacimiento.toLocaleDateString()}
            </RegularText>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={formData.fechaNacimiento}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setFormData({ ...formData, fechaNacimiento: selectedDate });
                }
              }}
              maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 15))}
            />
          )}

          <Input
            label="Correo Electrónico"
            placeholder="Ingresa tu correo"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={<Mail size={20} color={Colors.light.darkGray} />}
          />

          <Input
            label="Teléfono"
            placeholder="Ingresa tu número de teléfono"
            value={formData.telefono}
            onChangeText={(text) => setFormData({ ...formData, telefono: text })}
            keyboardType="phone-pad"
            leftIcon={<Phone size={20} color={Colors.light.darkGray} />}
          />

          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() =>
              setFormData({
                ...formData,
                termsAccepted: !formData.termsAccepted,
              })
            }
          >
            <View
              style={[
                styles.checkbox,
                formData.termsAccepted && styles.checkboxChecked,
              ]}
            />
            <RegularText style={styles.termsText}>
              Acepto los términos y condiciones
            </RegularText>
          </TouchableOpacity>

          <Button
            title="Registrarme"
            onPress={handleRegister}
            size="large"
            loading={loading}
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <RegularText style={styles.loginText}>
              ¿Ya tienes una cuenta?
            </RegularText>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <SemiBoldText style={styles.loginLink}>
                  Iniciar sesión
                </SemiBoldText>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.lightGray,
  },
  backgroundTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: Colors.light.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  recreoLogo: {
    width: 40,
    height: 40,
    marginLeft: 10,
  },
  logoText: {
    fontFamily: 'Ultra',
    fontSize: 30,
    color: 'white',
    lineHeight: 30,
    textAlign: 'center',
    marginRight: 10,
  },
  formContainer: {
    backgroundColor: Colors.light.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    flex: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
    color: Colors.light.primary,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: Colors.light.darkGray,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.light.lightGray,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    marginLeft: 8,
    color: Colors.light.darkGray,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: Colors.light.primary,
  },
  termsText: {
    color: Colors.light.darkGray,
  },
  registerButton: {
    marginTop: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  loginText: {
    color: Colors.light.darkGray,
  },
  loginLink: {
    marginLeft: 4,
    color: Colors.light.primary,
  },
});
