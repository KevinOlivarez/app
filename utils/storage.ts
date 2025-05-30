import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'userToken';
const USER_KEY = 'userData';
const CREDENTIALS_KEY = 'userCredentials';

export const saveToStorage = async (key: string, value: any) => {
  try {
    const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
    await SecureStore.setItemAsync(key, valueToStore);
  } catch (error) {
    console.error(`❌ Error saving ${key} to storage:`, error);
  }
};

export const getFromStorage = async (key: string): Promise<any | null> => {
  try {
    const value = await SecureStore.getItemAsync(key);
    if (value === null) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    console.error(`❌ Error getting ${key} from storage:`, error);
    return null;
  }
};

export const removeFromStorage = async (key: string) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`❌ Error removing ${key} from storage:`, error);
  }
};

export const saveAuthSession = async (token: string | object, userData: object, credentials: object) => {
  await saveToStorage(TOKEN_KEY, token);
  await saveToStorage(USER_KEY, userData);
  await saveToStorage(CREDENTIALS_KEY, credentials);
};

export const getAuthToken = async (): Promise<string | null> => {
  const token = await getFromStorage(TOKEN_KEY);
  return typeof token === 'string' ? token : null;
};

export const getUserInfo = async (): Promise<object | null> => {
  return await getFromStorage(USER_KEY);
};

export const clearAuthSession = async () => {
  await removeFromStorage(TOKEN_KEY);
  await removeFromStorage(USER_KEY);
  await removeFromStorage(CREDENTIALS_KEY);
};
