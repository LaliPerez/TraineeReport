
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { 
  LogIn, LayoutDashboard, LogOut, Eye, EyeOff 
} from 'lucide-react';
import { storage } from './services/storage.js';
import AdminDashboard from './components/AdminDashboard.js';
import EmployeeView from './components/EmployeeView.js';

const html = htm.bind(React.createElement);

const App = () => {
  const [role, setRole] = useState('guest');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(storage.getRememberMe());
  const [error, setError] = useState('');

  useEffect(() => {
    // Restaurar sesión si "recordar" estaba activo y hay una sesión guardada
    if (storage.getRememberMe() && storage.getAdminSession()) {
      setRole('admin');
    }

    const handleNavigation = () => {
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
      const ltId = searchParams.get('lt');
      
      if (ltId) {
        setRole('employee');
      } else if (role === 'employee' && !ltId) {
        setRole('guest');
      }
    };

    window.addEventListener('hashchange', handleNavigation);
    handleNavigation();
    
    return () => window.removeEventListener('hashchange', handleNavigation);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin2025') {
      setRole('admin');
      storage.setRememberMe(rememberMe);
      storage.setAdminSession(true);
      setError('');
    } else {
      setError('Credenciales inválidas');
    }
  };

  const handleLogout = () => {
    setRole('guest');
    setPassword('');
    storage.setAdminSession(false);
    window.location.hash = '';
  };

  if (role === 'admin') {
    return html`
      <div className="fade-in">
        <header className="header">
          <div className="app-container flex items-center justify-between">
            <div className="flex items-center" style=${{gap: '12px'}}>
              <div style=${{background: 'var(--primary)', padding: '8px', borderRadius: '8px', display: 'flex'}}>
                <${LayoutDashboard} color="white" size=${24} />
              </div>
              <h1 style=${{margin: 0, fontSize: '20px', fontWeight: 800}}>Trainer<span style=${{color: 'var(--primary)'}}>Pro</span></h1>
            </div>
            <button onClick=${handleLogout} className="btn btn-ghost">
              <${LogOut} size=${18} /> Salir
            </button>
          </div>
        </header>
        <main className="app-container">
          <${AdminDashboard} />
        </main>
      </div>
    `;
  }

  if (role === 'employee') {
    return html`<${EmployeeView} onFinish=${() => { setRole('guest'); window.location.hash = ''; }} />`;
  }

  return html`
    <div className="login-screen">
      <div className="login-box card fade-in">
        <div style=${{marginBottom: '32px'}}>
          <div style=${{background: 'var(--primary)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'}}>
            <${LayoutDashboard} color="white" size=${32} />
          </div>
          <h2 style=${{margin: '0 0 8px', fontSize: '24px'}}>Acceso Instructor</h2>
          <p style=${{color: 'var(--text-muted)', margin: 0}}>Inicie sesión para gestionar capacitaciones</p>
        </div>

        <form onSubmit=${handleLogin} style=${{display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left'}}>
          <div>
            <label style=${{fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px'}}>Contraseña</label>
            <div style=${{position: 'relative'}}>
              <input 
                type=${showPassword ? "text" : "password"}
                value=${password}
                onChange=${(e) => setPassword(e.target.value)}
                className="input"
                placeholder="Introduzca su clave"
                autoComplete="current-password"
              />
              <button 
                type="button"
                onClick=${() => setShowPassword(!showPassword)}
                style=${{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'}}
              >
                <${showPassword ? EyeOff : Eye} size=${18} />
              </button>
            </div>
          </div>

          <div style=${{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <input 
              type="checkbox"
              id="remember"
              checked=${rememberMe}
              onChange=${(e) => setRememberMe(e.target.checked)}
              style=${{accentColor: 'var(--primary)', cursor: 'pointer'}}
            />
            <label htmlFor="remember" style=${{fontSize: '14px', color: 'var(--text-muted)', cursor: 'pointer'}}>Recordar sesión activa</label>
          </div>

          ${error && html`<p style=${{color: 'var(--danger)', fontSize: '13px', margin: 0, textAlign: 'center'}}>${error}</p>`}

          <button type="submit" className="btn btn-primary" style=${{width: '100%', padding: '14px'}}>
            <${LogIn} size=${18} /> Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  `;
};

export default App;
