import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { mockTables, reservationTimeSlots } from '../data/reservations';
import useAuth from '../hooks/useAuth';
import useOrders from '../hooks/useOrders';
import useTheme from '../hooks/useTheme';

export default function ReservationScreen() {
  // This hook reads the current customer for each saved reservation.
  const { user } = useAuth();
  // This hook reads saved bookings and dispatches new reservations.
  const { state, dispatch } = useOrders();
  // This hook supplies the active palette for the reservation screen.
  const { colors } = useTheme();
  // This state holds the selected booking date.
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  // This state holds the selected reservation time.
  const [time, setTime] = useState('19:00');
  // This state holds the party size so an appropriately sized table can be selected.
  const [partySize, setPartySize] = useState('2');
  // This state holds the customer's chosen table.
  const [tableId, setTableId] = useState(mockTables[0].id);
  // This memo rebuilds reservation styles only when the palette changes.
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const requestedSeats = Number(partySize) || 1;
  const availableTables = mockTables.filter((table) => {
    const hasSeats = table.seats >= requestedSeats;
    const alreadyBooked = state.reservations.some((reservation) =>
      reservation.date === date &&
      reservation.time === time &&
      reservation.tableId === table.id &&
      reservation.status !== 'Declined'
    );
    return hasSeats && !alreadyBooked;
  });
  const myReservations = state.reservations.filter((reservation) => reservation.customerId === user?.id);

  const createReservation = () => {
    const selectedTable = availableTables.find((table) => table.id === tableId);
    if (!date || !selectedTable || requestedSeats < 1 || requestedSeats > selectedTable.seats) {
      Alert.alert('Choose an available table', 'Select a date, time, party size, and open table.');
      return;
    }
    const reservation = {
      id: `reservation_${Date.now()}`,
      customerId: user?.id || null,
      customerName: user?.fullName || 'Customer',
      date,
      time,
      partySize: requestedSeats,
      tableId,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_RESERVATION', reservation });
    Alert.alert('Reservation requested', `${selectedTable.name} at ${time} is awaiting manager approval.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Reserve a Table</Text>
      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} />
      <Text style={styles.label}>Party size</Text>
      <TextInput style={styles.input} value={partySize} onChangeText={setPartySize} keyboardType="number-pad" />
      <Text style={styles.label}>Time</Text>
      <View style={styles.choiceRow}>
        {reservationTimeSlots.map((slot) => (
          <TouchableOpacity key={slot} style={[styles.choice, time === slot && styles.choiceSelected]} onPress={() => setTime(slot)}>
            <Text style={[styles.choiceText, time === slot && styles.choiceTextSelected]}>{slot}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Available tables</Text>
      <View style={styles.choiceRow}>
        {mockTables.map((table) => {
          const isAvailable = availableTables.some((available) => available.id === table.id);
          return (
            <TouchableOpacity
              key={table.id}
              disabled={!isAvailable}
              style={[styles.choice, tableId === table.id && styles.choiceSelected, !isAvailable && styles.choiceDisabled]}
              onPress={() => setTableId(table.id)}
            >
              <Text style={[styles.choiceText, tableId === table.id && styles.choiceTextSelected]}>{table.name} ({table.seats})</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {availableTables.length === 0 && <Text style={styles.error}>No table is free for that date and time.</Text>}
      <TouchableOpacity style={styles.submitButton} onPress={createReservation} activeOpacity={0.8}>
        <Text style={styles.submitText}>Request Reservation</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>My Reservations</Text>
      {myReservations.length === 0 ? (
        <Text style={styles.body}>You have no reservations yet.</Text>
      ) : myReservations.map((reservation) => (
        <View key={reservation.id} style={styles.reservationCard}>
          <Text style={styles.body}>{reservation.date} at {reservation.time} - {reservation.tableId}</Text>
          <Text style={styles.body}>Party of {reservation.partySize} - {reservation.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, paddingBottom: 28 },
    title: { color: colors.text, fontSize: 24, fontWeight: '700', marginBottom: 16 },
    sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 22, marginBottom: 10 },
    label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 10 },
    input: { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.inputBorder, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
    choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
    choice: { borderColor: colors.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: colors.card },
    choiceSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
    choiceDisabled: { opacity: 0.35 },
    choiceText: { color: colors.textSecondary, fontSize: 12 },
    choiceTextSelected: { color: colors.badgeText, fontWeight: '700' },
    submitButton: { alignItems: 'center', paddingVertical: 12, borderRadius: 8, backgroundColor: colors.primary, marginTop: 14 },
    submitText: { color: colors.badgeText, fontWeight: '700' },
    error: { color: colors.error, marginTop: 8 },
    body: { color: colors.textSecondary, fontSize: 14, marginBottom: 4 },
    reservationCard: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8 },
  });
}
