import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { CartProvider } from './src/context/CartContext';
import { OrdersProvider } from './src/context/OrdersContext';
import useOrders from './src/hooks/useOrders';
import useTheme from './src/hooks/useTheme';

function AppContent() {
  // This hook waits for saved app data before navigation can show empty screens.
  const { state } = useOrders();
  // This hook colors the startup loading screen with the selected global theme.
  const { colors } = useTheme();

  if (!state.isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 12 }}>Loading restaurant data...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

/**
 * Root App Component
 * Shares auth, theme, cart, and persisted order data outside navigation.
 */
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <OrdersProvider>
            <SafeAreaProvider>
              <AppContent />
            </SafeAreaProvider>
          </OrdersProvider>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
