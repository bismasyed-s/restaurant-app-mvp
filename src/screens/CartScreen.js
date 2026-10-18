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
import { PROMO_CODES } from '../reducers/cartReducer';
import useCart from '../hooks/useCart';
import useTheme from '../hooks/useTheme';
import useOrders from '../hooks/useOrders';
import useAuth from '../hooks/useAuth';
import { mockTables } from '../data/reservations';

export default function CartScreen({ navigation }) {
  // This hook supplies cart items and dispatches their quantity, note, and promo actions.
  const { state, dispatch } = useCart();
  // This hook creates saved orders after the customer chooses how to receive the order.
  const { dispatch: dispatchOrder } = useOrders();
  // This hook supplies the current customer identity for the order record.
  const { user } = useAuth();
  // This hook supplies the active palette so the cart follows the app theme.
  const { colors } = useTheme();
  // This state holds the code currently being entered in the promo box.
  const [promoInput, setPromoInput] = useState('');
  // This state chooses whether the order is eaten in or collected.
  const [orderType, setOrderType] = useState('Dine-in');
  // This state stores the selected table for dine-in orders.
  const [selectedTableId, setSelectedTableId] = useState(mockTables[0].id);
  // This state stores the pickup time for takeaway orders.
  const [pickupTime, setPickupTime] = useState('19:00');
  // This memo rebuilds the cart styles only when the active palette changes.
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  const discount = subtotal * (state.discountPercent / 100);
  const total = subtotal - discount;

  const placeOrder = () => {
    if (state.items.length === 0) {
      Alert.alert('Cart is empty', 'Add an item before placing your order.');
      return;
    }
    const orderId = `order_${Date.now()}`;
    const order = {
      id: orderId,
      items: state.items.map((item) => ({ ...item })),
      total: subtotal + subtotal * 0.05 + subtotal * 0.15 - discount,
      type: orderType,
      status: 'Pending',
      timestamp: new Date().toISOString(),
      customerId: user?.id || null,
      customerName: user?.fullName || 'Customer',
      ...(orderType === 'Dine-in' ? { tableId: selectedTableId } : { pickupTime }),
    };
    dispatchOrder({ type: 'ADD_ORDER', order });
    dispatch({ type: 'CLEAR_CART' });
    navigation.navigate('OrderTracking', { orderId });
  };

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!Object.prototype.hasOwnProperty.call(PROMO_CODES, code)) {
      Alert.alert('Invalid promo code', 'Try WELCOME10 or FEAST20.');
      return;
    }
    dispatch({ type: 'APPLY_PROMO', code });
    setPromoInput(code);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Your Cart ({itemCount})</Text>
      {state.items.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty. Add an item from the menu.</Text>
      ) : (
        state.items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeading}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.price}>${item.price.toFixed(2)} each</Text>
              </View>
              <TouchableOpacity
                onPress={() => dispatch({ type: 'REMOVE_ITEM', id: item.id })}
                activeOpacity={0.8}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>Quantity</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepButton}
                  onPress={() => dispatch({ type: 'DECREMENT', id: item.id })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.stepText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.stepButton}
                  onPress={() => dispatch({ type: 'INCREMENT', id: item.id })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.stepText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TextInput
              style={styles.noteInput}
              placeholder="Special instructions (e.g. no onions)"
              placeholderTextColor={colors.textMuted}
              value={item.note}
              onChangeText={(note) => dispatch({ type: 'UPDATE_NOTE', id: item.id, note })}
            />
            <Text style={styles.lineTotal}>Item total: ${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))
      )}

      <View style={styles.promoSection}>
        <Text style={styles.sectionHeading}>Promo code</Text>
        <View style={styles.promoRow}>
          <TextInput
            style={styles.promoInput}
            placeholder="WELCOME10 or FEAST20"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            value={promoInput}
            onChangeText={setPromoInput}
          />
          <TouchableOpacity style={styles.promoButton} onPress={applyPromo} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Apply</Text>
          </TouchableOpacity>
        </View>
        {state.promoCode && (
          <View style={styles.appliedPromoRow}>
            <Text style={styles.appliedPromo}>{state.promoCode} ({state.discountPercent}% off)</Text>
            <TouchableOpacity onPress={() => dispatch({ type: 'REMOVE_PROMO' })}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.orderTypeSection}>
        <Text style={styles.sectionHeading}>Order type</Text>
        <View style={styles.orderTypeRow}>
          {['Dine-in', 'Takeaway'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.orderTypeButton, orderType === type && styles.orderTypeButtonSelected]}
              onPress={() => setOrderType(type)}
              activeOpacity={0.8}
            >
              <Text style={[styles.orderTypeText, orderType === type && styles.orderTypeTextSelected]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {orderType === 'Dine-in' ? (
          <View style={styles.tableChoices}>
            {mockTables.map((table) => (
              <TouchableOpacity
                key={table.id}
                style={[styles.tableButton, selectedTableId === table.id && styles.orderTypeButtonSelected]}
                onPress={() => setSelectedTableId(table.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.orderTypeText, selectedTableId === table.id && styles.orderTypeTextSelected]}>
                  {table.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <TextInput
            style={styles.noteInput}
            placeholder="Pickup time (for example 19:00)"
            placeholderTextColor={colors.textMuted}
            value={pickupTime}
            onChangeText={setPickupTime}
          />
        )}
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>Items: {itemCount}</Text>
        <Text style={styles.summaryText}>Subtotal: ${subtotal.toFixed(2)}</Text>
        {state.discountPercent > 0 && (
          <Text style={styles.discountText}>Discount ({state.discountPercent}%): -${discount.toFixed(2)}</Text>
        )}
        <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
      </View>
      {state.items.length > 0 && (
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={placeOrder}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Place Order</Text>
        </TouchableOpacity>
      )}
      {state.items.length > 0 && (
        <TouchableOpacity
          style={styles.summaryButton}
          onPress={() => navigation.navigate('OrderSummary')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>View Order Summary</Text>
        </TouchableOpacity>
      )}
      {state.items.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => dispatch({ type: 'CLEAR_CART' })}
          activeOpacity={0.8}
        >
          <Text style={styles.clearButtonText}>Clear Cart</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
      paddingBottom: 28,
    },
    heading: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 16,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 15,
      paddingVertical: 20,
    },
    itemCard: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
    },
    itemHeading: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    itemInfo: {
      flex: 1,
      marginRight: 12,
    },
    itemName: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    price: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 3,
    },
    removeText: {
      color: colors.error,
      fontSize: 13,
      fontWeight: '600',
    },
    quantityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 10,
    },
    quantityLabel: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    stepButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepText: {
      color: colors.badgeText,
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 24,
    },
    quantity: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
      minWidth: 16,
      textAlign: 'center',
    },
    noteInput: {
      backgroundColor: colors.inputBackground,
      borderColor: colors.inputBorder,
      borderWidth: 1,
      borderRadius: 8,
      color: colors.text,
      fontSize: 14,
      paddingHorizontal: 10,
      paddingVertical: 9,
    },
    lineTotal: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 10,
      textAlign: 'right',
    },
    promoSection: {
      marginTop: 12,
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },
    sectionHeading: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 10,
    },
    promoRow: {
      flexDirection: 'row',
      gap: 8,
    },
    promoInput: {
      flex: 1,
      color: colors.text,
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      fontSize: 14,
    },
    promoButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingHorizontal: 16,
      justifyContent: 'center',
    },
    buttonText: {
      color: colors.badgeText,
      fontWeight: '700',
    },
    appliedPromoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    appliedPromo: {
      color: colors.success,
      fontSize: 13,
    },
    summary: {
      marginTop: 16,
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
    },
    summaryText: {
      color: colors.textSecondary,
      fontSize: 14,
      marginBottom: 6,
    },
    discountText: {
      color: colors.success,
      fontSize: 14,
      marginBottom: 6,
    },
    total: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      marginTop: 4,
    },
    orderTypeSection: {
      marginTop: 12,
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },
    orderTypeRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 10,
    },
    orderTypeButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 9,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    orderTypeButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    orderTypeText: {
      color: colors.textSecondary,
      fontWeight: '600',
      fontSize: 13,
    },
    orderTypeTextSelected: {
      color: colors.badgeText,
    },
    tableChoices: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tableButton: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    placeOrderButton: {
      marginTop: 14,
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: colors.success,
    },
    summaryButton: {
      marginTop: 14,
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    clearButton: {
      marginTop: 14,
      alignItems: 'center',
      paddingVertical: 11,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.error,
    },
    clearButtonText: {
      color: colors.error,
      fontWeight: '600',
    },
  });
}
