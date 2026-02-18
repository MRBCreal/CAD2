import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import './Login.css';

export default function Login() {
    const { login, error, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <div className="login-page">
            {/* Decorative blurred orbs */}
            <div className="login-orbs" aria-hidden="true">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
            </div>

            <main className="login-main">
                <div className="glass-panel">
                    {/* Header with emblem */}
                    <div className="login-header">
                        <div className="emblem">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <circle cx="12" cy="10" r="3" />
                                <path d="M12 13v3" />
                            </svg>
                        </div>
                        <h1 className="login-title">Central de Seguridad</h1>
                        <p className="login-subtitle">Iniciar sesión en el sistema CAD</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="login-form">
                        {/* Email */}
                        <div className="field">
                            <label htmlFor="email">Correo Electrónico</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="funcionario@seguridad.cl"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="field">
                            <label htmlFor="password">Contraseña</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="toggle-pw"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                >
                                    {showPassword ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="login-error" role="alert">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? (
                                <span className="btn-loading-content">
                                    <span className="spinner" />
                                    Ingresando…
                                </span>
                            ) : (
                                <span className="btn-content">
                                    Ingresar al Sistema
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-arrow">
                                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                                        <polyline points="10 17 15 12 10 7" />
                                        <line x1="15" y1="12" x2="3" y2="12" />
                                    </svg>
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="panel-footer">
                        <p>Acceso restringido únicamente a personal autorizado.</p>
                    </div>
                </div>
            </main>

            <footer className="login-footer">
                <p>Sistema CAD – Seguridad Municipal</p>
                <p className="copyright">© 2024 Todos los derechos reservados</p>
            </footer>
        </div>
    );
}
