import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import {
  tripsApi, membersApi, tasksApi, expensesApi, documentsApi,
  votesApi, messagesApi, followsApi,
  exportToCSV, exportDiaryToHTML, diaryApi
} from '../api';
import type { Trip, TripMember, TripTask, TripExpense, TripDocument, TripVote, Message, User, DiaryEntry } from '../types';
import { Icon, Modal, ConfirmDialog } from '../components/ui';
import { APP_CURRENCY_CODE, APP_CURRENCY_SYMBOL, formatAOA, formatAOACompact } from '../utils/currency';

type Tab = 'overview' | 'members' | 'chat' | 'tasks' | 'expenses' | 'documents' | 'votes' | 'diary';

export function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, showToast } = useApp();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [members, setMembers] = useState<(TripMember & { user?: User })[]>([]);
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const t = await tripsApi.get(Number(id));
      if (!t) { showToast('error', 'Viagem não encontrada'); navigate('/viagens'); return; }
      setTrip(t);
      setMembers(await membersApi.listByTrip(t.id));
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleDelete = async () => {
    if (!trip) return;
    try {
      await tripsApi.delete(trip.id);
      showToast('success', 'Viagem eliminada');
      navigate('/viagens');
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const isMember = members.some(m => m.user_id === user?.id);

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>A carregar...</div>;
  if (!trip) return null;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Visão geral', icon: <Icon.Dashboard size={16}/> },
    { key: 'members', label: 'Membros', icon: <Icon.Users size={16}/> },
    { key: 'chat', label: 'Chat', icon: <Icon.Chat size={16}/> },
    { key: 'tasks', label: 'Tarefas', icon: <Icon.List size={16}/> },
    { key: 'expenses', label: 'Despesas', icon: <Icon.Dollar size={16}/> },
    { key: 'documents', label: 'Documentos', icon: <Icon.File size={16}/> },
    { key: 'votes', label: 'Votações', icon: <Icon.Vote size={16}/> },
    { key: 'diary', label: 'Diário', icon: <Icon.Book size={16}/> },
  ];

  return (
    <div className="fade-in">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: 16, padding: 8 }}>
        ← Voltar
      </button>

      {/* Header hero */}
      <div className="card card-elevated" style={{
        marginBottom: 20, padding: 0, overflow: 'hidden',
        background: 'var(--gradient-dark)', color: 'white',
        border: 'none', position: 'relative',
      }}>
        {/* Decorative */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 250, height: 250, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 103, 0, 0.3), transparent 70%)',
          pointerEvents: 'none',
        }}/>
        <div style={{
          position: 'absolute', bottom: -40, left: '30%',
          width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25), transparent 70%)',
          pointerEvents: 'none',
        }}/>

        <div style={{ padding: 28, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 10px', background: 'var(--gradient-primary)', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {trip.tipo}
                </span>
                <span style={{ padding: '4px 10px', background: trip.status === 'ativa' ? 'rgba(16, 185, 129, 0.3)' : trip.status === 'concluida' ? 'rgba(58, 110, 165, 0.3)' : 'rgba(245, 158, 11, 0.3)', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {trip.status}
                </span>
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>{trip.nome}</h1>
              <div style={{ opacity: 0.9, fontSize: 15, marginBottom: 12 }}>📍 {trip.destino}</div>
              <div style={{ display: 'flex', gap: 16, fontSize: 13, flexWrap: 'wrap', opacity: 0.85 }}>
                <span>📅 {new Date(trip.data_partida).toLocaleDateString('pt-PT')} → {new Date(trip.data_regresso).toLocaleDateString('pt-PT')}</span>
                <span>👥 {members.length} membro(s)</span>
                <span>💰 {formatAOA(trip.orcamento_total)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn"
                onClick={async () => {
                  const csv = exportToCSV(trip, await tasksApi.listByTrip(trip.id), await expensesApi.listByTrip(trip.id), await documentsApi.listByTrip(trip.id), await votesApi.listByTrip(trip.id), members);
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = `relatorio-${trip.nome}.csv`; a.click();
                  showToast('success', 'Relatório CSV exportado');
                }}
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <Icon.Download size={16}/> CSV
              </button>
              <button onClick={() => setDeleteOpen(true)} className="btn" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ff6b6b', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <Icon.Trash size={16}/>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding: 6, marginBottom: 20, display: 'flex', gap: 4, overflowX: 'auto' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="btn"
            style={{
              background: tab === t.key ? 'var(--gradient-primary)' : 'transparent',
              color: tab === t.key ? 'white' : 'var(--color-text-muted)',
              borderRadius: 10, padding: '10px 14px', whiteSpace: 'nowrap',
              fontWeight: tab === t.key ? 700 : 500,
              boxShadow: tab === t.key ? 'var(--shadow-colored-primary)' : 'none',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {!isMember ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p>Não é membro desta viagem</p>
        </div>
      ) : (
        <>
          {tab === 'overview' && <OverviewTab trip={trip} members={members}/>}
          {tab === 'members' && <MembersTab tripId={trip.id} members={members} onReload={load}/>}
          {tab === 'chat' && <ChatTab tripId={trip.id} members={members}/>}
          {tab === 'tasks' && <TasksTab tripId={trip.id} members={members}/>}
          {tab === 'expenses' && <ExpensesTab trip={trip} onTripUpdated={setTrip}/>}
          {tab === 'documents' && <DocumentsTab tripId={trip.id}/>}
          {tab === 'votes' && <VotesTab tripId={trip.id} members={members}/>}
          {tab === 'diary' && <DiaryTab trip={trip}/>}
        </>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar viagem?"
        message={`A viagem "${trip.nome}" e todos os seus dados serão eliminados permanentemente.`}
        confirmLabel="Eliminar"
        danger
      />
    </div>
  );
}

// ===== OVERVIEW TAB =====
function OverviewTab({ trip, members }: { trip: Trip; members: TripMember[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
      {/* Orçamento card */}
      <div className="card" style={{
        background: 'var(--gradient-primary)', color: 'white', border: 'none',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 140, height: 140,
          borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none',
        }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, opacity: 0.95 }}>
          <Icon.Dollar size={18}/>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Orçamento</span>
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em' }}>{formatAOACompact(trip.orcamento_total)}</div>
        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>Para {trip.num_viajantes} viajante(s)</div>
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.15)', borderRadius: 8, fontSize: 13, backdropFilter: 'blur(10px)' }}>
          ≈ {formatAOACompact(trip.orcamento_total / Math.max(trip.num_viajantes, 1))} por pessoa
        </div>
      </div>

      {/* Membros */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Icon.Users size={16}/>
          </div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Membros ({members.length})</h3>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {members.map(m => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', background: 'var(--color-surface-2)',
              borderRadius: 999,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: 'white',
              }}>{m.user?.avatar}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.user?.nome}</div>
              {m.role === 'criador' && <span style={{ fontSize: 10, padding: '2px 6px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', borderRadius: 6, fontWeight: 700 }}>CRIADOR</span>}
            </div>
          ))}
        </div>
      </div>

      {trip.destino_info && (
        <>
          {trip.destino_info.clima && <div className="card" style={{ background: 'var(--gradient-ocean)', color: 'white', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, opacity: 0.95 }}>
              <span style={{ fontSize: 28 }}>{trip.destino_info.clima.icon || '☁️'}</span>
              <div>
                <div style={{ fontSize: 12, opacity: 0.9, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700 }}>Clima previsto</div>
                <div style={{ fontSize: 13 }}>{trip.destino_info.clima.descricao}</div>
              </div>
            </div>
            <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em' }}>{trip.destino_info.clima.temp}°C</div>
          </div>}

          {!!trip.destino_info.atracoes?.length && <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🏛️
              </div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Atrações</h3>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {trip.destino_info.atracoes.map((a, i) => <span key={i} className="chip chip-blue">{a}</span>)}
            </div>
          </div>}

          {!!trip.destino_info.vacinas?.length && <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                💉
              </div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Vacinas</h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.8 }}>
              {trip.destino_info.vacinas.map((v, i) => <li key={i}>{v}</li>)}
            </ul>
          </div>}
        </>
      )}
    </div>
  );
}

