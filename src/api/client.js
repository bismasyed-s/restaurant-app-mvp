import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this IP if the laptop address changes; Android emulator uses http://10.0.2.2:5000.
export const BASE_URL = 'http://192.168.1.3:5000';

export async function apiRequest(path, options = {}) {
  const token = options.token || await AsyncStorage.getItem('restaurant-app-token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
  });
  const responseData = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(responseData.message || `Request failed with status ${response.status}`);
  }
  return responseData;
}
