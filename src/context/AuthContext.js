import React, { createContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // This state keeps the signed-in user available across screens and app launches.
  const [user, setUser] = useState(null);
  // This state holds the JWT that the API helper sends with protected requests.
  const [token, setToken] = useState(null);
  // This state keeps the login screen hidden until a saved login has been restored.
  const [isLoading, setIsLoading] = useState(true);

  // This effect restores only the user's public profile and API token from the phone.
  useEffect(() => {
    let isActive = true;
    const restoreLogin = async () => {
      try {
        const [[, savedToken], [, savedUser]] = await AsyncStorage.multiGet([
          'restaurant-app-token',
          'restaurant-app-user',
        ]);
        if (isActive && savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        await AsyncStorage.multiRemove(['restaurant-app-token', 'restaurant-app-user']);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    restoreLogin();
    return () => { isActive = false; };
  }, []);

  // This function stores the server token and public profile after login or signup.
  const login = async (nextToken, nextUser) => {
    await AsyncStorage.multiSet([
      ['restaurant-app-token', nextToken],
      ['restaurant-app-user', JSON.stringify(nextUser)],
    ]);
    setToken(nextToken);
    setUser(nextUser);
  };

  // This function clears the phone's login values and the shared auth state.
  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove(['restaurant-app-token', 'restaurant-app-user']);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
