import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context';
import { tripsApi, tasksApi, documentsApi } from '../api';
import type { Trip, TripTask, TripDocument } from '../types';
import { Icon, StatCard, EmptyState, PageHeader } from '../components/ui';
import { formatAOAFull, formatarOrcamento } from '../utils/currency';

export function UserDashboard() {
  const { user, unreadCount } = useApp();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tasks, setTasks] = useState<TripTask[]>([]);
  const [docs, setDocs] = useState<TripDocument[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const t = await tripsApi.list(user.id);
      setTrips(t);
      const active = t.filter(x => x.status === 'planeamento' || x.status === 'ativa');
      const allTasks: TripTask[] = [];
      const allDocs: TripDocument[] = [];
      for (const trip of active) {
        allTasks.push(...await tasksApi.listByTrip(trip.id));
        allDocs.push(...await documentsApi.listByTrip(trip.id));
      }
      setTasks(allTasks);
      setDocs(allDocs);
    })();
  }, [user]);

  const planeadas = trips.filter(t => t.status === 'planeamento').length;
  const nextTrip = trips
    .filter(t => new Date(t.data_partida) >= new Date())
    .sort((a, b) => a.data_partida.localeCompare(b.data_partida))[0];
  const totalBudget = trips.reduce((s, t) => s + t.orcamento_total, 0);
  const pendingTasks = tasks.filter(t => t.status === 'pendente');
  const pendingDocs = docs.filter(d => d.status === 'pendente');

  const daysUntil = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Olá, vamos planear?"
        subtitle="Visão geral das suas viagens, tarefas e documentos"
        action={
          <Link to="/viagens/nova" className="btn btn-primary">
            <Icon.Plus size={16}/> Nova viagem
          </Link>
        }
      />

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 24 }}>
        <StatCard icon={<Icon.Plane size={24}/>} label="Viagens planeadas" value={planeadas} color="#FF6700" accent="radial-gradient(circle, rgba(255,103,0,0.3), transparent)"/>
        <StatCard
          icon={<Icon.Dollar size={24}/>}
          label="Orçamento total"
          value={<span title={formatAOAFull(totalBudget)}>{formatarOrcamento(totalBudget)}</span>}
          color="#3A6EA5"
          accent="radial-gradient(circle, rgba(58,110,165,0.3), transparent)"
        />
        <StatCard icon={<Icon.List size={24}/>} label="Tarefas pendentes" value={pendingTasks.length} color="#06B6D4" accent="radial-gradient(circle, rgba(6,182,212,0.3), transparent)"/>
        <StatCard icon={<Icon.File size={24}/>} label="Docs por tratar" value={pendingDocs.length} color="#F59E0B" accent="radial-gradient(circle, rgba(245,158,11,0.3), transparent)"/>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
        {/* Próxima viagem — hero card */}
        <div className="card slide-up" style={{
          padding: 0, overflow: 'hidden',
          background: 'var(--gradient-sunset)', color: 'white',
          border: 'none', position: 'relative', minHeight: 280,
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 200, height: 200, borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            pointerEvents: 'none',
          }}/>
          <div style={{
            position: 'absolute', bottom: -20, left: '40%',
            width: 150, height: 150, borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            pointerEvents: 'none',
          }}/>

          <div style={{ padding: 28, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, opacity: 0.95 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon.Calendar size={16}/>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Próxima viagem
              </span>
            </div>

            {nextTrip ? (
              <>
                <h2 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>{nextTrip.nome}</h2>
                <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 20 }}>📍 {nextTrip.destino}</div>

                <div style={{
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(20px)',
                  padding: 24, borderRadius: 16,
                  textAlign: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  marginTop: 'auto',
                }}>
                  <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.04em' }}>{daysUntil(nextTrip.data_partida)}</div>
                  <div style={{ fontSize: 13, opacity: 0.9, marginTop: 6, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
                    dias até à partida
                  </div>
                </div>

                <Link to={`/viagens/${nextTrip.id}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  marginTop: 16, padding: '10px 18px',
                  background: 'white', color: '#C71F73',
                  borderRadius: 10, fontWeight: 700, fontSize: 13,
                  textDecoration: 'none', width: 'fit-content',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                }}>
                  Ver detalhes <span>→</span>
                </Link>
              </>
            ) : (
              <div style={{ marginTop: 'auto' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🌍</div>
                <p style={{ opacity: 0.9, margin: '0 0 16px' }}>Nenhuma viagem planeada</p>
                <Link to="/viagens/nova" style={{
                  display: 'inline-block', padding: '10px 18px',
                  background: 'white', color: '#C71F73',
                  borderRadius: 10, fontWeight: 700, fontSize: 13,
                  textDecoration: 'none',
                }}>
                  Criar primeira viagem →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Tarefas pendentes */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>✅ Tarefas pendentes</h3>
            <span className="chip chip-warning">{pendingTasks.length}</span>
          </div>
          {pendingTasks.length === 0 ? (
            <EmptyState icon={<Icon.Check size={40}/>} title="Tudo em dia!" description="Sem tarefas pendentes"/>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pendingTasks.slice(0, 5).map(t => (
                <div key={t.id} style={{
                  padding: 12, background: 'var(--color-surface-2)',
                  borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
                  borderLeft: '3px solid var(--color-primary)',
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gradient-primary)', flexShrink: 0 }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.titulo}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      📅 Prazo: {new Date(t.data_limite).toLocaleDateString('pt-PT')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documentos por tratar */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>📄 Documentos</h3>
            <span className="chip chip-danger">{pendingDocs.length}</span>
          </div>
          {pendingDocs.length === 0 ? (
            <EmptyState icon={<Icon.File size={40}/>} title="Tudo tratado!" description="Sem documentos pendentes"/>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pendingDocs.map(d => (
                <div key={d.id} style={{
                  padding: 12, background: 'var(--color-surface-2)',
                  borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(245, 158, 11, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-warning)',
                  }}>
                    <Icon.File size={16}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{d.nome}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{d.tipo}</div>
                  </div>
                  <span className="chip chip-warning">Pendente</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notificações */}
        <div className="card" style={{
          background: 'var(--gradient-ocean)', color: 'white',
          border: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, opacity: 0.95 }}>
            <Icon.Bell size={18}/>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Notificações</h3>
          </div>
          {unreadCount === 0 ? (
            <div style={{ textAlign: 'center', padding: 20, opacity: 0.9 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🔔</div>
              <p style={{ margin: 0 }}>Sem novas notificações</p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em' }}>{unreadCount}</div>
              <p style={{ opacity: 0.9, margin: '4px 0 16px' }}>
                notificaç{unreadCount === 1 ? 'ão' : 'ões'} por ler
              </p>
              <Link to="/notificacoes" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', background: 'white', color: '#3A6EA5',
                borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none',
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              }}>
                Ver notificações <span>→</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