// ===== MEMBERS TAB =====
function MembersTab({ tripId, members, onReload }: { tripId: number; members: (TripMember & { user?: User })[]; onReload: () => void }) {
  const { user, showToast } = useApp();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeUserId, setRemoveUserId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const openInvite = async () => {
    setInviteOpen(true);
    if (!user) return;
    const following = await followsApi.getFollowing(user.id);
    const mutual = [];
    for (const u of following) {
      if (await followsApi.isMutual(user.id, u.id)) mutual.push(u);
    }
    const memberIds = members.map(m => m.user_id);
    setCandidates(mutual.filter(u => !memberIds.includes(u.id)));
  };

  const handleInvite = async (userId: number) => {
    setLoading(true);
    try {
      await membersApi.invite(tripId, userId);
      showToast('success', 'Convite enviado');
      await onReload();
      setInviteOpen(false);
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!removeUserId) return;
    try {
      await membersApi.remove(tripId, removeUserId);
      showToast('success', 'Membro removido');
      await onReload();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const filteredCandidates = candidates.filter(u => !search || u.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Membros da viagem</h3>
        <button className="btn btn-primary" onClick={openInvite}><Icon.Plus size={16}/> Convidar</button>
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: '0 0 14px' }}>
        💡 Só pode convidar utilizadores com quem tem seguimento mútuo.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {members.map(m => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--color-bg)', borderRadius: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{m.user?.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{m.user?.nome}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{m.user?.email}</div>
            </div>
            <span className={`chip ${m.role === 'criador' ? 'chip-primary' : 'chip-blue'}`}>{m.role}</span>
            {m.role !== 'criador' && user?.id !== m.user_id && (
              <button onClick={() => setRemoveUserId(m.user_id!)} className="btn btn-ghost" style={{ padding: 6, color: 'var(--color-danger)' }}>
                <Icon.X size={16}/>
              </button>
            )}
          </div>
        ))}
      </div>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Convidar viajante">
        <input className="input" placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 14 }}/>
        {filteredCandidates.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 20 }}>
            {candidates.length === 0 ? 'Não tem seguidores mútuos para convidar. Siga e seja seguido por alguém primeiro.' : 'Sem resultados'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredCandidates.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, background: 'var(--color-bg)', borderRadius: 8 }}>
                <div style={{ fontSize: 24 }}>{u.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{u.nome}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{u.email}</div>
                </div>
                <button className="btn btn-primary" onClick={() => handleInvite(u.id)} disabled={loading}>Convidar</button>
              </div>
            ))}
          </div>
        )}
      </Modal>
      <ConfirmDialog
        open={removeUserId !== null}
        onClose={() => setRemoveUserId(null)}
        onConfirm={handleRemove}
        title="Remover membro"
        message="Tens a certeza que queres remover este membro da viagem?"
        confirmLabel="Remover"
        danger
      />
    </div>
  );
}

