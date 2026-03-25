import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/LoginModern.css';

const LoginModern = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modern">
      {/* Brand Section */}
      <div className="login-brand">
        <div className="brand-content">
          <div className="brand-icon">📡</div>
          <h1 className="brand-title">CAD - Sistema de Despacho</h1>
          <p className="brand-subtitle">
            Gestión de incidentes y unidades en tiempo real
          </p>

          <div className="brand-benefits">
            <div className="benefit-item">
              <span className="benefit-icon">🔒</span>
              <span className="benefit-text">Seguridad de nivel empresarial</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">⚡</span>
              <span className="benefit-text">Operación 24/7 sin interrupciones</span>
            </div>
          </div>

          <div className="brand-pattern" />
        </div>
      </div>

      {/* Login Form Section */}
      <div className="login-form-section">
        <div className="form-container">
          <div className="form-header">
            <h2>Iniciar Sesión</h2>
            <p>Ingresa tus credenciales para acceder al sistema</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="form">
            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Correo Electrónico o Usuario
              </label>
              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">Recordarme en este dispositivo</label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="btn-login"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="form-links">
            <a href="#" className="forgot-password-link">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Register Link */}
          <div className="form-footer">
            <span className="footer-text">¿No tienes cuenta?</span>
            <a href="/register" className="register-link">
              Registrarse
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModern;
