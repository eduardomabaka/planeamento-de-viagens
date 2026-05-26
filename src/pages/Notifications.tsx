import { useEffect, useState } from 'react';
import { useApp } from '../context';
import { notificationsApi } from '../api';
import type { Notification } from '../types';
import { Icon, EmptyState, PageHeader } from '../components/ui';

export function Notifications() {
  const { user, notifications, refreshNotifications, markNotificationRead, showToast } = useApp();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => { refreshNotifications(); }, []);

  const markAll = async () => {
    if (!user) return;
    await notificationsApi.markAllRead(user.id);
    await refreshNotifications();
    showToast('success', 'Todas as notificações marcadas como lidas');
  };

  const handleToggle = async (n: Notification) => {
    setExpanded(expanded === n.id ? null : n.id);
    if (!n.lida) {
      await markNotificationRead(n.id);
    }
  };

  const unread = notifications.filter(n => !n.lida).length;
  const filtered = notifications.filter(n =>
    filter === 'all' ? true : filter === 'unread' ? !n.lida : n.lida
  );

  const getIconConfig = (tipo: string) => {
    switch (tipo) {
      case 'convite': return { emoji: '✉️', gradient: 'linear-gradient(135deg, #3A6EA5, #06B6D4)', label: 'Convite' };
      case 'documento': return { emoji: '📄', gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)', label: 'Documento' };
      case 'publicacao': return { emoji: '📢', gradient: 'linear-gradient(135deg, #FF6700, #FF4D6D)', label: 'Publicação' };
      case 'tarefa': return { emoji: '✅', gradient: 'linear-gradient(135deg, #10B981, #059669)', label: 'Tarefa' };
      case 'despesa': return { emoji: '💰', gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)', label: 'Orçamento' };
      default: return { emoji: '🔔', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)', label: 'Notificação' };
    }
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Notificações"
        subtitle={`${unread} por ler · ${notifications.length} total`}
        action={
          unread > 0 && (
            <button onClick={markAll} className="btn btn-blue">
              <Icon.Check size={16}/> Marcar todas como lidas
            </button>
          )
        }
      />

      {/* Filters */}
      <div className="card" style={{ padding: 8, marginBottom: 20, display: 'inline-flex', gap: 4 }}>
        {([
          { key: 'all', label: 'Todas', count: notifications.length },
          { key: 'unread', label: 'Não lidas', count: unread },
          { key: 'read', label: 'Lidas', count: notifications.length - unread },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="btn"
            style={{
              background: filter === f.key ? 'var(--gradient-primary)' : 'transparent',
              color: filter === f.key ? 'white' : 'var(--color-text-muted)',
              boxShadow: filter === f.key ? 'var(--shadow-colored-primary)' : 'none',
              padding: '8px 14px',
            }}
          >
            {f.label}
            <span style={{
              padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              background: filter === f.key ? 'rgba(255,255,255,0.25)' : 'var(--color-surface-2)',
              marginLeft: 4,
            }}>{f.count}</span>
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Icon.Bell size={48}/>}
            title={filter === 'unread' ? 'Tudo em dia!' : 'Sem notificações'}
            description={filter === 'unread' ? 'Não tem notificações por ler' : 'Ainda não recebeu notificações'}
          />
        ) : (
          <div>
            {filtered.map((n, idx) => {
              const config = getIconConfig(n.tipo);
              const isExpanded = expanded === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => handleToggle(n)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '16px 20px', width: '100%',
                    border: 'none', borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer', textAlign: 'left',
                    background: !n.lida
                      ? 'linear-gradient(90deg, var(--color-primary-soft) 0%, transparent 100%)'
                      : idx % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)',
                    transition: 'all 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (n.lida) e.currentTarget.style.background = 'var(--color-surface-2)';
                  }}
                  onMouseLeave={e => {
                    if (n.lida) e.currentTarget.style.background = idx % 2 === 0 ? 'var(--color-surface)' : 'var(--color-surface-2)';
                  }}
                >
                  {/* Accent bar for unread */}
                  {!n.lida && (
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                      background: 'var(--gradient-primary)',
                    }}/>
                  )}

                  {/* Icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: config.gradient,
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, boxShadow: 'var(--shadow-sm)',
                  }}>
                    {config.emoji}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: n.lida ? 500 : 700,
                          fontSize: 14, color: 'var(--color-text)',
                          marginBottom: 2,
                        }}>
                          {n.titulo}
                        </div>
                        <div style={{
                          fontSize: 13,
                          color: n.lida ? 'var(--color-text-muted)' : 'var(--color-text-2)',
                          fontWeight: n.lida ? 400 : 500,
                          lineHeight: 1.5,
                          maxHeight: isExpanded ? 'none' : 40,
                          overflow: 'hidden',
                          transition: 'max-height 0.3s',
                        }}>
                          {n.mensagem}
                        </div>
                      </div>
                      <span className={`chip ${!n.lida ? 'chip-primary' : ''}`} style={{ fontSize: 10, padding: '3px 8px' }}>
                        {config.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--color-text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon.Clock size={12}/>
                        {new Date(n.created_at).toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {n.mensagem.length > 60 && (
                        <span style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600 }}>
                          {isExpanded ? '▲ Ver menos' : '▼ Ver mais'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!n.lida && (
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: 'var(--gradient-primary)',
                      flexShrink: 0, marginTop: 8,
                      boxShadow: '0 0 10px var(--color-primary)',
                    }}/>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Hint */}
      {notifications.length > 0 && (
        <p style={{ textAlign: 'center', color: 'var(--color-text-subtle)', fontSize: 13, marginTop: 16 }}>
          💡 Clique numa notificação para ver a mensagem completa e marcá-la como lida
        </p>
      )}
    </div>
  );
}
