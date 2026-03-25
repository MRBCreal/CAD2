import { type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginForm } from '../components/LoginForm';

/**
 * LoginModern Page Component
 *
 * Modern login page with split-layout design (40% brand + 60% form).
 * Integrates with Firebase authentication via useAuth hook.
 *
 * Usage:
 * - Replace <Route path="/login" element={<Login />} /> with <Route path="/login" element={<LoginModern />} />
 * - Or create a new route: <Route path="/login-modern" element={<LoginModern />} />
 *
 * Features:
 * - Professional split-layout design with brand section
 * - Email/password authentication
 * - Remember me functionality
 * - Password visibility toggle
 * - Error message display
 * - Loading states
 * - Fully responsive (mobile/tablet/desktop)
 */

export default function LoginModern() {
  const { login, error, loading } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    // The actual login is handled by the useAuth hook
    // This is just a wrapper to show how to integrate
    await login(email, password);
  };

  return (
    <LoginForm
      onSubmit={handleSubmit}
      isLoading={loading}
      error={error}
    />
  );
}
