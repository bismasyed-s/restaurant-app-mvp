import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import useTheme from '../hooks/useTheme';
import { apiRequest } from '../api/client';

const ORDER_STEPS = ['Pending', 'Preparing', 'Ready', 'Served'];

export default function OrderTrackingScreen({ route }) {
  // This hook supplies theme colors for the tracking view.
  const { colors } = useTheme();
  // This state records elapsed seconds so the running timer can update the screen.
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // This state holds the latest version of the order read from the server.
  const [order, setOrder] = useState(null);
  // This state shows any problem while the server order is being loaded.
  const [error, setError] = useState(null);
  // This memo rebuilds tracking styles only when the active palette changes.
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const orderId = route.params?.orderId;

  // This effect loads the order now, checks for status changes every ten seconds, and stops on exit.
  useEffect(() => {
    let isActive = true;
    const loadMyOrder = async () => {
      try {
        const orders = await apiRequest('/api/orders/my');
        const current = orders.find((item) => item._id === orderId);
        if (!current) throw new Error('This order could not be found.');
        if (isActive) {
          setOrder({
            ...current,
            id: current._id,
            timestamp: current.createdAt,
            tableId: current.table?.number || current.table,
            items: current.items.map((item, index) => ({ ...item, id: item._id || item.menuItem || String(index) })),
          });
          setError(null);
        }
      } catch (requestError) {
        if (isActive) setError(requestError.message);
      }
    };
    loadMyOrder();
    const statusInterval = setInterval(loadMyOrder, 10000);
    return () => {
      isActive = false;
      clearInterval(statusInterval);
    };
  }, [orderId]);

  // This effect updates the elapsed counter every second and clears the timer when the order changes.
  useEffect(() => {
    if (!order) return undefined;

    const updateElapsed = () => {
      setElapsedSeconds(Math.floor((Date.now() - new Date(order.createdAt || order.timestamp).getTime()) / 1000));
    };
    updateElapsed();
    const elapsedInterval = setInterval(updateElapsed, 1000);
    return () => clearInterval(elapsedInterval);
  }, [order?.id, order?.timestamp]);

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Order not found</Text>
        <Text style={styles.body}>{error || 'Place an order from your cart to track it here.'}</Text>
      </View>
    );
  }

  const currentStep = ORDER_STEPS.indexOf(order.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Order Tracking</Text>
      <Text style={styles.body}>Order {order.id}</Text>
      <Text style={styles.status}>Status: {order.status}</Text>
      <Text style={styles.body}>Elapsed: {Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, '0')}</Text>
      <Text style={styles.body}>Type: {order.type}</Text>
      {order.tableId && <Text style={styles.body}>Table: {order.tableId}</Text>}
      {order.pickupTime && <Text style={styles.body}>Pickup time: {order.pickupTime}</Text>}

      <View style={styles.progressRow}>
        {ORDER_STEPS.map((step, index) => {
          const isComplete = order.status === 'Cancelled' ? false : index <= currentStep;
          return (
            <View key={step} style={styles.progressStep}>
              <View style={[styles.stepCircle, isComplete && styles.stepCircleComplete]}>
                <Text style={[styles.stepNumber, isComplete && styles.stepNumberComplete]}>{index + 1}</Text>
              </View>
              <Text style={[styles.stepLabel, isComplete && styles.stepLabelComplete]}>{step}</Text>
            </View>
          );
        })}
      </View>
      {order.status === 'Cancelled' && <Text style={styles.cancelled}>This order was cancelled.</Text>}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Items</Text>
        {order.items.map((item, index) => (
          <View key={item.id || index} style={styles.itemRow}>
            <Text style={styles.body}>{item.name} x {item.quantity}</Text>
            <Text style={styles.body}>${(item.price * item.quantity).toFixed(2)}</Text>
            {!!item.note && <Text style={styles.note}>{item.note}</Text>}
          </View>
        ))}
        <Text style={styles.total}>Total: ${order.total.toFixed(2)}</Text>
      </View>
      <Text style={styles.timestamp}>Placed {new Date(order.timestamp).toLocaleString()}</Text>
    </ScrollView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingBottom: 28 },
    title: { color: colors.text, fontSize: 24, fontWeight: '700', marginBottom: 8 },
    body: { color: colors.textSecondary, fontSize: 14, marginBottom: 6 },
    status: { color: colors.primary, fontSize: 18, fontWeight: '700', marginVertical: 8 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 24 },
    progressStep: { alignItems: 'center', flex: 1 },
    stepCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    stepCircleComplete: { borderColor: colors.success, backgroundColor: colors.success },
    stepNumber: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
    stepNumberComplete: { color: colors.badgeText },
    stepLabel: { color: colors.textMuted, fontSize: 10, marginTop: 5 },
    stepLabelComplete: { color: colors.success, fontWeight: '700' },
    cancelled: { color: colors.error, fontWeight: '700', marginBottom: 12 },
    card: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 8 },
    sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 8 },
    itemRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
    note: { color: colors.textMuted, width: '100%', fontSize: 12 },
    total: { color: colors.text, fontSize: 17, fontWeight: '700', textAlign: 'right', marginTop: 8 },
    timestamp: { color: colors.textMuted, fontSize: 12, marginTop: 12 },
  });
}
