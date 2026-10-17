import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { initialUsers } from '../data/users';
import { lightColors } from '../theme/colors';

/**
 * LoginScreen
 * Handles both Login and Signup functionality using useState only (no context or external state library).
 * Features controlled inputs, field-level validation, simulated network delay, and role-based navigation.
 */
export default function LoginScreen({ navigation }) {
  // HOOK 1: useState for mode
  // What it does: Tracks whether the user is on the 'login' screen or 'signup' screen.
  // Why it is used: Allows toggling between Login and Signup forms within a single screen component.
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  // HOOK 2: useState for email
  // What it does: Stores the current text value of the email input field.
  // Why it is used: React Native uses controlled components, so input values are driven by state.
  const [email, setEmail] = useState('');

  // HOOK 3: useState for password
  // What it does: Stores the current text value of the password input field.
  // Why it is used: Keeps the password in state for validation checks and credential matching.
  const [password, setPassword] = useState('');

  // HOOK 4: useState for fullName
  // What it does: Stores the user's full name during the signup process.
  // Why it is used: Required only for new account registration in signup mode.
  const [fullName, setFullName] = useState('');

  // HOOK 5: useState for confirmPassword
  // What it does: Stores the repeated password to confirm there are no typos during signup.
  // Why it is used: Ensures password confirmation matches before allowing account creation.
  const [confirmPassword, setConfirmPassword] = useState('');

  // HOOK 6: useState for role
  // What it does: Stores the selected user role ('customer' or 'manager').
  // Why it is used: The assignment requires role selection on signup to determine access permissions.
  const [role, setRole] = useState('customer'); // 'customer' | 'manager'

  // HOOK 7: useState for errors object
  // What it does: Stores validation error messages for each field (e.g., { email: '...', password: '...' }).
  // Why it is used: Allows displaying inline error messages under specific fields and clearing them individually when edited.
  const [errors, setErrors] = useState({});

  // HOOK 8: useState for showPassword toggle
  // What it does: Boolean flag (true/false) indicating if the password should be shown as plain text or masked.
  // Why it is used: Enhances usability by letting users inspect their password before submitting.
  const [showPassword, setShowPassword] = useState(false);

  // HOOK 9: useState for isSubmitting flag
  // What it does: Tracks whether an authentication request is currently in progress.
  // Why it is used: Disables the submit button and displays an ActivityIndicator to prevent duplicate submissions.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // HOOK 10: useState for registered users array
  // What it does: Holds the current list of users, initialized with mock data from users.js.
  // Why it is used: In the absence of a backend, new signups are saved in this state array so they can immediately log in.
  const [users, setUsers] = useState(initialUsers);

  /**
   * Helper function to clear field error as soon as the user starts editing that field.
   * Requirement: "Errors for a field must clear as soon as the user edits that field."
   */
  const handleFieldChange = (field, value, setter) => {
    setter(value);
    if (errors[field]) {
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[field];
        return updatedErrors;
      });
    }
  };

  /**
   * Validates form fields on submit.
   * Rules:
   * 1. Valid email format (e.g., user@domain.com)
   * 2. Password has at least 8 characters and contains at least one digit
   * 3. In signup mode: Full name is required, and password matches confirmPassword
   */
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation: minimum 8 characters and at least one digit
    const hasDigit = /\d/.test(password);
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!hasDigit) {
      newErrors.password = 'Password must contain at least one digit (0-9)';
    }

    // Signup-specific validations
    if (mode === 'signup') {
      if (!fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handles Form Submission (Login or Signup)
   * Simulates network delay with a 1-second setTimeout.
   * Navigates Customer to MenuScreen and Manager to DashboardScreen on success.
   * Shows an Alert on failure.
   */
  const handleSubmit = () => {
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    // Simulate network delay of 1 second as required by the assignment
    setTimeout(() => {
      setIsSubmitting(false);

      if (mode === 'login') {
        // Authenticate against users array
        const cleanEmail = email.trim().toLowerCase();
        const foundUser = users.find(
          (u) => u.email.toLowerCase() === cleanEmail && u.password === password
        );

        if (foundUser) {
          // Role-based navigation
          if (foundUser.role === 'manager') {
            navigation.navigate('Dashboard', { user: foundUser });
          } else {
            navigation.navigate('Menu', { user: foundUser });
          }
        } else {
          Alert.alert(
            'Login Failed',
            'Invalid email or password. Please check your credentials and try again.'
          );
        }
      } else {
        // Signup Mode
        const cleanEmail = email.trim().toLowerCase();
        const userExists = users.some((u) => u.email.toLowerCase() === cleanEmail);

        if (userExists) {
          Alert.alert('Signup Failed', 'An account with this email already exists.');
          return;
        }

        const newUser = {
          id: `u_${Date.now()}`,
          fullName: fullName.trim(),
          email: cleanEmail,
          password: password,
          role: role,
        };

        // Append new user to local state array
        setUsers((prevUsers) => [...prevUsers, newUser]);

        Alert.alert(
          'Signup Successful',
          `Account created for ${newUser.fullName} (${newUser.role}). Navigating to your home screen...`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (newUser.role === 'manager') {
                  navigation.navigate('Dashboard', { user: newUser });
                } else {
                  navigation.navigate('Menu', { user: newUser });
                }
              },
            },
          ]
        );
      }
    }, 1000);
  };

  /**
   * Switch between Login and Signup modes
   */
  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header / Brand */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>FeastFlow</Text>
          <Text style={styles.brandSubtitle}>Restaurant App MVP</Text>
        </View>

        {/* Mode Toggle Tabs (Login vs Signup) */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.tabButton, mode === 'login' && styles.tabButtonActive]}
            onPress={() => switchMode('login')}
            disabled={isSubmitting}
          >
            <Text
              style={[styles.tabButtonText, mode === 'login' && styles.tabButtonTextActive]}
            >
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, mode === 'signup' && styles.tabButtonActive]}
            onPress={() => switchMode('signup')}
            disabled={isSubmitting}
          >
            <Text
              style={[styles.tabButtonText, mode === 'signup' && styles.tabButtonTextActive]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.formTitle}>
            {mode === 'login' ? 'Welcome Back!' : 'Create an Account'}
          </Text>

          {/* Full Name field (Signup mode only) */}
          {mode === 'signup' && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                placeholder="e.g. John Doe"
                placeholderTextColor={lightColors.textMuted}
                value={fullName}
                onChangeText={(text) => handleFieldChange('fullName', text, setFullName)}
                editable={!isSubmitting}
                autoCapitalize="words"
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>
          )}

          {/* Email field (Both modes) */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="e.g. customer@test.com"
              placeholderTextColor={lightColors.textMuted}
              value={email}
              onChangeText={(text) => handleFieldChange('email', text, setEmail)}
              editable={!isSubmitting}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Password field (Both modes) */}
          <View style={styles.fieldContainer}>
            <View style={styles.passwordHeader}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.showHideText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Min 8 characters with 1 digit"
              placeholderTextColor={lightColors.textMuted}
              value={password}
              onChangeText={(text) => handleFieldChange('password', text, setPassword)}
              editable={!isSubmitting}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Confirm Password field (Signup mode only) */}
          {mode === 'signup' && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                placeholder="Re-enter your password"
                placeholderTextColor={lightColors.textMuted}
                value={confirmPassword}
                onChangeText={(text) =>
                  handleFieldChange('confirmPassword', text, setConfirmPassword)
                }
                editable={!isSubmitting}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>
          )}

          {/* Role Selector (Signup mode only) */}
          {mode === 'signup' && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Select Your Role</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'customer' && styles.roleOptionSelected,
                  ]}
                  onPress={() => setRole('customer')}
                  disabled={isSubmitting}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      role === 'customer' && styles.roleOptionTextSelected,
                    ]}
                  >
                    Customer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    role === 'manager' && styles.roleOptionSelected,
                  ]}
                  onPress={() => setRole('manager')}
                  disabled={isSubmitting}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      role === 'manager' && styles.roleOptionTextSelected,
                    ]}
                  >
                    Manager
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Submit Button with ActivityIndicator */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <View style={styles.submittingContainer}>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.submitButtonText}>
                  {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Mock Credentials Quick Info Helper */}
          {mode === 'login' && (
            <View style={styles.quickInfoBox}>
              <Text style={styles.quickInfoTitle}>Mock Login Accounts:</Text>
              <Text style={styles.quickInfoText}>
                • Customer: <Text style={styles.bold}>customer@test.com</Text> / Pass1234
              </Text>
              <Text style={styles.quickInfoText}>
                • Manager: <Text style={styles.bold}>manager@test.com</Text> / Pass1234
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: lightColors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: lightColors.primary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: lightColors.textSecondary,
    marginTop: 4,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#EAEAEA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.textSecondary,
  },
  tabButtonTextActive: {
    color: lightColors.primary,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: lightColors.text,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: lightColors.text,
    marginBottom: 6,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showHideText: {
    fontSize: 13,
    color: lightColors.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: lightColors.inputBackground,
    borderWidth: 1,
    borderColor: lightColors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: lightColors.text,
  },
  inputError: {
    borderColor: lightColors.error,
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    fontSize: 12,
    color: lightColors.error,
    marginTop: 4,
    fontWeight: '500',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: lightColors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: lightColors.inputBackground,
  },
  roleOptionSelected: {
    borderColor: lightColors.primary,
    backgroundColor: lightColors.primaryLight,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.textSecondary,
  },
  roleOptionTextSelected: {
    color: lightColors.primaryDark,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: lightColors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: lightColors.disabled,
  },
  submittingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  quickInfoBox: {
    marginTop: 18,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: lightColors.primary,
  },
  quickInfoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: lightColors.text,
    marginBottom: 4,
  },
  quickInfoText: {
    fontSize: 12,
    color: lightColors.textSecondary,
    marginVertical: 1,
  },
  bold: {
    fontWeight: '700',
    color: lightColors.text,
  },
});
