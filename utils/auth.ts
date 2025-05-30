import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { Platform } from 'react-native';

const API_URL = 'https://backend.ccelrecreo.com/server.php/api';

interface User {
  IDENTIFICACION_CUENTAS: string;
  PASSWORD_CUENTAS: string;
}

// 🔒 Almacenamiento Seguro General
export const saveToStorage = async (key: string, value: string) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (error) {
    console.error(`❌ Error saving ${key} to storage:`, error);
  }
};

export const getFromStorage = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error(`❌ Error retrieving ${key} from storage:`, error);
    return null;
  }
};

// 💾 Guardar credenciales y sesión
export const saveCredentials = async (
  user: User,
  token: any,
  userData: any
) => {
  try {
    const tokenString =
      typeof token === 'string' ? token : JSON.stringify(token);
    await saveToStorage('userCredentials', JSON.stringify(user));
    await saveToStorage('userToken', tokenString);
    await saveToStorage('userData', JSON.stringify(userData));
    await saveToStorage('biometricsEnabled', 'true');
  } catch (error) {
    console.error('❌ Error saving credentials:', error);
  }
};

// 📦 Obtener credenciales
export const getSavedCredentials = async (): Promise<User | null> => {
  try {
    const credentials = await getFromStorage('userCredentials');
    return credentials ? JSON.parse(credentials) : null;
  } catch (error) {
    console.error('❌ Error getting credentials:', error);
    return null;
  }
};

export const getUserData = async () => {
  try {
    const data = await getFromStorage('userData');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    return null;
  }
};

// 🧬 Verifica disponibilidad de biometría
export const isBiometricsAvailable = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  try {
    const available = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return available && enrolled;
  } catch (error) {
    console.error('❌ Error checking biometrics availability:', error);
    return false;
  }
};

// 🔐 Autenticación biométrica
export const authenticateWithBiometrics = async () => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autenticación biométrica',
      fallbackLabel: 'Usar contraseña',
      cancelLabel: 'Cancelar',
    });

    if (result.success) {
      const credentials = await getSavedCredentials();

      if (
        credentials &&
        credentials.IDENTIFICACION_CUENTAS &&
        credentials.PASSWORD_CUENTAS
      ) {
        const response = await axios.post(
          `${API_URL}/loginCuenta`,
          credentials
        );
        return response.data;
      } else {
        console.warn(
          '⚠️ Credenciales incompletas, cancelando login biométrico.'
        );
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('❌ Error in biometric authentication:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      config: error.config,
      isAxiosError: error.isAxiosError,
    });

    return null;
  }
};

// 🟢 Login normal
export const login = async (user: User) => {
  try {
    const response = await axios.post(`${API_URL}/loginCuenta`, user);
    const { token, user: userData } = response.data;
    console.log('✅ Token recibido:', token, 'Tipo:', typeof token);
    await saveCredentials(user, token, userData);
    return { token, userData };
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
};
