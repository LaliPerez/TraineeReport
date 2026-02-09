import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  LayoutDashboard, 
  LogOut, 
  Eye, 
  EyeOff
} from 'lucide-react';
import { storage } from './services/storage.ts';
import { UserRole } from './types.ts';
import AdminDashboard from './components/AdminDashboard.tsx';
import EmployeeView from './components/EmployeeView.tsx';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('guest');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(storage.getRememberMe());
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
    if (params.get('lt')) {
      setRole('employee');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin2025') {
      setRole('admin');
      storage.setRememberMe(rememberMe);
      setError('');
    } else {
      setError('Contraseña incorrecta');
    }
  };

  const handleLogout = () => {
    setRole('guest');
    setPassword('');
    window.location.hash = '';
  };

  if (role === 'admin') {
    return (
      <div className="fade-in">
        <header className="header">
          <div className="app-container flex items-center justify-between">
            <div className="flex items-center" style={{gap: '12px'}}>
              <div style={{background: 'var(--primary)', padding: '8px', borderRadius: '8px', display: 'flex'}}>
                <LayoutDashboard color="white" size={24} />
              </div>
              <h1 style={{margin: 0, fontSize: '20px', fontWeight: 800}}>Trainer<span style={{color: 'var(--primary)'}}>Pro</span></h1>
            </div>
            <button onClick={handleLogout} className="btn btn-ghost">
              <LogOut size={18} /> Salir
            </button>
          </div>
        </header>
        <main className="app-container">
          <AdminDashboard />
        </main>
      </div>
    );
  }

  if (role === 'employee') {
    return <EmployeeView onFinish={() => setRole('guest')} />;
  }

  return (
    <div className="login-screen">
      <div className="login-box card fade-in">
        <div style={{marginBottom: '32px'}}>
          <div style={{background: 'var(--primary)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'}}>
            <LayoutDashboard color="white" size={32} />
          </div>
          <h2 style={{margin: '0 0 8px', fontSize: '24px'}}>Panel de Instructor</h2>
          <p style={{color: 'var(--text-muted)', margin: 0}}>Ingresa admin2025 para acceder</p>
        </div>

        <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left'}}>
          <div>
            <label style={{fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px'}}>Contraseña</label>
            <div style={{position: 'relative'}}>
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'}}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <input 
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{accentColor: 'var(--primary)', cursor: 'pointer'}}
            />
            <label htmlFor="remember" style={{fontSize: '14px', color: 'var(--text-muted)', cursor: 'pointer'}}>Recordar contraseña</label>
          </div>

          {error && <p style={{color: 'var(--danger)', fontSize: '13px', margin: 0, textAlign: 'center'}}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
            <LogIn size={18} /> Acceder
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;