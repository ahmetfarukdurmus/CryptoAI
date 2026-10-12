import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Backend Base URL resolver:
 * - iOS Simulator: http://127.0.0.1:8080/api (macOS host loopback)
 * - Android Emulator: http://10.0.2.2:8080/api
 * - Web: http://localhost:8080/api
 * - Expo Go / Physical Device / Custom: EXPO_PUBLIC_API_URL or LAN IP
 */
export const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'ios') {
    return 'http://127.0.0.1:8080/api';
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api';
  }
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api';
  }
  return 'http://192.168.1.101:8080/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const TOKEN_STORAGE_KEY = '@cryptoai_access_token';
export const USER_STORAGE_KEY = '@cryptoai_user_data';

export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('AsyncStorage token okuma hatası:', error);
    return null;
  }
};

export const setStoredToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (error) {
    console.error('AsyncStorage token kaydetme hatası:', error);
  }
};

export const removeStoredToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('AsyncStorage token silme hatası:', error);
  }
};

export const getStoredUser = async (): Promise<any | null> => {
  try {
    const raw = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('AsyncStorage kullanıcı okuma hatası:', error);
    return null;
  }
};

export const setStoredUser = async (user: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('AsyncStorage kullanıcı kaydetme hatası:', error);
  }
};

export const clearAuthStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
  } catch (error) {
    console.error('AsyncStorage auth temizleme hatası:', error);
  }
};

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, '');
  let normalizedEndpoint = endpoint.replace(/^\//, '');
  if (baseUrl.endsWith('/api') && normalizedEndpoint.startsWith('api/')) {
    normalizedEndpoint = normalizedEndpoint.substring(4);
  }
  const fullUrl = endpoint.startsWith('http')
    ? endpoint
    : `${baseUrl}/${normalizedEndpoint}`;

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  // Bearer Token otomatik enjeksiyonu
  if (!headers['Authorization']) {
    const token = await getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  let responseData: any = null;

  if (contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    try {
      responseData = await response.text();
    } catch {
      responseData = null;
    }
  }

  if (!response.ok) {
    let errorMessage = `İşlem başarısız oldu (${response.status})`;
    if (responseData && typeof responseData === 'object') {
      errorMessage =
        responseData.message ||
        responseData.error ||
        responseData.msg ||
        responseData.detail ||
        errorMessage;
    } else if (typeof responseData === 'string' && responseData.trim()) {
      errorMessage = responseData;
    }

    throw new ApiError(errorMessage, response.status, responseData);
  }

  return responseData as T;
}

export const apiClient = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