// ===== CHAT TAB =====
function ChatTab({ tripId, members }: { tripId: number; members: (TripMember & { user?: User })[] }) {
  const { user, showToast } = useApp();
  const [messages, setMessages] = useState<(Message & { user?: User })[]>([]);
  const [text, setText] = useState('');
  const chatEnabled = members.filter(m => m.accepted).length > 1;

  const load = async () => setMessages(await messagesApi.listByTrip(tripId));
  useEffect(() => {
    if (!chatEnabled) return;
    load();
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, [tripId, chatEnabled]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatEnabled) return;
    if (!text.trim() || !user) return;
    try {
      await messagesApi.send(tripId, user.id, text);
      setText('');
      showToast('success', 'Mensagem enviada');
      await load();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  if (!chatEnabled) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <Icon.Chat size={26}/>
        </div>
        <h3 style={{ margin: 0, fontSize: 18 }}>Chat indisponível</h3>
        <p style={{ margin: '8px 0 0', color: 'var(--color-text-muted)' }}>Convida pelo menos um viajante para activar o chat do grupo</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 600, padding: 0 }}>
      <div style={{ padding: 14, borderBottom: '1px solid var(--color-border)' }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>💬 Chat do grupo</h3>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map(m => {
          const mine = m.user_id === user?.id;
          return (
            <div key={m.id} style={{ display: 'flex', gap: 8, justifyContent: mine ? 'flex-end' : 'flex-start' }}>
              {!mine && <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{m.user?.avatar}</div>}
              <div style={{ maxWidth: '70%' }}>
                {!mine && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>{m.user?.nome}</div>}
                <div style={{
                  padding: '8px 12px', borderRadius: 12,
                  background: mine ? '#FF6700' : 'var(--color-bg)',
                  color: mine ? 'white' : 'var(--color-text)',
                }}>{m.mensagem}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2, textAlign: mine ? 'right' : 'left' }}>
                  {new Date(m.created_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={send} style={{ padding: 12, borderTop: '1px solid var(--color-border)', display: 'flex', gap: 8 }}>
        <input className="input" value={text} onChange={e => setText(e.target.value)} placeholder="Escreva uma mensagem..." style={{ flex: 1 }} disabled={!chatEnabled}/>
        <button type="submit" className="btn btn-primary" disabled={!chatEnabled}><Icon.Send size={16}/></button>
      </form>
    </div>
  );
}

// ===== TASKS TAB =====
function TasksTab({ tripId, members }: { tripId: number; members: (TripMember & { user?: User })[] }) {
  const { user, showToast } = useApp();
  const [tasks, setTasks] = useState<(TripTask & { responsavel?: User })[]>([]);
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [responsavel, setResponsavel] = useState(user?.id || 0);
  const [dataLimite, setDataLimite] = useState('');
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);

  const load = async () => setTasks(await tasksApi.listByTrip(tripId));
  useEffect(() => { load(); }, [tripId]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !dataLimite) { showToast('error', 'Preencha os campos obrigatórios'); return; }
    try {
      await tasksApi.create({ trip_id: tripId, titulo, descricao, status: 'pendente', responsavel_id: responsavel, data_limite: dataLimite });
      showToast('success', 'Tarefa criada');
      setTitulo(''); setDescricao(''); setDataLimite(''); setOpen(false);
      await load();
    } catch (err: any) { showToast('error', err.message); }
  };

  const toggleStatus = async (t: TripTask) => {
    try {
      const next = t.status === 'pendente' ? 'em_progresso' : t.status === 'em_progresso' ? 'concluida' : 'pendente';
      await tasksApi.update(t.id, { status: next });
      showToast('success', 'Estado da tarefa atualizado');
      await load();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const remove = async () => {
    if (!deleteTaskId) return;
    try {
      await tasksApi.delete(deleteTaskId);
      showToast('success', 'Tarefa eliminada');
      await load();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const statusColor = { pendente: 'chip-warning', em_progresso: 'chip-blue', concluida: 'chip-success' };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>📋 Tarefas ({tasks.length})</h3>
        <button className="btn btn-primary" onClick={() => setOpen(true)}><Icon.Plus size={16}/> Nova</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map(t => (
          <div key={t.id} style={{ padding: 12, background: 'var(--color-bg)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => toggleStatus(t)} style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid var(--color-border)', background: t.status === 'concluida' ? '#16a34a' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              {t.status === 'concluida' && <Icon.Check size={14}/>}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, textDecoration: t.status === 'concluida' ? 'line-through' : 'none' }}>{t.titulo}</div>
              {t.descricao && <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{t.descricao}</div>}
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                👤 {t.responsavel?.nome} · 📅 {new Date(t.data_limite).toLocaleDateString('pt-PT')}
              </div>
            </div>
            <span className={`chip ${statusColor[t.status]}`}>{t.status}</span>
            <button onClick={() => setDeleteTaskId(t.id)} className="btn btn-ghost" style={{ padding: 6, color: 'var(--color-danger)' }}><Icon.Trash size={14}/></button>
          </div>
        ))}
        {tasks.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 20 }}>Sem tarefas ainda</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nova tarefa">
        <form onSubmit={create}>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Título *</label>
            <input className="input" value={titulo} onChange={e => setTitulo(e.target.value)}/>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Descrição</label>
            <textarea className="textarea" value={descricao} onChange={e => setDescricao(e.target.value)} rows={3}/>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Responsável</label>
            <select className="select" value={responsavel} onChange={e => setResponsavel(Number(e.target.value))}>
              {members.map(m => <option key={m.id} value={m.user_id}>{m.user?.nome}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Prazo *</label>
            <input className="input" type="date" value={dataLimite} onChange={e => setDataLimite(e.target.value)}/>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Criar tarefa</button>
        </form>
      </Modal>
      <ConfirmDialog
        open={deleteTaskId !== null}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={remove}
        title="Eliminar tarefa"
        message="Tens a certeza que queres eliminar esta tarefa? Esta ação é irreversível"
        confirmLabel="Eliminar"
        danger
      />
    </div>
  );
}

// ===== EXPENSES TAB =====
function ExpensesTab({ trip, onTripUpdated }: { trip: Trip; onTripUpdated: (trip: Trip) => void }) {
  const { user, showToast } = useApp();
  const [expenses, setExpenses] = useState<(TripExpense & { user?: User })[]>([]);
  const [open, setOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [newBudget, setNewBudget] = useState(trip.orcamento_total);
  const [deleteExpenseId, setDeleteExpenseId] = useState<number | null>(null);
  const [categoria, setCategoria] = useState('Voos');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState(0);

  const load = async () => setExpenses(await expensesApi.listByTrip(trip.id));
  useEffect(() => { load(); }, [trip.id]);
  useEffect(() => { setNewBudget(trip.orcamento_total); }, [trip.orcamento_total]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || valor <= 0) { showToast('error', 'Preencha os campos'); return; }
    try {
      await expensesApi.create({ trip_id: trip.id, user_id: user!.id, categoria, descricao, valor, data: new Date().toISOString().slice(0, 10) });
      showToast('success', 'Despesa adicionada');
      setDescricao(''); setValor(0); setOpen(false);
      await load();

      const total = (await expensesApi.listByTrip(trip.id)).reduce((s, e) => s + e.valor, 0);
      if (trip.orcamento_total > 0 && total > trip.orcamento_total * 0.8 && total <= trip.orcamento_total * 0.8 + valor) {
        showToast('info', '⚠️ Gastos ultrapassaram 80% do orçamento!');
      }
    } catch (err: any) { showToast('error', err.message); }
  };

  const remove = async () => {
    if (!deleteExpenseId) return;
    try {
      await expensesApi.delete(deleteExpenseId);
      showToast('success', 'Despesa eliminada');
      await load();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const updateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(newBudget) || newBudget <= 0) {
      showToast('error', 'O orçamento deve ser um número positivo maior que zero');
      return;
    }
    try {
      const updated = await tripsApi.update(trip.id, { orcamento_total: newBudget });
      onTripUpdated(updated);
      setBudgetOpen(false);
      showToast('success', 'Orçamento atualizado');
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const total = expenses.reduce((s, e) => s + e.valor, 0);
  const perPerson = expenses.length ? total / Math.max(trip.num_viajantes, 1) : 0;
  const pct = trip.orcamento_total > 0 ? Math.min(100, (total / trip.orcamento_total) * 100) : 0;
  const byCat: Record<string, number> = {};
  expenses.forEach(e => { byCat[e.categoria] = (byCat[e.categoria] || 0) + e.valor; });

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>💰 Despesas</h3>
        <button className="btn btn-primary" onClick={() => setOpen(true)}><Icon.Plus size={16}/> Nova despesa</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ padding: 14, background: 'var(--color-bg)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Total gasto</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>{formatAOA(total)}</div>
        </div>
        <div style={{ padding: 14, background: 'var(--color-bg)', borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Orçamento</div>
            <button className="btn btn-ghost" onClick={() => setBudgetOpen(true)} style={{ padding: '4px 6px', fontSize: 12 }}>
              <Icon.Edit size={13}/> Editar orçamento
            </button>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{formatAOA(trip.orcamento_total)}</div>
        </div>
        <div style={{ padding: 14, background: 'var(--color-bg)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Por pessoa</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-blue)' }}>{formatAOA(perPerson)}</div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
          <span>Progresso do orçamento</span>
          <span style={{ fontWeight: 700, color: pct > 80 ? '#dc2626' : 'var(--color-text)' }}>{pct.toFixed(0)}%</span>
        </div>
        <div style={{ height: 10, background: 'var(--color-bg)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: pct > 80 ? '#dc2626' : '#FF6700', transition: 'width 0.3s' }}/>
        </div>
        {pct > 80 && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>⚠️ Atenção: gastos acima de 80% do orçamento</div>}
      </div>

      {Object.keys(byCat).length > 0 && (
        <div style={{ marginBottom: 16, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.entries(byCat).map(([cat, v]) => (
            <span key={cat} className="chip chip-blue">{cat}: {formatAOA(v)}</span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {expenses.map(e => (
          <div key={e.id} style={{ padding: 12, background: 'var(--color-bg)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{e.descricao}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{e.categoria} · {e.user?.nome} · {e.data}</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-primary)' }}>{formatAOA(e.valor)}</div>
            <button onClick={() => setDeleteExpenseId(e.id)} className="btn btn-ghost" style={{ padding: 6, color: 'var(--color-danger)' }}><Icon.Trash size={14}/></button>
          </div>
        ))}
        {expenses.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 20 }}>Sem despesas ainda</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nova despesa">
        <form onSubmit={create}>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Categoria</label>
            <select className="select" value={categoria} onChange={e => setCategoria(e.target.value)}>
              {['Voos', 'Alojamento', 'Alimentação', 'Transporte', 'Atividades', 'Compras', 'Outro'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Descrição *</label>
            <input className="input" value={descricao} onChange={e => setDescricao(e.target.value)}/>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Valor ({APP_CURRENCY_CODE}) *</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ padding: '0 12px', alignSelf: 'stretch', display: 'flex', alignItems: 'center', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRight: 0, borderRadius: '8px 0 0 8px', fontWeight: 700 }}>
                {APP_CURRENCY_SYMBOL}
              </span>
              <input className="input" type="number" min="0" step="0.01" value={valor} onChange={e => setValor(Number(e.target.value))} style={{ borderRadius: '0 8px 8px 0' }}/>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Adicionar</button>
        </form>
      </Modal>
      <Modal open={budgetOpen} onClose={() => setBudgetOpen(false)} title="Editar orçamento">
        <form onSubmit={updateBudget}>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Novo orçamento ({APP_CURRENCY_CODE}) *</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ padding: '0 12px', alignSelf: 'stretch', display: 'flex', alignItems: 'center', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRight: 0, borderRadius: '8px 0 0 8px', fontWeight: 700 }}>
                {APP_CURRENCY_SYMBOL}
              </span>
              <input className="input" type="number" min="0.01" step="0.01" value={newBudget} onChange={e => setNewBudget(Number(e.target.value))} style={{ borderRadius: '0 8px 8px 0' }}/>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Guardar orçamento</button>
        </form>
      </Modal>
      <ConfirmDialog
        open={deleteExpenseId !== null}
        onClose={() => setDeleteExpenseId(null)}
        onConfirm={remove}
        title="Eliminar despesa"
        message="Tens a certeza que queres eliminar esta despesa? Esta ação é irreversível"
        confirmLabel="Eliminar"
        danger
      />
    </div>
  );
}

// ===== DOCUMENTS TAB =====
function DocumentsTab({ tripId }: { tripId: number }) {
  const { user, showToast } = useApp();
  const [docs, setDocs] = useState<TripDocument[]>([]);
  const [open, setOpen] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Passaporte');

  const load = async () => setDocs(await documentsApi.listByTrip(tripId));
  useEffect(() => { load(); }, [tripId]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) { showToast('error', 'Nome obrigatório'); return; }
    try {
      await documentsApi.create({ trip_id: tripId, user_id: user!.id, nome, tipo, status: 'pendente' });
      showToast('success', 'Documento adicionado');
      setNome(''); setOpen(false);
      await load();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const toggle = async (id: number) => {
    try {
      await documentsApi.toggleStatus(id);
      showToast('success', 'Estado do documento atualizado');
      await load();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const remove = async () => {
    if (!deleteDocId) return;
    try {
      await documentsApi.delete(deleteDocId);
      showToast('success', 'Documento eliminado');
      await load();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>📄 Documentos</h3>
        <button className="btn btn-primary" onClick={() => setOpen(true)}><Icon.Plus size={16}/> Novo</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {docs.map(d => (
          <div key={d.id} style={{ padding: 12, background: 'var(--color-bg)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => toggle(d.id)} style={{ width: 22, height: 22, borderRadius: 6, border: '2px solid var(--color-border)', background: d.status === 'tratado' ? '#16a34a' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              {d.status === 'tratado' && <Icon.Check size={14}/>}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, textDecoration: d.status === 'tratado' ? 'line-through' : 'none' }}>{d.nome}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{d.tipo}</div>
            </div>
            <span className={`chip ${d.status === 'tratado' ? 'chip-success' : 'chip-warning'}`}>{d.status}</span>
            <button onClick={() => setDeleteDocId(d.id)} className="btn btn-ghost" style={{ padding: 6, color: 'var(--color-danger)' }}><Icon.Trash size={14}/></button>
          </div>
        ))}
        {docs.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 20 }}>Sem documentos</p>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Novo documento">
        <form onSubmit={create}>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Nome *</label>
            <input className="input" value={nome} onChange={e => setNome(e.target.value)}/>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Tipo</label>
            <select className="select" value={tipo} onChange={e => setTipo(e.target.value)}>
              {['Passaporte', 'Visto', 'Bilhete de identidade', 'Seguro', 'Vacinas', 'Bilhetes', 'Reservas', 'Outro'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Adicionar</button>
        </form>
      </Modal>
      <ConfirmDialog
        open={deleteDocId !== null}
        onClose={() => setDeleteDocId(null)}
        onConfirm={remove}
        title="Eliminar documento"
        message="Tens a certeza que queres eliminar este documento? Esta ação é irreversível"
        confirmLabel="Eliminar"
        danger
      />
    </div>
  );
}

// ===== VOTES TAB =====
function VotesTab({ tripId, members }: { tripId: number; members: (TripMember & { user?: User })[] }) {
  const { user, showToast } = useApp();
  const [votes, setVotes] = useState<TripVote[]>([]);
  const [newAct, setNewAct] = useState('');
  const [editingAct, setEditingAct] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingAct, setDeletingAct] = useState<string | null>(null);

  const load = async () => setVotes(await votesApi.listByTrip(tripId));
  useEffect(() => { load(); }, [tripId]);

  const actividades = Array.from(new Set(votes.map(v => v.actividade)));

  const cast = async (act: string, voto: boolean) => {
    if (!user) return;
    try {
      await votesApi.vote(tripId, act, user.id, voto);
      showToast('success', 'Voto registado');
      await load();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const addAct = async () => {
    if (!newAct.trim() || !user) { showToast('error', 'Escreva uma atividade'); return; }
    try {
      await votesApi.addActividade(String(tripId), newAct, user.id);
      showToast('success', 'Atividade proposta');
      setNewAct('');
      await load();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const openEdit = (act: string) => {
    setEditingAct(act);
    setEditTitle(act);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAct || !user) return;
    if (!editTitle.trim()) { showToast('error', 'O título da atividade é obrigatório'); return; }
    try {
      await votesApi.updateActividade(tripId, editingAct, editTitle.trim(), user.id);
      showToast('success', 'Votação atualizada');
      setEditingAct(null);
      setEditTitle('');
      await load();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const deleteVote = async () => {
    if (!deletingAct || !user) return;
    try {
      await votesApi.deleteActividade(tripId, deletingAct, user.id);
      showToast('success', 'Votação eliminada');
      setDeletingAct(null);
      await load();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  return (
    <div className="card">
      <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>🗳️ Votações de atividades</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input className="input" placeholder="Propor nova atividade..." value={newAct} onChange={e => setNewAct(e.target.value)}/>
        <button className="btn btn-primary" onClick={addAct}>Propor</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {actividades.map(act => {
          const actVotes = votes.filter(v => v.actividade === act);
          const sim = actVotes.filter(v => v.voto).length;
          const nao = actVotes.filter(v => !v.voto).length;
          const myVote = actVotes.find(v => v.user_id === user?.id);
          const creatorId = [...actVotes].sort((a, b) => a.id - b.id)[0]?.user_id;
          const canManage = creatorId === user?.id;
          return (
            <div key={act} style={{ padding: 14, background: 'var(--color-bg)', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <div style={{ fontWeight: 600, minWidth: 0 }}>{act}</div>
                {canManage && (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-ghost" onClick={() => openEdit(act)} style={{ padding: '6px 8px' }} title="Editar votação">
                      <Icon.Edit size={14}/>
                    </button>
                    <button className="btn btn-ghost" onClick={() => setDeletingAct(act)} style={{ padding: '6px 8px', color: 'var(--color-danger)' }} title="Eliminar votação">
                      <Icon.Trash size={14}/>
                    </button>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <button onClick={() => cast(act, true)} className={`btn ${myVote?.voto === true ? 'btn-primary' : 'btn-ghost'}`}>👍 Sim ({sim})</button>
                <button onClick={() => cast(act, false)} className={`btn ${myVote?.voto === false ? 'btn-danger' : 'btn-ghost'}`}>👎 Não ({nao})</button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                {actVotes.map(v => {
                  const u = members.find(m => m.user_id === v.user_id)?.user;
                  return <span key={v.id} className="chip" style={{ marginRight: 4 }}>{u?.avatar} {u?.nome}: {v.voto ? 'Sim' : 'Não'}</span>;
                })}
              </div>
            </div>
          );
        })}
        {actividades.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 20 }}>Sem atividades propostas</p>}
      </div>
      <Modal open={editingAct !== null} onClose={() => setEditingAct(null)} title="Editar votação">
        <form onSubmit={saveEdit}>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Título da actividade *</label>
            <input className="input" value={editTitle} onChange={e => setEditTitle(e.target.value)}/>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Confirmar</button>
        </form>
      </Modal>
      <ConfirmDialog
        open={deletingAct !== null}
        onClose={() => setDeletingAct(null)}
        onConfirm={deleteVote}
        title="Eliminar votação"
        message="Tens a certeza que queres eliminar esta votação?"
        confirmLabel="Eliminar"
        danger
      />
    </div>
  );
}

// ===== DIARY TAB =====
function DiaryTab({ trip }: { trip: Trip }) {
  const { user, showToast } = useApp();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [descricao, setDescricao] = useState('');
  const [notas, setNotas] = useState('');
  const [fotos, setFotos] = useState<string[]>([]);
  const [deleteEntryId, setDeleteEntryId] = useState<number | null>(null);

  const load = async () => setEntries(await diaryApi.listByTrip(trip.id));
  useEffect(() => { load(); }, [trip.id]);

  const handleFotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = () => setFotos(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !data || !descricao) { showToast('error', 'Preencha todos os campos'); return; }
    try {
      await diaryApi.create({ trip_id: trip.id, user_id: user!.id, titulo, data, descricao, notas, fotos });
      showToast('success', 'Entrada adicionada ao diário');
      setTitulo(''); setData(''); setDescricao(''); setNotas(''); setFotos([]); setOpen(false);
      await load();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const remove = async () => {
    if (!deleteEntryId) return;
    try {
      await diaryApi.delete(deleteEntryId);
      showToast('success', 'Entrada do diário eliminada');
      await load();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const exportPDF = () => {
    const html = exportDiaryToHTML(trip, entries);
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>📖 Diário de viagem ({entries.length})</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {entries.length > 0 && <button className="btn btn-blue" onClick={exportPDF}><Icon.Download size={16}/> Exportar PDF</button>}
          <button className="btn btn-primary" onClick={() => setOpen(true)}><Icon.Plus size={16}/> Nova entrada</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {entries.map(e => (
          <div key={e.id} className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>📅 {new Date(e.data).toLocaleDateString('pt-PT')}</div>
                <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{e.titulo}</h3>
                <p style={{ margin: '0 0 8px', lineHeight: 1.6 }}>{e.descricao}</p>
                {e.notas && <div style={{ padding: 10, background: 'var(--color-bg)', borderRadius: 6, fontStyle: 'italic', fontSize: 14 }}>📝 {e.notas}</div>}
                {e.fotos.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {e.fotos.map((f, i) => <img key={i} src={f} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 6 }}/>)}
                  </div>
                )}
              </div>
              <button onClick={() => setDeleteEntryId(e.id)} className="btn btn-ghost" style={{ padding: 6, color: 'var(--color-danger)' }}><Icon.Trash size={14}/></button>
            </div>
          </div>
        ))}
        {entries.length === 0 && <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>📖</div>
          <p>O diário ainda está vazio. Comece a registar as suas memórias!</p>
        </div>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Nova entrada no diário" size="lg">
        <form onSubmit={create}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label className="label">Título *</label>
              <input className="input" value={titulo} onChange={e => setTitulo(e.target.value)}/>
            </div>
            <div>
              <label className="label">Data *</label>
              <input className="input" type="date" value={data} onChange={e => setData(e.target.value)}/>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Descrição *</label>
            <textarea className="textarea" value={descricao} onChange={e => setDescricao(e.target.value)} rows={4}/>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="label">Notas adicionais</label>
            <textarea className="textarea" value={notas} onChange={e => setNotas(e.target.value)} rows={2}/>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Fotos</label>
            <input type="file" accept="image/*" multiple onChange={handleFotos}/>
            {fotos.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {fotos.map((f, i) => <img key={i} src={f} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }}/>)}
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Guardar entrada</button>
        </form>
      </Modal>
      <ConfirmDialog
        open={deleteEntryId !== null}
        onClose={() => setDeleteEntryId(null)}
        onConfirm={remove}
        title="Eliminar entrada do diário"
        message="Tens a certeza que queres eliminar esta entrada? Esta ação é irreversível"
        confirmLabel="Eliminar"
        danger
      />
    </div>
  );
}
