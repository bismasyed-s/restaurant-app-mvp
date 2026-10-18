import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../api/client';

const TIME_SLOTS = Array.from({ length: 11 }, (_, index) => `${String(index + 12).padStart(2, '0')}:00`);

export default function useReservation() {
  // This state stores the chosen calendar date.
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  // This state stores the chosen hourly slot.
  const [timeSlot, setTimeSlot] = useState('19:00');
  // This state stores the requested party size as editable text.
  const [partySize, setPartySize] = useState('2');
  // This state stores the chosen database table id.
  const [tableId, setTableId] = useState('');
  // This state stores the customer's phone contact.
  const [phone, setPhone] = useState('');
  // This state holds tables returned by the server.
  const [tables, setTables] = useState([]);
  // This state holds free tables by hourly slot for the selected date and party size.
  const [availableBySlot, setAvailableBySlot] = useState({});
  // This state holds the logged-in customer's server reservations.
  const [myReservations, setMyReservations] = useState([]);
  // This state shows when availability or reservation data is loading.
  const [loading, setLoading] = useState(true);
  // This state displays useful validation and server errors.
  const [error, setError] = useState(null);

  // This callback loads table options and the customer's current reservations.
  const loadReservationData = useCallback(async () => {
    setLoading(true);
    try {
      const [tableData, reservationData] = await Promise.all([
        apiRequest('/api/tables'),
        apiRequest('/api/reservations/my'),
      ]);
      setTables(tableData);
      setMyReservations(reservationData);
      setTableId((currentId) => currentId || tableData[0]?._id || '');
      setError(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // This effect loads the tables and the user's saved reservations on entry.
  useEffect(() => {
    loadReservationData();
  }, [loadReservationData]);

  // This effect refreshes the customer's booking statuses while the screen stays open.
  useEffect(() => {
    const reservationInterval = setInterval(async () => {
      try {
        setMyReservations(await apiRequest('/api/reservations/my'));
      } catch (requestError) {
        setError(requestError.message);
      }
    }, 10000);
    return () => clearInterval(reservationInterval);
  }, []);

  // This effect asks the server which tables are free at each slot.
  useEffect(() => {
    let isActive = true;
    const size = Number(partySize);
    if (!date || !Number.isInteger(size) || size < 1 || size > 12) {
      setAvailableBySlot({});
      return () => { isActive = false; };
    }
    const loadAvailability = async () => {
      try {
        const results = await Promise.all(TIME_SLOTS.map(async (slot) => {
          const query = `?date=${encodeURIComponent(date)}&timeSlot=${encodeURIComponent(slot)}&partySize=${size}`;
          return [slot, await apiRequest(`/api/reservations/availability${query}`)];
        }));
        if (isActive) {
          const nextAvailability = Object.fromEntries(results);
          setAvailableBySlot(nextAvailability);
          const selectedTables = nextAvailability[timeSlot] || [];
          if (!selectedTables.some((table) => table._id === tableId)) {
            setTableId(selectedTables[0]?._id || '');
          }
        }
      } catch (requestError) {
        if (isActive) setError(requestError.message);
      }
    };
    loadAvailability();
    return () => { isActive = false; };
  }, [date, partySize, tableId, timeSlot]);

  // This function checks the A1 rules before showing the booking confirmation.
  const validateReservation = useCallback(() => {
    const size = Number(partySize);
    let validationMessage = null;
    if (!date || Number.isNaN(new Date(`${date}T00:00:00`).getTime())) validationMessage = 'Enter a valid reservation date.';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservationDateTime = new Date(`${date}T${timeSlot}:00`);
    if (!validationMessage && new Date(`${date}T00:00:00`) < today) validationMessage = 'Date cannot be in the past.';
    if (!validationMessage && reservationDateTime.getTime() < Date.now() + 60 * 60 * 1000) validationMessage = 'Choose a time at least one hour from now.';
    if (!validationMessage && (!Number.isInteger(size) || size < 1 || size > 12)) validationMessage = 'Party size must be between 1 and 12.';
    if (!validationMessage && !/^03\d{2}-\d{7}$/.test(phone)) validationMessage = 'Phone must match 03XX-XXXXXXX.';
    const selectedTable = (availableBySlot[timeSlot] || []).find((table) => table._id === tableId);
    if (!validationMessage && (!selectedTable || selectedTable.seats < size)) validationMessage = 'Choose a free table with enough seats.';
    setError(validationMessage);
    return !validationMessage;
  }, [availableBySlot, date, partySize, phone, tableId, timeSlot]);

  // This function checks the A1 rules and saves a valid booking through the API.
  const createReservation = useCallback(async () => {
    if (!validateReservation()) throw new Error('Check the reservation details and try again.');
    const size = Number(partySize);

    try {
      const reservation = await apiRequest('/api/reservations', {
        method: 'POST',
        body: { table: tableId, date, timeSlot, partySize: size, phone },
      });
      setMyReservations((current) => [reservation, ...current]);
      await loadReservationData();
      return reservation;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  }, [date, loadReservationData, partySize, phone, tableId, timeSlot, validateReservation]);

  // This function reloads every time slot after a booking or cancellation.
  const refreshAvailability = useCallback(async () => {
    const size = Number(partySize);
    if (!Number.isInteger(size) || size < 1 || size > 12) return;
    const results = await Promise.all(TIME_SLOTS.map(async (slot) => {
      const query = `?date=${encodeURIComponent(date)}&timeSlot=${encodeURIComponent(slot)}&partySize=${size}`;
      return [slot, await apiRequest(`/api/reservations/availability${query}`)];
    }));
    setAvailableBySlot(Object.fromEntries(results));
  }, [date, partySize]);

  // This function cancels the customer's own reservation through the server.
  const cancelReservation = useCallback(async (reservationId) => {
    try {
      const updated = await apiRequest(`/api/reservations/${reservationId}`, {
        method: 'PATCH', body: { status: 'Cancelled' },
      });
      setMyReservations((current) => current.map((item) => item._id === reservationId ? updated : item));
      await refreshAvailability();
      return updated;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  }, [refreshAvailability]);

  return {
    date, setDate, timeSlot, setTimeSlot, partySize, setPartySize,
    tableId, setTableId, phone, setPhone, tables, availableBySlot,
    myReservations, loading, error, validateReservation, createReservation, cancelReservation,
    refreshAvailability, timeSlots: TIME_SLOTS,
  };
}
