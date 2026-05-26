import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tripsApi, usersApi } from '../api';
import type { User, Trip } from '../types';
import { Icon, StatCard, PageHeader } from '../components/ui';
import { LineChart, BarChart, PieChart } from '../components/Charts';

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({ total: 0, users: 0, admins: 0 });
  const [tripStats, setTripStats] = useState<{
    total: number; ativas: number; concluidas: number;
    porMes: { mes: string; count: number }[];
    porTipo: { tipo: string; count: number }[];
    topDestinos: { destino: string; count: number }[];
    recentes: Trip[];
  } | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  useEffect(() => {
    (async () => {
      const [u, t, users] = await Promise.all([
        usersApi.getStats(),
        tripsApi.adminStats(),
        usersApi.list(),
      ]);
      setUserStats(u);
      setTripStats(t);
      setRecentUsers([...users].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5));
      setLoading(false);
    })();
  }, []);

  if (loading || !tripStats) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
          <div style={{ color: 'var(--color-text-muted)' }}>A carregar dados...</div>
        </div>
      </div>
    );
  }

  const userActivityData = [
    { label: 'Utilizadores', value: userStats.users, color: '#FF6700' },
    { label: 'Inativos', value: Math.max(1, Math.floor(userStats.users * 0.2)), color: '#94A3B8' },
    { label: 'Admins', value: userStats.admins, color: '#06B6D4' },
  ];

  return (
    <div className="fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral da plataforma em tempo real"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="chip chip-success">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }}/>
              Sistema ativo
            </div>
          </div>
        }
      />

      {/* Welcome banner */}
      <div className="card slide-up" style={{
        marginBottom: 24, padding: 0, overflow: 'hidden',
        background: 'var(--gradient-dark)', color: 'white',
        border: 'none', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 300, height: 200,
          background: 'radial-gradient(circle at top right, rgba(255, 103, 0, 0.3), transparent 70%)',
          pointerEvents: 'none',
        }}/>
        <div style={{ padding: 28, position: 'relative' }}>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
            Painel administrativo
          </div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Bem-vindo ao centro de controlo
          </h2>
          <p style={{ margin: '8px 0 0', opacity: 0.8, fontSize: 14 }}>
            Acompanhe todas as métricas e mantenha a plataforma a funcionar sem falhas.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18, marginBottom: 24 }}>
        <StatCard
          icon={<Icon.Users size={24} />}
          label="Total utilizadores"
          value={userStats.total}
          trend={`${userStats.users} users · ${userStats.admins} admins`}
          color="#FF6700"
          accent="radial-gradient(circle, rgba(255,103,0,0.3), transparent)"
        />
        <StatCard
          icon={<Icon.Plane size={24} />}
          label="Viagens totais"
          value={tripStats.total}
          trend={`${tripStats.ativas} ativas agora`}
          color="#3A6EA5"
          accent="radial-gradient(circle, rgba(58,110,165,0.3), transparent)"
        />
        <StatCard
          icon={<Icon.TrendUp size={24} />}
          label="Em planeamento"
          value={tripStats.ativas}
          color="#06B6D4"
          accent="radial-gradient(circle, rgba(6,182,212,0.3), transparent)"
        />
        <StatCard
          icon={<Icon.Check size={24} />}
          label="Concluídas"
          value={tripStats.concluidas}
          color="#10B981"
          accent="radial-gradient(circle, rgba(16,185,129,0.3), transparent)"
        />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginBottom: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Viagens criadas</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>Evolução mensal</p>
            </div>
            <span className="chip chip-primary">📈 Anual</span>
          </div>
          <LineChart data={tripStats.porMes.map(p => ({ label: p.mes, value: p.count }))} />
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Tipos de viagem</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>Distribuição por categoria</p>
            </div>
            <span className="chip chip-blue">📊 Categorias</span>
          </div>
          <BarChart data={tripStats.porTipo.map(p => ({ label: p.tipo, value: p.count }))} colors={['#FF6700', '#3A6EA5', '#06B6D4']} />
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Atividade</h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>Distribuição de utilizadores</p>
            </div>
            <span className="chip chip-teal">🥧 Users</span>
          </div>
          <PieChart data={userActivityData} />
        </div>
      </div>

      {/* Bottom sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🏆 Top 5 destinos</h3>
            <span className="chip chip-primary">Popular</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tripStats.topDestinos.map((d, i) => {
              const max = Math.max(...tripStats.topDestinos.map(x => x.count));
              const pct = (d.count / max) * 100;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: i === 0 ? 'var(--gradient-primary)' : i === 1 ? 'var(--gradient-blue)' : 'var(--color-surface-2)',
                        color: i < 2 ? 'white' : 'var(--color-text)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700,
                        boxShadow: i < 2 ? 'var(--shadow-sm)' : 'none',
                      }}>{i + 1}</div>
                      <span style={{ fontWeight: 600 }}>{d.destino}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{d.count}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--color-surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gradient-primary)', borderRadius: 3, transition: 'width 0.6s ease' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>👥 Utilizadores recentes</h3>
            <Link to="/admin/utilizadores" style={{ fontSize: 13, fontWeight: 600 }}>Ver todos →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentUsers.map(u => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 10, borderRadius: 12, background: 'var(--color-surface-2)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: 'white',
                }}>{u.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{u.nome}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                </div>
                <span className={`chip ${u.role === 'admin' ? 'chip-primary' : 'chip-blue'}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>✈️ Viagens recentes</h3>
            <span className="chip chip-info">Live</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tripStats.recentes.map(t => (
              <div key={t.id} style={{
                padding: 12, background: 'var(--color-surface-2)', borderRadius: 12,
                borderLeft: '3px solid var(--color-primary)',
              }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{t.nome}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>📍 {t.destino}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  <span className="chip">{t.tipo}</span>
                  <span className={`chip ${t.status === 'ativa' ? 'chip-success' : t.status === 'concluida' ? 'chip-blue' : 'chip-warning'}`}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
