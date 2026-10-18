import React, { useMemo } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CartScreen from '../screens/CartScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import ReservationScreen from '../screens/ReservationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import useCart from '../hooks/useCart';

const Stack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function OrdersFlow() {
  // This hook supplies the logout action for every order flow screen.
  const { logout } = useAuth();
  // This hook supplies active colors for the nested order headers.
  const { colors } = useTheme();
  // This memo builds nested header styles only when the active palette changes.
  const nestedStyles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <OrdersStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.badgeText,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={nestedStyles.headerButton} activeOpacity={0.8}>
            <Text style={nestedStyles.headerButtonText}>Logout</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <OrdersStack.Screen name="CartHome" component={CartScreen} options={{ title: 'Cart' }} />
      <OrdersStack.Screen name="OrderSummary" component={OrderSummaryScreen} options={{ title: 'Order Summary' }} />
      <OrdersStack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ title: 'Order Tracking' }} />
    </OrdersStack.Navigator>
  );
}

function MainTabs() {
  // This hook provides the current user's role and logout action.
  const { user, logout } = useAuth();
  // This hook reads the shared cart quantity for the live Cart tab badge.
  const { state: cartState } = useCart();
  // This hook supplies active theme colors for the tab bar and headers.
  const { colors } = useTheme();
  // This memo builds navigation styles only when the color palette changes.
  const tabStyles = useMemo(() => makeStyles(colors), [colors]);
  const cartCount = cartState.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.badgeText,
        headerTitleStyle: { fontWeight: '700' },
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={tabStyles.headerButton} activeOpacity={0.8}>
            <Text style={tabStyles.headerButtonText}>Logout</Text>
          </TouchableOpacity>
        ),
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: tabStyles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: tabStyles.tabLabel,
      }}
    >
      <Tab.Screen name="Menu" component={MenuScreen} options={{ title: 'Menu' }} />
      {user?.role === 'manager' && (
        <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      )}
      <Tab.Screen
        name="Cart"
        component={OrdersFlow}
        options={{
          title: 'Cart',
          headerShown: false,
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.badge, color: colors.badgeText },
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>{"\u{1F6D2}"}</Text>,
        }}
      />
      <Tab.Screen name="Reservations" component={ReservationScreen} options={{ title: 'Reservations' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  // This hook selects login or authenticated tabs based on the shared user.
  const { user } = useAuth();
  // This hook supplies active theme colors for the root navigation container.
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.badgeText,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {user === null ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

function makeStyles(colors) {
  return {
    headerButton: {
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 6,
    },
    headerButtonText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
    tabBar: { backgroundColor: colors.surface, borderTopColor: colors.border },
    tabLabel: { fontWeight: '600' },
  };
}
