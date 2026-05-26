import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../context';
import { Icon } from './ui';

export function Layout() {
  const { user, logout, theme, toggleTheme, unreadCount } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return <Outlet />;

  const isAdmin = user.role === 'admin';

  const navItems = isAdmin
    ? [
        { to: '/admin/dashboard', icon: <Icon.Dashboard />, label: 'Dashboard' },
        { to: '/admin/utilizadores', icon: <Icon.Users />, label: 'Utilizadores' },
        { to: '/admin/publicacoes', icon: <Icon.Megaphone />, label: 'Publicações' },
        { to: '/admin/perfil', icon: <Icon.User />, label: 'Perfil' },
      ]
    : [
        { to: '/dashboard', icon: <Icon.Dashboard />, label: 'Dashboard' },
        { to: '/viagens', icon: <Icon.Map />, label: 'Viagens' },
        { to: '/viagens/nova', icon: <Icon.Plus />, label: 'Nova viagem' },
        { to: '/seguidores', icon: <Icon.Heart />, label: 'Comunidade' },
        { to: '/perfil', icon: <Icon.User />, label: 'Perfil' },
      ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{
        width: 260,
        background: 'var(--gradient-dark)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Decorative gradient overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 300,
          background: 'radial-gradient(circle at 20% 0%, rgba(255, 103, 0, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none',
        }}/>

        {/* Brand */}
        <div style={{ padding: '24px 20px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(255, 103, 0, 0.4)',
            }}>
              <Icon.Plane size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>TripPlanner</div>
              <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {isAdmin ? 'Admin Panel' : 'Travel Suite'}
              </div>
            </div>
          </div>
        </div>

        {/* User quick card */}
        <div style={{ padding: '0 16px 16px', position: 'relative' }}>
          <div style={{
            padding: 12, borderRadius: 14,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
              boxShadow: '0 4px 10px rgba(255, 103, 0, 0.3)',
            }}>{user.avatar || user.nome.charAt(0)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.nome}</div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>{user.email}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 12px', position: 'relative' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.4, padding: '8px 12px' }}>
            Menu
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '4px 12px', display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 10,
                color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                background: isActive ? 'var(--gradient-primary)' : 'transparent',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 4px 14px rgba(255, 103, 0, 0.35)' : 'none',
                position: 'relative',
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 14px', borderRadius: 10,
              background: 'transparent', color: 'rgba(255,255,255,0.7)',
              border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.color = '#ff6b6b';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            <Icon.Logout size={18} />
            Terminar sessão
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="main-area" style={{
        flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column', minHeight: '100vh',
      }}>
        {/* Header */}
        <header className="glass" style={{
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-menu-btn"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text)', padding: 6, borderRadius: 8, display: 'none',
              }}
            >
              <Icon.Menu size={22} />
            </button>
            <div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                {isAdmin ? 'Área de administração' : 'Área pessoal'}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 1 }}>
                Olá, <span className="text-gradient-primary">{user.nome.split(' ')[0]}</span> 👋
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={toggleTheme}
              className="btn btn-ghost"
              style={{ padding: 9, borderRadius: 10 }}
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {theme === 'dark' ? <Icon.Sun size={18} /> : <Icon.Moon size={18} />}
            </button>

            {!isAdmin && (
              <NavLink
                to="/notificacoes"
                className="btn btn-ghost"
                style={{ padding: 9, borderRadius: 10, position: 'relative' }}
              >
                <Icon.Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18,
                    padding: '0 5px', background: 'var(--gradient-primary)',
                    color: 'white',
                    borderRadius: 9, fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(255, 103, 0, 0.5)',
                  }}>{unreadCount}</span>
                )}
              </NavLink>
            )}

            <div style={{ width: 1, height: 24, background: 'var(--color-border)' }}/>

            <NavLink to={isAdmin ? '/admin/perfil' : '/perfil'} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', padding: 4, paddingRight: 8, borderRadius: 999, background: 'var(--color-surface-2)' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, color: 'white',
              }}>{user.avatar || user.nome.charAt(0)}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{user.nome.split(' ')[0]}</div>
            </NavLink>
          </div>
        </header>

        <main style={{ flex: 1, padding: 28, maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="mobile-backdrop"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 99, display: 'none', backdropFilter: 'blur(4px)',
          }}
        />
      )}

      <style>{`
        @media (max-width: 900px) {
          .sidebar { transform: translateX(-100%); }
          .main-area { margin-left: 0 !important; }
          .mobile-menu-btn { display: block !important; }
          .mobile-backdrop { display: block !important; }
        }
        @media (max-width: 600px) {
          .main-area main { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}
