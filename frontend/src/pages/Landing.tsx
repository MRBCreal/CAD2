import { useNavigate } from 'react-router-dom';
import '../styles/Landing.css';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const Landing = () => {
  const navigate = useNavigate();

  const features: FeatureCard[] = [
    {
      id: 'incidents',
      title: 'Gestión de Incidentes',
      description: 'Crea, asigna y rastrea incidentes con toda la información en tiempo real',
      icon: '🚨'
    },
    {
      id: 'units',
      title: 'Seguimiento de Unidades',
      description: 'Monitorea la ubicación y estado de todas tus unidades móviles',
      icon: '🚗'
    },
    {
      id: 'coordination',
      title: 'Coordinación en Tiempo Real',
      description: 'Coordina operaciones complejas con información actualizada instantáneamente',
      icon: '📡'
    },
    {
      id: 'maps',
      title: 'Mapas Interactivos',
      description: 'Visualiza incidentes y unidades en mapas interactivos y geolocalización',
      icon: '🗺️'
    }
  ];

  return (
    <div className="landing">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="logo">
            <span className="logo-icon">📡</span>
            <span className="logo-text">CAD</span>
          </div>
          <ul className="nav-links">
            <li><a href="#features">Características</a></li>
            <li><a href="#about">Acerca de</a></li>
            <li><a href="#contact">Contacto</a></li>
          </ul>
          <button className="btn-login" onClick={() => navigate('/login')}>
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">CAD - Sistema de Despacho de Incidentes</h1>
          <p className="hero-subtitle">
            Gestión integral de incidentes y unidades en tiempo real para centros de seguridad ciudadana municipal
          </p>
          <div className="hero-cta">
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Iniciar Sesión
            </button>
            <button className="btn-secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Conocer Características
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-bg-pattern" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="features-container">
          <h2 className="section-title">Características Principales</h2>
          <p className="section-subtitle">Herramientas completas para la gestión eficiente de despacho</p>

          <div className="features-grid">
            {features.map((feature) => (
              <div key={feature.id} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-accent" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>¿Listo para optimizar tu despacho?</h2>
          <p>Accede al sistema ahora y comienza a gestionar tus incidentes de forma más eficiente</p>
          <button className="btn-primary btn-large" onClick={() => navigate('/login')}>
            Comenzar Ahora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>CAD Sistema de Despacho</h4>
            <p>Solución moderna para la gestión de incidentes y unidades</p>
          </div>
          <div className="footer-section">
            <h4>Enlaces</h4>
            <ul>
              <li><a href="#features">Características</a></li>
              <li><a href="#about">Documentación</a></li>
              <li><a href="#contact">Soporte</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contacto</h4>
            <p>Email: soporte@cad-seguridad.mx</p>
            <p>Teléfono: +52 (XXX) XXX-XXXX</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 CAD - Sistema de Despacho. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
