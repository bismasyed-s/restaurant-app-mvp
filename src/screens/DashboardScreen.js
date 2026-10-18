import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CATEGORIES } from '../data/menu';
import useAuth from '../hooks/useAuth';
import useOrders from '../hooks/useOrders';
import useTheme from '../hooks/useTheme';

const DASHBOARD_TABS = ['Incoming Orders', 'Reservations', 'Menu Management'];
const ORDER_STATUSES = ['Preparing', 'Ready', 'Served', 'Cancelled'];

export default function DashboardScreen() {
  // This hook reads the manager profile for the dashboard welcome message.
  const { user } = useAuth();
  // This hook reads and updates shared orders, reservations, and menu data.
  const { state, dispatch } = useOrders();
  // This hook supplies the active palette for all manager dashboard sections.
  const { colors } = useTheme();
  // This state selects one of the manager's three dashboard sections.
  const [activeTab, setActiveTab] = useState('Incoming Orders');
  // This state holds the name for a newly added menu item.
  const [newItemName, setNewItemName] = useState('');
  // This state holds the price for a newly added menu item.
  const [newItemPrice, setNewItemPrice] = useState('');
  // This state selects the category for a new menu item.
  const [newItemCategory, setNewItemCategory] = useState('Mains');
  // This memo rebuilds dashboard styles only when the active palette changes.
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const addMenuItem = () => {
    const price = Number(newItemPrice);
    if (!newItemName.trim() || !Number.isFinite(price) || price <= 0) {
      Alert.alert('Check the menu item', 'Enter a name and a price greater than zero.');
      return;
    }
    dispatch({
      type: 'ADD_MENU_ITEM',
      item: {
        id: `menu_${Date.now()}`,
        name: newItemName.trim(),
        description: 'New item added by the restaurant manager.',
        price,
        category: newItemCategory,
        image: '',
        isSpecial: false,
        isAvailable: true,
      },
    });
    setNewItemName('');
    setNewItemPrice('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Manager Dashboard</Text>
      <Text style={styles.subtitle}>Welcome, {user?.fullName || 'Manager'}!</Text>
      <View style={styles.tabRow}>
        {DASHBOARD_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonSelected]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextSelected]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'Incoming Orders' && (
        <View>
          {state.orders.length === 0 ? (
            <Text style={styles.emptyText}>No incoming orders yet.</Text>
          ) : state.orders.map((order) => (
            <View key={order.id} style={styles.card}>
              <Text style={styles.cardTitle}>Order {order.id}</Text>
              <Text style={styles.body}>{order.customerName} - {order.type} - ${order.total.toFixed(2)}</Text>
              <Text style={styles.status}>Current status: {order.status}</Text>
              <View style={styles.actionRow}>
                {ORDER_STATUSES.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={styles.actionButton}
                    onPress={() => dispatch({ type: 'UPDATE_ORDER_STATUS', id: order.id, status })}
                    activeOpacity={0.8}
                  >
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
          {state.reservations.length === 0 ? (
            <Text style={styles.emptyText}>No reservations have been requested.</Text>
          ) : state.reservations.map((reservation) => (
            <View key={reservation.id} style={styles.card}>
              <Text style={styles.cardTitle}>{reservation.customerName} - {reservation.tableId}</Text>
              <Text style={styles.body}>{reservation.date} at {reservation.time}, party of {reservation.partySize}</Text>
              <Text style={styles.status}>Status: {reservation.status}</Text>
              {reservation.status === 'Pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => dispatch({ type: 'UPDATE_RESERVATION_STATUS', id: reservation.id, status: 'Accepted' })}
                  >
                    <Text style={styles.actionText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButtonDanger}
                    onPress={() => dispatch({ type: 'UPDATE_RESERVATION_STATUS', id: reservation.id, status: 'Declined' })}
                  >
                    <Text style={styles.actionText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {activeTab === 'Menu Management' && (
        <View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Add a menu item</Text>
            <TextInput
              style={styles.input}
              placeholder="Item name"
              placeholderTextColor={colors.textMuted}
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={newItemPrice}
              onChangeText={setNewItemPrice}
            />
            <View style={styles.actionRow}>
              {CATEGORIES.filter((category) => category !== 'All').map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[styles.actionButton, newItemCategory === category && styles.selectedAction]}
                  onPress={() => setNewItemCategory(category)}
                >
                  <Text style={styles.actionText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.addButton} onPress={addMenuItem} activeOpacity={0.8}>
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          {state.menuItems.map((item) => (
            <View key={item.id} style={styles.menuRow}>
              <View style={styles.menuItemInfo}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.body}>{item.isAvailable ? 'Available' : 'Unavailable'}</Text>
              </View>
              <TextInput
                key={`${item.id}-${item.price}`}
                style={styles.priceInput}
                defaultValue={String(item.price)}
                keyboardType="decimal-pad"
                accessibilityLabel={`Price for ${item.name}`}
                onEndEditing={(event) => {
                  const price = Number(event.nativeEvent.text);
                  if (Number.isFinite(price) && price > 0) {
                    dispatch({ type: 'UPDATE_MENU_ITEM', id: item.id, updates: { price } });
                  }
                }}
              />
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => dispatch({ type: 'TOGGLE_MENU_AVAILABILITY', id: item.id })}
                activeOpacity={0.8}
              >
                <Text style={styles.actionText}>Toggle</Text>
              </TouchableOpacity>
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
    input: { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, borderWidth: 1, borderRadius: 8, color: colors.text, paddingHorizontal: 10, paddingVertical: 9, marginVertical: 5 },
    addButton: { backgroundColor: colors.success, alignItems: 'center', padding: 10, borderRadius: 8, marginTop: 10 },
    addButtonText: { color: colors.badgeText, fontWeight: '700' },
    menuRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 8 },
    menuItemInfo: { flex: 1 },
    priceInput: { width: 72, color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, borderWidth: 1, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 6, textAlign: 'center' },
  });
}
