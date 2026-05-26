import { useEffect, useState } from 'react';
import { publicationsApi } from '../api';
import type { Publication } from '../types';
import { useApp } from '../context';
import { Icon, ConfirmDialog, EmptyState } from '../components/ui';

export function AdminPublications() {
  const { user, showToast } = useApp();
  const [pubs, setPubs] = useState<Publication[]>([]);
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => setPubs(await publicationsApi.list());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !mensagem.trim()) {
      showToast('error', 'Preencha o título e a mensagem');
      return;
    }
    setLoading(true);
    try {
      await publicationsApi.create(user!.id, titulo, mensagem);
      showToast('success', 'Publicação criada e todos os utilizadores foram notificados');
      setTitulo(''); setMensagem('');
      await load();
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await publicationsApi.delete(deleteId);
      showToast('success', 'Publicação eliminada');
      await load();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26 }}>Publicações</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>Comunique com todos os utilizadores da plataforma</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        <div className="card">
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>📢 Nova publicação</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label className="label">Título</label>
              <input className="input" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Novas funcionalidades" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="label">Mensagem</label>
              <textarea className="textarea" value={mensagem} onChange={e => setMensagem(e.target.value)} placeholder="Escreva a sua mensagem..." rows={6} style={{ resize: 'vertical' }}/>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'A publicar...' : 'Publicar para todos os utilizadores'}
            </button>
            <p style={{ marginTop: 10, fontSize: 12, color: 'var(--color-text-muted)' }}>
              💡 Todos os utilizadores receberão uma notificação.
            </p>
          </form>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>📜 Histórico ({pubs.length})</h3>
          {pubs.length === 0 ? (
            <EmptyState icon={<Icon.Megaphone size={40}/>} title="Sem publicações" description="Crie a sua primeira publicação" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 600, overflowY: 'auto' }}>
              {pubs.map(p => (
                <div key={p.id} style={{ padding: 14, background: 'var(--color-bg)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.titulo}</div>
                      <div style={{ fontSize: 14, color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap' }}>{p.mensagem}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
                        📅 {new Date(p.created_at).toLocaleString('pt-PT')}
                      </div>
                    </div>
                    <button onClick={() => setDeleteId(p.id)} className="btn btn-ghost" style={{ padding: 6, color: 'var(--color-danger)', flexShrink: 0 }}>
                      <Icon.Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar publicação?"
        message="Esta ação não pode ser revertida."
        confirmLabel="Eliminar"
        danger
      />
    </div>
  );
}
