import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { RegularText, SemiBoldText } from '@/components/StyledText';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SocialButton from '@/components/ui/SocialButton';
import { Mail, Lock, Fingerprint, IdCard } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import {
  login,
  authenticateWithBiometrics,
  isBiometricsAvailable,
  saveCredentials,
  getSavedCredentials,
} from '@/utils/auth';
import { useFonts } from 'expo-font';
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [fontsLoaded] = useFonts({
    Ultra: require('./../../assets/fonts/MergeBlackW00-Regular.ttf'),
  });
  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const available = await isBiometricsAvailable();
    setBiometricsAvailable(available);
  };

  const handleBiometricLogin = async () => {
    try {
      const savedCredentials = await getSavedCredentials();

      console.log('Credenciales guardadas:', savedCredentials);

      // ✅ Verificar si hay datos guardados válidos
      if (
        !savedCredentials ||
        !savedCredentials.IDENTIFICACION_CUENTAS ||
        !savedCredentials.PASSWORD_CUENTAS
      ) {
        console.log('⚠️ No hay credenciales válidas en el almacenamiento.');
        Alert.alert(
          'Sin datos',
          'No hay un usuario registrado para autenticación biométrica.'
        );
        return;
      }

      // ✅ Autenticación biométrica
      const biometricSuccess = await authenticateWithBiometrics();

      console.log('Resultado de autenticación biométrica:', biometricSuccess);

      if (!biometricSuccess) {
        Alert.alert('Error', 'La autenticación biométrica falló.');
        return;
      }

      // ✅ Intentar login con credenciales guardadas
      try {
        console.log('Intentando login con:', savedCredentials);

        const { token, userData } = await login({
          IDENTIFICACION_CUENTAS: savedCredentials.IDENTIFICACION_CUENTAS,
          PASSWORD_CUENTAS: savedCredentials.PASSWORD_CUENTAS,
        });

        console.log('✅ Login exitoso:', userData);

        router.push('/(tabs)');
      } catch (err) {
        console.log('❌ Login fallido con credenciales guardadas:', err);

        Alert.alert(
          'Error',
          'Las credenciales guardadas no son válidas. Por favor inicia sesión manualmente.'
        );
      }
    } catch (error) {
      console.error('❌ Error en login biométrico:', error);
      Alert.alert('Error', 'No se pudo autenticar con biometría.');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa tu identificación y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const credentials = {
        IDENTIFICACION_CUENTAS: email,
        PASSWORD_CUENTAS: password,
      };

      const { token, userData } = await login(credentials);

      // Mostrar alerta para preguntar si desea activar biometría
      if (biometricsAvailable) {
        Alert.alert(
          'Autenticación biométrica',
          '¿Deseas guardar tus datos para iniciar sesión usando huella digital o reconocimiento facial?',
          [
            {
              text: 'No',
              onPress: () => {
                router.push('/(tabs)');
              },
              style: 'cancel',
            },
            {
              text: 'Sí',
              onPress: async () => {
                await saveCredentials(credentials, token, userData);
                console.log('Token recibido:', token, 'Tipo:', typeof token);
                router.push('/(tabs)');
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        // Si no hay biometría disponible, solo redirige
        router.push('/(tabs)');
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Error al iniciar sesión'
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
      <StatusBar style="light" />
      <View style={styles.backgroundTop} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={{
              uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAK0AAABkCAYAAAGDT4CpAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyVpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDAyIDc5LjE2NDQ2MCwgMjAyMC8wNS8xMi0xNjowNDoxNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjIgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDYyQjk1RjkyMzExMTFFRUI2MzFBMEQwQTdCNDUxREYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDYyQjk1RkEyMzExMTFFRUI2MzFBMEQwQTdCNDUxREYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDowNjJCOTVGNzIzMTExMUVFQjYzMUEwRDBBN0I0NTFERiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDowNjJCOTVGODIzMTExMUVFQjYzMUEwRDBBN0I0NTFERiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Plcu3XMAABKFSURBVHjatFPB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',
            }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.recreoContainer}>
          <Text
            style={{
              fontFamily: 'Ultra',
              fontSize: 40,
              color: 'white',
              lineHeight: 42,
              textAlign: 'center',
              marginRight: 10,
            }}
          >
            RECREO{'\n'}LOVERS
          </Text>
          <Image
            source={require('../../assets/images/iconsCorazon.png')}
            style={styles.recreoLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.formContainer}>
          <Input
            label="Identificación"
            placeholder="Ingresa tu identificación"
            value={email}
            onChangeText={(text) => {
              const numericText = text.replace(/[^0-9]/g, '');
              setEmail(numericText);
            }}
            keyboardType="numeric"
            leftIcon={<IdCard size={20} color={Colors.light.darkGray} />}
          />

          <Input
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={Colors.light.darkGray} />}
          />

          <Button
            title="Iniciar sesión"
            onPress={handleLogin}
            size="large"
            loading={loading}
            style={styles.loginButton}
          />

          {biometricsAvailable && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
            >
              <Fingerprint size={24} color={Colors.light.primary} />
              <RegularText style={styles.biometricText}>
                Usar huella digital
              </RegularText>
            </TouchableOpacity>
          )}

          <View style={styles.registerContainer}>
            <RegularText style={styles.registerText}>
              ¿Aún no tienes cuenta?
            </RegularText>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <SemiBoldText style={styles.registerLink}>
                  Regístrate
                </SemiBoldText>
              </TouchableOpacity>
            </Link>
          </View>

          <Link href="/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotContainer}>
              <SemiBoldText style={styles.forgotText}>
                ¿Has olvidado la contraseña?
              </SemiBoldText>
            </TouchableOpacity>
          </Link>
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
    height: '55%',
    backgroundColor: Colors.light.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  logo: {
    width: 60,
    height: 60,
    marginTop: -24,
  },
  formContainer: {
    backgroundColor: Colors.light.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    flex: 1,
  },
  loginButton: {
    marginTop: 24,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
  },
  biometricText: {
    marginLeft: 8,
    color: Colors.light.primary,
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  registerText: {
    fontSize: 16,
    color: Colors.light.darkGray,
  },
  registerLink: {
    fontSize: 16,
    color: Colors.light.primary,
    marginLeft: 8,
  },
  forgotContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 16,
    color: Colors.light.primary,
  },
  recreoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  recreoLogo: {
    marginBottom: 20,
    top: 3,
    width: 70,
    height: 70,
  },
});
