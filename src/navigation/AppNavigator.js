import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import DashboardScreen from '../screens/DashboardScreen';
import { lightColors } from '../theme/colors';

const Stack = createNativeStackNavigator();

/**
 * AppNavigator (Question 3 Stack Navigation)
 * Contains the LoginScreen and role-based destination screens (Menu and Dashboard).
 */
export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: lightColors.primary,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
        },
        contentStyle: {
          backgroundColor: lightColors.background,
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          title: 'Menu',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Manager Dashboard',
          headerBackVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}
