import React, { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import useApi from '../hooks/useApi';
import { apiRequest } from '../api/client';

const DASHBOARD_TABS = ['Incoming Orders', 'Reservations', 'Menu Management'];
const CATEGORIES = ['Starters', 'Mains', 'Desserts', 'Drinks'];

export default function DashboardScreen() {
  // This hook reads the manager profile for the dashboard welcome message.
  const { user } = useAuth();
  // This hook supplies the active palette for all dashboard sections.
  const { colors } = useTheme();
  // This state selects which manager section is visible.
  const [activeTab, setActiveTab] = useState('Incoming Orders');
  // This state holds the name entered for a new menu item.
  const [newItemName, setNewItemName] = useState('');
  // This state holds the price entered for a new menu item.
  const [newItemPrice, setNewItemPrice] = useState('');
  // This state selects the category of a new menu item.
  const [newItemCategory, setNewItemCategory] = useState('Mains');
  // This memo rebuilds dashboard styles only when the theme changes.
  const styles = useMemo(() => makeStyles(colors), [colors]);
  // This callback loads the current server orders.
  const fetchOrders = useCallback(() => apiRequest('/api/orders'), []);
  // This hook loads manager orders and provides a retry function.
  const ordersApi = useApi(fetchOrders, { initialData: [] });
  // This callback loads the current server reservations.
  const fetchReservations = useCallback(() => apiRequest('/api/reservations'), []);
  // This hook loads manager reservations and provides a retry function.
  const reservationsApi = useApi(fetchReservations, { initialData: [] });
  // This callback loads the shared server menu.
  const fetchMenu = useCallback(() => apiRequest('/api/menu'), []);
  // This hook loads menu items and provides a retry function.
  const menuApi = useApi(fetchMenu, { initialData: [] });
  const orders = ordersApi.data || [];
  const reservations = reservationsApi.data || [];
  const menuItems = (menuApi.data || []).map((item) => ({ ...item, id: item._id }));

  // This function creates a menu item after quick field validation.
  const addMenuItem = async () => {
    const price = Number(newItemPrice);
    if (!newItemName.trim() || !Number.isFinite(price) || price <= 0) {
      Alert.alert('Check the menu item', 'Enter a name and a price greater than zero.');
      return;
    }
    try {
      await apiRequest('/api/menu', { method: 'POST', body: {
        name: newItemName.trim(), description: 'New item added by the restaurant manager.',
        price, category: newItemCategory, image: '', isSpecial: false, isAvailable: true,
      } });
      setNewItemName('');
      setNewItemPrice('');
      await menuApi.refetch();
    } catch (error) { Alert.alert('Could not add menu item', error.message); }
  };

  // This function sends an allowed order status change and reloads manager orders.
  const updateOrderStatus = async (orderId, status) => {
    try {
      await apiRequest(`/api/orders/${orderId}/status`, { method: 'PATCH', body: { status } });
      await ordersApi.refetch();
    } catch (error) { Alert.alert('Could not update order', error.message); }
  };

  // This function sends a reservation decision and reloads manager bookings.
  const updateReservationStatus = async (reservationId, status) => {
    try {
      await apiRequest(`/api/reservations/${reservationId}`, { method: 'PATCH', body: { status } });
      await reservationsApi.refetch();
    } catch (error) { Alert.alert('Could not update reservation', error.message); }
  };

  // This function saves a new price or availability value and reloads the menu.
  const updateMenuItem = async (item, updates) => {
    try {
      await apiRequest(`/api/menu/${item._id}`, { method: 'PUT', body: updates });
      await menuApi.refetch();
    } catch (error) { Alert.alert('Could not update menu item', error.message); }
  };

  const allowedOrderStatuses = (status) => status === 'Pending'
    ? ['Preparing', 'Cancelled']
    : status === 'Preparing' ? ['Ready'] : status === 'Ready' ? ['Served'] : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Manager Dashboard</Text>
      <Text style={styles.subtitle}>Welcome, {user?.fullName || user?.name || 'Manager'}!</Text>
      <View style={styles.tabRow}>
        {DASHBOARD_TABS.map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tabButton, activeTab === tab && styles.tabButtonSelected]} onPress={() => setActiveTab(tab)} activeOpacity={0.8}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextSelected]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'Incoming Orders' && (
        <View>
          {ordersApi.error && <Text style={styles.errorText}>{ordersApi.error}</Text>}
          {ordersApi.error && <TouchableOpacity onPress={() => ordersApi.refetch().catch(() => {})}><Text style={styles.retryText}>Retry orders</Text></TouchableOpacity>}
          {ordersApi.loading && orders.length === 0 ? <Text style={styles.emptyText}>Loading orders...</Text> : orders.length === 0 ? <Text style={styles.emptyText}>No incoming orders yet.</Text> : orders.map((order) => (
            <View key={order._id} style={styles.card}>
              <Text style={styles.cardTitle}>Order {order._id.slice(-6)}</Text>
              <Text style={styles.body}>{order.user?.name || 'Customer'} - {order.type} - ${Number(order.total).toFixed(2)}</Text>
              <Text style={styles.status}>Current status: {order.status}</Text>
              <View style={styles.actionRow}>
                {allowedOrderStatuses(order.status).map((status) => (
                  <TouchableOpacity key={status} style={status === 'Cancelled' ? styles.actionButtonDanger : styles.actionButton} onPress={() => updateOrderStatus(order._id, status)} activeOpacity={0.8}>
                    <Text style={styles.actionText}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {activeTab === 'Reservations' && (
        <View>
          {reservationsApi.error && <Text style={styles.errorText}>{reservationsApi.error}</Text>}
          {reservationsApi.error && <TouchableOpacity onPress={() => reservationsApi.refetch().catch(() => {})}><Text style={styles.retryText}>Retry reservations</Text></TouchableOpacity>}
          {reservationsApi.loading && reservations.length === 0 ? <Text style={styles.emptyText}>Loading reservations...</Text> : reservations.length === 0 ? <Text style={styles.emptyText}>No reservations have been requested.</Text> : reservations.map((booking) => (
            <View key={booking._id} style={styles.card}>
              <Text style={styles.cardTitle}>{booking.user?.name || 'Customer'} - Table {booking.table?.number}</Text>
              <Text style={styles.body}>{new Date(booking.date).toLocaleDateString()} at {booking.timeSlot}, party of {booking.partySize}</Text>
              <Text style={styles.status}>Status: {booking.status}</Text>
              {booking.status === 'Pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => updateReservationStatus(booking._id, 'Accepted')}><Text style={styles.actionText}>Accept</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.actionButtonDanger} onPress={() => updateReservationStatus(booking._id, 'Declined')}><Text style={styles.actionText}>Decline</Text></TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {activeTab === 'Menu Management' && (
        <View>
          {menuApi.error && <Text style={styles.errorText}>{menuApi.error}</Text>}
          {menuApi.error && <TouchableOpacity onPress={() => menuApi.refetch().catch(() => {})}><Text style={styles.retryText}>Retry menu</Text></TouchableOpacity>}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Add a menu item</Text>
            <TextInput style={styles.input} placeholder="Item name" placeholderTextColor={colors.textMuted} value={newItemName} onChangeText={setNewItemName} />
            <TextInput style={styles.input} placeholder="Price" placeholderTextColor={colors.textMuted} keyboardType="decimal-pad" value={newItemPrice} onChangeText={setNewItemPrice} />
            <View style={styles.actionRow}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity key={category} style={[styles.actionButton, newItemCategory === category && styles.selectedAction]} onPress={() => setNewItemCategory(category)}>
                  <Text style={styles.actionText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.addButton} onPress={addMenuItem} activeOpacity={0.8}><Text style={styles.addButtonText}>Add Item</Text></TouchableOpacity>
          </View>
          {menuApi.loading && menuItems.length === 0 ? <Text style={styles.emptyText}>Loading menu...</Text> : menuItems.map((item) => (
            <View key={item.id} style={styles.menuRow}>
              <View style={styles.menuItemInfo}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.body}>{item.isAvailable ? 'Available' : 'Unavailable'}</Text>
              </View>
              <TextInput key={`${item.id}-${item.price}`} style={styles.priceInput} defaultValue={String(item.price)} keyboardType="decimal-pad" accessibilityLabel={`Price for ${item.name}`} onEndEditing={(event) => {
                const price = Number(event.nativeEvent.text);
                if (Number.isFinite(price) && price >= 0) updateMenuItem(item, { price });
                else Alert.alert('Check the price', 'Enter a price of zero or more.');
              }} />
              <TouchableOpacity style={styles.actionButton} onPress={() => updateMenuItem(item, { isAvailable: !item.isAvailable })} activeOpacity={0.8}><Text style={styles.actionText}>Toggle</Text></TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingBottom: 28 },
    title: { color: colors.text, fontSize: 24, fontWeight: '700' },
    subtitle: { color: colors.primary, fontSize: 15, fontWeight: '600', marginTop: 4, marginBottom: 16 },
    tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    tabButton: { backgroundColor: colors.inputBackground, borderColor: colors.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9 },
    tabButtonSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    tabText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
    tabTextSelected: { color: colors.badgeText },
    card: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12 },
    cardTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 5 },
    body: { color: colors.textSecondary, fontSize: 13, marginBottom: 6 },
    status: { color: colors.primary, fontSize: 13, fontWeight: '700', marginVertical: 6 },
    actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
    actionButton: { backgroundColor: colors.primary, borderRadius: 7, paddingHorizontal: 9, paddingVertical: 7 },
    actionButtonDanger: { backgroundColor: colors.error, borderRadius: 7, paddingHorizontal: 9, paddingVertical: 7 },
    actionText: { color: colors.badgeText, fontSize: 11, fontWeight: '700' },
    selectedAction: { backgroundColor: colors.success },
    emptyText: { color: colors.textSecondary, paddingVertical: 16 },
    errorText: { color: colors.error, marginBottom: 6 },
    retryText: { color: colors.primary, fontWeight: '700', marginBottom: 10 },
    input: { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, borderWidth: 1, borderRadius: 8, color: colors.text, paddingHorizontal: 10, paddingVertical: 9, marginVertical: 5 },
    addButton: { backgroundColor: colors.success, alignItems: 'center', padding: 10, borderRadius: 8, marginTop: 10 },
    addButtonText: { color: colors.badgeText, fontWeight: '700' },
    menuRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 8 },
    menuItemInfo: { flex: 1 },
    priceInput: { width: 72, color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, borderWidth: 1, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 6, textAlign: 'center' },
  });
}
