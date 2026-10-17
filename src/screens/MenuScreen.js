import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { lightColors } from '../theme/colors';

/**
 * MenuScreen (Placeholder for Question 3 navigation)
 * Customers land here after successful login.
 */
export default function MenuScreen({ navigation, route }) {
  const user = route.params?.user;

  return (
    <View style={styles.container}>
      <Text style={styles.badge}>Customer View</Text>
      <Text style={styles.title}>Menu Browsing Screen</Text>
      <Text style={styles.subtitle}>
        Welcome, {user?.fullName || 'Customer'}!
      </Text>
      <Text style={styles.description}>
        This is the customer menu placeholder screen for Question 3. In Question 4, menu items with categories, specials, and filtering will be loaded here.
      </Text>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.backButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  badge: {
    backgroundColor: lightColors.primaryLight,
    color: lightColors.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: lightColors.primary,
    fontWeight: '600',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: lightColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: lightColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
