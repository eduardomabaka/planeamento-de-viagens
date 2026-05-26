import { useEffect, useState } from 'react';
import { usersApi, tripsApi } from '../api';
import type { User, Trip } from '../types';
import { useApp } from '../context';
import { Icon, ConfirmDialog, EmptyState } from '../components/ui';

type Filter = 'all' | 'users';

export function AdminUsers() {
  const { user: currentUser, showToast } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const perPage = 8;

  useEffect(() => {
    (async () => {
      setUsers(await usersApi.list());
      setTrips(await tripsApi.list());
    })();
  }, []);

  const userCounts = { all: users.length, users: users.filter(u => u.role === 'user').length };
  const tripCountFor = (userId: number) => trips.filter(t => t.user_id === userId).length;

  const filtered = users
    .filter(u => filter === 'all' || u.role === 'user')
    .filter(u => !search || u.nome.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  const handleDelete = async () => {
    if (!deleteId) return;
    if (deleteId === currentUser?.id) {
      showToast('error', 'Não é possível eliminar a própria conta');
      return;
    }
    try {
      await usersApi.delete(deleteId);
      showToast('success', 'Utilizador eliminado com sucesso');
      setUsers(await usersApi.list());
      setTrips(await tripsApi.list());
    } catch (err: any) {
      showToast('error', err.message || 'Erro ao eliminar');
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26 }}>Utilizadores</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>Gerir utilizadores da plataforma</p>
      </div>

      {/* Category cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {([
          { key: 'all', label: 'Todos', icon: '👥', count: userCounts.all },
          { key: 'users', label: 'Users', icon: '🙋', count: userCounts.users },
        ] as const).map(cat => (
          <button
            key={cat.key}
            onClick={() => { setFilter(cat.key); setPage(1); }}
            className="card"
            style={{
              cursor: 'pointer', textAlign: 'left', border: filter === cat.key ? '2px solid var(--color-primary)' : undefined,
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{cat.icon}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{cat.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{cat.count}</div>
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ position: 'relative' }}>
            <Icon.Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' } as any}/>
            <input
              className="input"
              placeholder="Pesquisar por nome ou email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: 40 }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead style={{ background: 'var(--color-bg)' }}>
              <tr>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Nome</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Registo</th>
                <th style={{ padding: 12, textAlign: 'center', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Viagens</th>
                <th style={{ padding: 12, textAlign: 'right', fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(u => (
                <tr key={u.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>#{u.id}</td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{u.avatar}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{u.nome}</div>
                        <span className={`chip ${u.role === 'admin' ? 'chip-primary' : 'chip-blue'}`} style={{ marginTop: 2 }}>{u.role}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 12, fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>{new Date(u.created_at).toLocaleDateString('pt-PT')}</td>
                  <td style={{ padding: 12, textAlign: 'center' }}><span className="chip chip-blue">{tripCountFor(u.id)}</span></td>
                  <td style={{ padding: 12, textAlign: 'right' }}>
                    {u.id !== currentUser?.id && u.role !== 'admin' && (
                      <button onClick={() => setDeleteId(u.id)} className="btn btn-ghost" style={{ padding: 6, color: 'var(--color-danger)' }}>
                        <Icon.Trash size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState icon={<Icon.Users size={40}/>} title="Sem utilizadores" />}
        </div>

        {totalPages > 1 && (
          <div style={{ padding: 12, borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
            <span style={{ padding: '8px 12px', fontSize: 13 }}>Página {page} de {totalPages}</span>
            <button className="btn btn-ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Seguinte →</button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar utilizador?"
        message="Esta ação eliminará o utilizador e todos os dados relacionados (viagens, mensagens, despesas). Não pode ser revertida."
        confirmLabel="Sim, eliminar"
        danger
      />
    </div>
  );
}
