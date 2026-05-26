import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { Icon } from '../components/ui';

export function Login() {
  const { login, showToast, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('error', 'Preencha todos os campos');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      showToast('success', `Bem-vindo de volta, ${user.nome.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err: any) {
      showToast('error', err.message || 'Falha no login');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email: string, pw: string) => {
    setEmail(email); setPassword(pw);
  };

  return (
    <AuthShell theme={theme} toggleTheme={toggleTheme} showHero>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--gradient-primary)',
          marginBottom: 16,
          boxShadow: '0 10px 30px rgba(255, 103, 0, 0.35)',
        }}>
          <Icon.Plane size={28}/>
        </div>
        <h1 style={{ fontSize: 28, marginBottom: 6, letterSpacing: '-0.03em' }}>Bem-vindo de volta</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Entre na sua conta para continuar</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: 13, fontSize: 15 }}>
          {loading ? 'A entrar...' : 'Entrar'}
        </button>
      </form>

      <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14 }}>
        Não tem conta? <Link to="/register" style={{ fontWeight: 700 }}>Registe-se aqui</Link>
      </p>

      <div className="divider"/>

      <div style={{ padding: 14, background: 'var(--color-surface-2)', borderRadius: 14, fontSize: 13 }}>
        <div style={{ fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon.Sparkles size={14}/> Contas de demonstração
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button type="button" onClick={() => quickLogin('admin@tripplanner.com', 'admin123')} style={{ textAlign: 'left', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}>
            <span style={{ fontSize: 18 }}>👑</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>Admin</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>admin@tripplanner.com</div>
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>admin123</span>
          </button>
          <button type="button" onClick={() => quickLogin('ana@demo.com', 'demo123')} style={{ textAlign: 'left', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>👩</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>Utilizador</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>ana@demo.com</div>
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>demo123</span>
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

export function Register() {
  const { register, showToast, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !password) {
      showToast('error', 'Preencha todos os campos');
      return;
    }
    if (password !== confirm) {
      showToast('error', 'As passwords não coincidem');
      return;
    }
    if (password.length < 6) {
      showToast('error', 'A password deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const user = await register(nome, email, password);
      showToast('success', `Conta criada, ${user.nome.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao registar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell theme={theme} toggleTheme={toggleTheme}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--gradient-primary)',
          marginBottom: 16,
          boxShadow: '0 10px 30px rgba(255, 103, 0, 0.35)',
        }}>
          <Icon.Compass size={28}/>
        </div>
        <h1 style={{ fontSize: 28, marginBottom: 6, letterSpacing: '-0.03em' }}>Criar conta</h1>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Comece a planear as suas aventuras</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <label className="label">Nome completo</label>
          <input className="input" value={nome} onChange={e => setNome(e.target.value)} placeholder="João Silva" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 caracteres" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label className="label">Confirmar password</label>
          <input className="input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repetir password" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: 13, fontSize: 15 }}>
          {loading ? 'A criar conta...' : 'Criar conta'}
        </button>
      </form>

      <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14 }}>
        Já tem conta? <Link to="/login" style={{ fontWeight: 700 }}>Entrar</Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({ children, theme, toggleTheme, showHero = false }: { children: React.ReactNode; theme: string; toggleTheme: () => void; showHero?: boolean }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--color-bg)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Theme toggle */}
      <button onClick={toggleTheme} style={{
        position: 'fixed', top: 20, right: 20,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        width: 44, height: 44, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10, boxShadow: 'var(--shadow-md)',
        color: 'var(--color-text)',
      }}>
        {theme === 'dark' ? <Icon.Sun size={18} /> : <Icon.Moon size={18} />}
      </button>

      {/* Hero side (decorative) */}
      {showHero && (
        <div className="auth-hero" style={{
          flex: 1, position: 'relative',
          background: 'var(--gradient-dark)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {/* Animated blobs */}
          <div style={{
            position: 'absolute', top: '10%', left: '10%',
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 103, 0, 0.3), transparent 70%)',
            filter: 'blur(60px)',
          }}/>
          <div style={{
            position: 'absolute', bottom: '10%', right: '10%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25), transparent 70%)',
            filter: 'blur(80px)',
          }}/>

          <div style={{ position: 'relative', color: 'white', padding: 60, maxWidth: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon.Plane size={22}/>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>TripPlanner</div>
            </div>
            <h2 style={{ fontSize: 42, fontWeight: 800, margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              Planeie viagens <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>inesquecíveis</span>
            </h2>
            <p style={{ fontSize: 17, opacity: 0.85, lineHeight: 1.6, margin: 0 }}>
              A sua plataforma completa para planear, colaborar e recordar as melhores aventuras. Organize itinerários, divida despesas e guarde memórias — tudo num só lugar.
            </p>

            <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
              {[
                { icon: '🗺️', label: 'Destinos' },
                { icon: '👥', label: 'Colaborativo' },
                { icon: '💰', label: 'Orçamentos' },
                { icon: '📖', label: 'Diário' },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '12px 18px', borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form side */}
      <div style={{
        flex: showHero ? '0 0 500px' : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 32, minHeight: '100vh',
      }}>
        <div className="card card-elevated slide-up" style={{ width: '100%', maxWidth: 440, padding: 32 }}>
          {children}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-hero { display: none !important; }
        }
      `}</style>
    </div>
  );
}
