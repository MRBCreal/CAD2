import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginForm.css';

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  error = '',
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [localError, setLocalError] = useState('');

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Por favor completa todos los campos');
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(email, password);
      }
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'Error al iniciar sesión'
      );
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="login-container">
      {/* Brand Section */}
      <div className="brand-section">
        <div className="brand-content">
          <div className="brand-logo">CAD</div>
          <h1 className="brand-title">Sistema de Despacho</h1>
          <p className="brand-subtitle">
            Gestión de incidentes y unidades en tiempo real
          </p>

          <div className="brand-benefits">
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <span>Seguridad empresarial</span>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <span>Operación 24/7</span>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">✓</div>
              <span>Respuesta en tiempo real</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="form-section">
        <div className="form-wrapper">
          <div className="form-header">
            <h2>Iniciar Sesión</h2>
            <p>Ingresa tus credenciales para acceder</p>
          </div>

          {(error || localError) && (
            <div className="error-message">
              {error || localError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePassword}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <span>{showPassword ? '🙈' : '👁️'}</span>
                </button>
              </div>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="remember">Recordarme en este dispositivo</label>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="forgot-password">
            <button
              type="button"
              className="link-button"
              onClick={handleForgotPassword}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <div className="divider">
            <span>¿Eres nuevo?</span>
          </div>

          <div className="signup-text">
            Registrate aquí →{' '}
            <button
              type="button"
              className="link-button signup-link"
              onClick={handleSignup}
            >
              Crear cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
