import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import useCart from '../hooks/useCart';
import useTheme from '../hooks/useTheme';

export const SERVICE_CHARGE_RATE = 0.05;
export const SALES_TAX_RATE = 0.15;

export default function OrderSummaryScreen() {
  // This hook reads the shared cart lines and active discount.
  const { state } = useCart();
  // This hook supplies theme colors for the order totals.
  const { colors } = useTheme();
  // This memo calculates the order totals only when cart lines or discount change.
  const totals = useMemo(() => {
    const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const serviceCharge = subtotal * SERVICE_CHARGE_RATE;
    const salesTax = subtotal * SALES_TAX_RATE;
    const promoDiscount = subtotal * (state.discountPercent / 100);
    const grandTotal = subtotal + serviceCharge + salesTax - promoDiscount;

    return { subtotal, serviceCharge, salesTax, promoDiscount, grandTotal };
  }, [state.items, state.discountPercent]);
  // This memo rebuilds summary styles only when the active palette changes.
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Order Summary</Text>
      <View style={styles.card}>
        {state.items.length === 0 ? (
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        ) : (
          state.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name} x {item.quantity}</Text>
              <Text style={styles.amount}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))
        )}
      </View>
      <View style={styles.card}>
        <SummaryRow label="Subtotal" amount={totals.subtotal} styles={styles} />
        <SummaryRow label={`Service charge (${SERVICE_CHARGE_RATE * 100}%)`} amount={totals.serviceCharge} styles={styles} />
        <SummaryRow label={`Sales tax (${SALES_TAX_RATE * 100}%)`} amount={totals.salesTax} styles={styles} />
        {state.discountPercent > 0 && (
          <SummaryRow label={`Promo discount (${state.discountPercent}%)`} amount={-totals.promoDiscount} styles={styles} />
        )}
        <View style={styles.divider} />
        <SummaryRow label="Grand total" amount={totals.grandTotal} styles={styles} strong />
      </View>
    </ScrollView>
  );
}

function SummaryRow({ label, amount, styles, strong = false }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.label, strong && styles.strong]}>{label}</Text>
      <Text style={[styles.amount, strong && styles.strong]}>{amount < 0 ? '-' : ''}${Math.abs(amount).toFixed(2)}</Text>
    </View>
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
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 16,
    },
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    itemName: {
      color: colors.text,
      flex: 1,
      fontSize: 14,
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 6,
    },
    label: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    amount: {
      color: colors.text,
      fontSize: 14,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 8,
    },
    strong: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '700',
    },
  });
}
