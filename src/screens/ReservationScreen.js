import React, { useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import useReservation from '../hooks/useReservation';
import useTheme from '../hooks/useTheme';

export default function ReservationScreen() {
  // This hook owns booking fields, validation, availability, and API actions.
  const reservation = useReservation();
  // This hook supplies the active palette for the reservation screen.
  const { colors } = useTheme();
  // This memo rebuilds reservation styles only when the palette changes.
  const styles = useMemo(() => makeStyles(colors), [colors]);
  // This state shows the booking summary before it is sent to the server.
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  const availableTables = reservation.availableBySlot[reservation.timeSlot] || [];
  const selectedTable = availableTables.find((table) => table._id === reservation.tableId);

  const reviewReservation = () => {
    if (reservation.validateReservation()) setIsConfirmationVisible(true);
  };

  const confirmReservation = async () => {
    try {
      await reservation.createReservation();
      setIsConfirmationVisible(false);
      Alert.alert('Reservation requested', 'Your booking is waiting for manager approval.');
    } catch (error) {
      Alert.alert('Reservation failed', error.message);
    }
  };

  const askToCancel = (reservationId) => {
    Alert.alert('Cancel reservation?', 'This will cancel your booking.', [
      { text: 'Keep reservation', style: 'cancel' },
      { text: 'Cancel booking', style: 'destructive', onPress: () => reservation.cancelReservation(reservationId).catch((error) => Alert.alert('Could not cancel', error.message)) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Reserve a Table</Text>
      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={reservation.date} onChangeText={reservation.setDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} />
      <Text style={styles.label}>Party size</Text>
      <TextInput style={styles.input} value={reservation.partySize} onChangeText={reservation.setPartySize} keyboardType="number-pad" />
      <Text style={styles.label}>Phone (03XX-XXXXXXX)</Text>
      <TextInput style={styles.input} value={reservation.phone} onChangeText={reservation.setPhone} keyboardType="phone-pad" placeholder="0300-1234567" placeholderTextColor={colors.textMuted} />
      <Text style={styles.label}>Time</Text>
      <View style={styles.choiceRow}>
        {reservation.timeSlots.map((slot) => {
          const isAvailable = (reservation.availableBySlot[slot] || []).length > 0;
          return (
            <TouchableOpacity key={slot} disabled={!isAvailable} style={[styles.choice, reservation.timeSlot === slot && styles.choiceSelected, !isAvailable && styles.choiceDisabled]} onPress={() => reservation.setTimeSlot(slot)}>
              <Text style={[styles.choiceText, reservation.timeSlot === slot && styles.choiceTextSelected]}>{slot}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.label}>Available tables</Text>
      <View style={styles.choiceRow}>
        {availableTables.map((table) => (
          <TouchableOpacity key={table._id} style={[styles.choice, reservation.tableId === table._id && styles.choiceSelected]} onPress={() => reservation.setTableId(table._id)}>
            <Text style={[styles.choiceText, reservation.tableId === table._id && styles.choiceTextSelected]}>Table {table.number} ({table.seats})</Text>
          </TouchableOpacity>
        ))}
      </View>
      {reservation.error && <Text style={styles.error}>{reservation.error}</Text>}
      {reservation.loading && <Text style={styles.body}>Checking table availability...</Text>}
      {!reservation.loading && availableTables.length === 0 && <Text style={styles.error}>No table is free for that date and time.</Text>}
      <TouchableOpacity style={styles.submitButton} onPress={reviewReservation} activeOpacity={0.8}>
        <Text style={styles.submitText}>Review Reservation</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>My Reservations</Text>
      {reservation.myReservations.length === 0 ? (
        <Text style={styles.body}>You have no reservations yet.</Text>
      ) : reservation.myReservations.map((booking) => (
        <View key={booking._id} style={styles.reservationCard}>
          <Text style={styles.body}>Table {booking.table?.number || ''} · {new Date(booking.date).toLocaleDateString()} at {booking.timeSlot}</Text>
          <Text style={styles.body}>Party of {booking.partySize} · {booking.status}</Text>
          {['Pending', 'Accepted'].includes(booking.status) && (
            <TouchableOpacity onPress={() => askToCancel(booking._id)} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel reservation</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <Modal visible={isConfirmationVisible} transparent animationType="fade" onRequestClose={() => setIsConfirmationVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>Confirm your booking</Text>
            <Text style={styles.body}>{selectedTable ? `Table ${selectedTable.number} (${selectedTable.seats} seats)` : 'No table selected'}</Text>
            <Text style={styles.body}>{reservation.date} at {reservation.timeSlot}</Text>
            <Text style={styles.body}>Party of {reservation.partySize}</Text>
            <Text style={styles.body}>Phone: {reservation.phone}</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.choice} onPress={() => setIsConfirmationVisible(false)}><Text style={styles.choiceText}>Go back</Text></TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={confirmReservation}><Text style={styles.submitText}>Confirm booking</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    cancelButton: { alignSelf: 'flex-start', paddingVertical: 6, marginTop: 4 },
    cancelText: { color: colors.error, fontWeight: '700', fontSize: 13 },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalCard: { backgroundColor: colors.card, borderRadius: 14, padding: 18, borderWidth: 1, borderColor: colors.border },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, gap: 10 },
    error: { color: colors.error, marginTop: 8 },
    body: { color: colors.textSecondary, fontSize: 14, marginBottom: 4 },
    reservationCard: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8 },
  });
}
