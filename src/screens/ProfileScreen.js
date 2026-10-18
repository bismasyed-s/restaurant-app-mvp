import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';

export default function ProfileScreen() {
  // This hook reads the signed-in user's profile and logout action.
  const { user, logout } = useAuth();
  // This hook reads and changes the app-wide light or dark theme.
  const { isDark, toggleTheme, colors } = useTheme();
  // This memo rebuilds profile styles only when the active palette changes.
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.value}>{user?.fullName}</Text>
      <Text style={styles.value}>{user?.email}</Text>
      <Text style={styles.value}>{user?.role}</Text>
      <View style={styles.themeRow}>
        <Text style={styles.themeLabel}>Dark mode</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      padding: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 20,
    },
    value: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 12,
    },
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 20,
      marginBottom: 24,
    },
    themeLabel: {
      fontSize: 16,
      color: colors.text,
    },
    logoutButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    logoutText: {
      color: colors.badgeText,
      fontWeight: '700',
      fontSize: 15,
    },
  });
}
