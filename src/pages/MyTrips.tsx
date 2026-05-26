import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context';
import { tripsApi } from '../api';
import type { Trip } from '../types';
import { Icon, EmptyState, ConfirmDialog } from '../components/ui';

const tripIcons = { lazer: '🌴', negocios: '💼', aventura: '⛰️' };

export function MyTrips() {
  const { user, showToast } = useApp();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filter, setFilter] = useState<'all' | 'planeamento' | 'ativa' | 'concluida'>('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = async () => {
    if (!user) return;
    setTrips(await tripsApi.list(user.id));
  };

  useEffect(() => { load(); }, [user]);

  const filtered = filter === 'all' ? trips : trips.filter(t => t.status === filter);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await tripsApi.delete(deleteId);
      showToast('success', 'Viagem eliminada');
      await load();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26 }}>As minhas viagens</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>{trips.length} viagem(ns) no total</p>
        </div>
        <Link to="/viagens/nova" className="btn btn-primary">
          <Icon.Plus size={18}/> Nova viagem
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {([
          { key: 'all', label: 'Todas' },
          { key: 'planeamento', label: '🗓️ Planeamento' },
          { key: 'ativa', label: '✈️ Ativas' },
          { key: 'concluida', label: '✅ Concluídas' },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`btn ${filter === f.key ? 'btn-primary' : 'btn-ghost'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Icon.Plane size={48}/>}
          title="Nenhuma viagem encontrada"
          description="Comece por criar a sua primeira viagem"
          action={<Link to="/viagens/nova" className="btn btn-primary"><Icon.Plus size={16}/> Nova viagem</Link>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(t => (
            <div key={t.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontSize: 32 }}>{tripIcons[t.tipo]}</div>
                <span className={`chip ${t.status === 'ativa' ? 'chip-success' : t.status === 'concluida' ? 'chip-blue' : t.status === 'cancelada' ? 'chip-danger' : 'chip-warning'}`}>
                  {t.status}
                </span>
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>{t.nome}</h3>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 12 }}>📍 {t.destino}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, marginBottom: 14 }}>
                <div><Icon.Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }}/> {new Date(t.data_partida).toLocaleDateString('pt-PT')} → {new Date(t.data_regresso).toLocaleDateString('pt-PT')}</div>
                <div><Icon.Users size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }}/> {t.num_viajantes} viajante(s)</div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}><Icon.Dollar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }}/> {t.orcamento_total.toLocaleString('pt-PT')}€</div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                <Link to={`/viagens/${t.id}`} className="btn btn-primary" style={{ flex: 1 }}>Ver detalhes</Link>
                <button onClick={() => setDeleteId(t.id)} className="btn btn-ghost" style={{ padding: 10, color: 'var(--color-danger)' }}><Icon.Trash size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar viagem?"
        message="Todos os dados desta viagem (tarefas, despesas, documentos, mensagens) serão eliminados."
        confirmLabel="Eliminar"
        danger
      />
    </div>
  );
}
