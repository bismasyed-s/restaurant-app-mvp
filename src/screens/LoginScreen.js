import React, { useCallback, useMemo, useState } from 'react';
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
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import useForm from '../hooks/useForm';
import { apiRequest } from '../api/client';

const EMPTY_FORM = { fullName: '', email: '', password: '', confirmPassword: '', role: 'customer' };

/**
 * LoginScreen
 * Handles login and signup with the shared form hook and server API.
 */
export default function LoginScreen() {
  // This hook stores the server token and public profile after authentication.
  const { login } = useAuth();
  // This hook supplies the active palette so login colors follow the global theme.
  const { colors } = useTheme();
  // This memo rebuilds styles only when the active color palette changes.
  const styles = useMemo(() => makeStyles(colors), [colors]);
  // This state switches between the two authentication forms.
  const [mode, setMode] = useState('login');
  // This state shows or hides the password fields.
  const [showPassword, setShowPassword] = useState(false);
  // This state disables another submit while the server is responding.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This callback keeps the original A1 validation rules in one reusable function.
  const validateForm = useCallback((values) => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email.trim()) nextErrors.email = 'Email is required';
    else if (!emailRegex.test(values.email.trim())) nextErrors.email = 'Please enter a valid email address';
    if (!values.password) nextErrors.password = 'Password is required';
    else if (values.password.length < 8) nextErrors.password = 'Password must be at least 8 characters long';
    else if (!/\d/.test(values.password)) nextErrors.password = 'Password must contain at least one digit (0-9)';
    if (mode === 'signup') {
      if (!values.fullName.trim()) nextErrors.fullName = 'Full name is required';
      if (!values.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password';
      else if (values.password !== values.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    }
    return nextErrors;
  }, [mode]);
  // This custom hook manages field values, validation messages, and form reset.
  const { values, errors, handleChange, handleSubmit: validateAndSubmit, reset } = useForm(EMPTY_FORM, validateForm);

  // This submit callback sends the validated form to the matching server endpoint.
  const handleSubmit = validateAndSubmit(async (formValues) => {
    setIsSubmitting(true);
    try {
      const result = await apiRequest(mode === 'login' ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        body: mode === 'login'
          ? { email: formValues.email.trim(), password: formValues.password }
          : { name: formValues.fullName.trim(), email: formValues.email.trim(), password: formValues.password, role: formValues.role },
      });
      const user = { ...result.user, id: result.user._id, fullName: result.user.name };
      await login(result.token, user);
      reset();
    } catch (error) {
      Alert.alert(mode === 'login' ? 'Login Failed' : 'Signup Failed', error.message);
    } finally {
      setIsSubmitting(false);
    }
  });

  // This function changes form mode and clears stale values and validation messages.
  const switchMode = (newMode) => {
    setMode(newMode);
    reset();
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
                placeholderTextColor={colors.textMuted}
                value={values.fullName}
                onChangeText={(text) => handleChange('fullName', text)}
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
              placeholderTextColor={colors.textMuted}
              value={values.email}
              onChangeText={(text) => handleChange('email', text)}
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
              placeholderTextColor={colors.textMuted}
              value={values.password}
              onChangeText={(text) => handleChange('password', text)}
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
                placeholderTextColor={colors.textMuted}
                value={values.confirmPassword}
                onChangeText={(text) =>
                  handleChange('confirmPassword', text)
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
                    values.role === 'customer' && styles.roleOptionSelected,
                  ]}
                  onPress={() => handleChange('role', 'customer')}
                  disabled={isSubmitting}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      values.role === 'customer' && styles.roleOptionTextSelected,
                    ]}
                  >
                    Customer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleOption,
                    values.role === 'manager' && styles.roleOptionSelected,
                  ]}
                  onPress={() => handleChange('role', 'manager')}
                  disabled={isSubmitting}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      values.role === 'manager' && styles.roleOptionTextSelected,
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
                <ActivityIndicator color={colors.badgeText} size="small" />
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
              <Text style={styles.quickInfoTitle}>Seeded Server Accounts:</Text>
              <Text style={styles.quickInfoText}>
                â€¢ Customer: <Text style={styles.bold}>customer@test.com</Text> / Pass1234
              </Text>
              <Text style={styles.quickInfoText}>
                â€¢ Manager: <Text style={styles.bold}>manager@test.com</Text> / Pass1234
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors) {
  return StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.surface,
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
    color: colors.primary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.borderLight,
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
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.card,
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
    color: colors.text,
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showHideText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.primaryLight,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
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
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
  },
  roleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  roleOptionTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  submittingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: colors.badgeText,
    fontSize: 16,
    fontWeight: '700',
  },
  quickInfoBox: {
    marginTop: 18,
    padding: 12,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  quickInfoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  quickInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginVertical: 1,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
});
}
