import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function useAuth() {
  // This hook reads shared authentication state so screens do not need user props.
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider.');
  }
  return context;
}
