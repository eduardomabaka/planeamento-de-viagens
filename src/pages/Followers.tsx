import { useEffect, useState } from 'react';
import { useApp } from '../context';
import { usersApi, followsApi } from '../api';
import type { User } from '../types';
import { Icon, EmptyState } from '../components/ui';

export function Followers() {
  const { user: currentUser, showToast } = useApp();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'explore' | 'following' | 'followers'>('explore');

  const load = async () => {
    if (!currentUser) return;
    const [all, fol, fers] = await Promise.all([
      usersApi.list(),
      followsApi.getFollowing(currentUser.id),
      followsApi.getFollowers(currentUser.id),
    ]);
    setAllUsers(all.filter(u => u.id !== currentUser.id && u.role === 'user'));
    setFollowing(fol);
    setFollowers(fers);
  };

  useEffect(() => { load(); }, [currentUser]);

  const toggleFollow = async (userId: number) => {
    if (!currentUser) return;
    await followsApi.toggle(currentUser.id, userId);
    showToast('success', 'Estado atualizado');
    await load();
  };

  const isFollowing = (userId: number) => following.some(f => f.id === userId);
  const isMutual = (userId: number) => isFollowing(userId) && followers.some(f => f.id === userId);

  const filtered = allUsers.filter(u => !search || u.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26 }}>Comunidade</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>Descubra viajantes e crie ligações mútuas para poder convidá-los</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <button onClick={() => setTab('explore')} className="card" style={{ cursor: 'pointer', border: tab === 'explore' ? '2px solid var(--color-primary)' : undefined, textAlign: 'left' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Explorar</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{allUsers.length}</div>
        </button>
        <button onClick={() => setTab('following')} className="card" style={{ cursor: 'pointer', border: tab === 'following' ? '2px solid var(--color-primary)' : undefined, textAlign: 'left' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>👥</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>A seguir</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{following.length}</div>
        </button>
        <button onClick={() => setTab('followers')} className="card" style={{ cursor: 'pointer', border: tab === 'followers' ? '2px solid var(--color-primary)' : undefined, textAlign: 'left' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>❤️</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Seguidores</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{followers.length}</div>
        </button>
      </div>

      <div className="card">
        {tab === 'explore' && (
          <>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Icon.Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' } as any}/>
              <input className="input" placeholder="Pesquisar utilizadores..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }}/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {filtered.map(u => (
                <UserCard key={u.id} user={u} isFollowing={isFollowing(u.id)} isMutual={isMutual(u.id)} onToggle={() => toggleFollow(u.id)}/>
              ))}
              {filtered.length === 0 && <EmptyState icon={<Icon.Users size={40}/>} title="Nenhum utilizador encontrado"/>}
            </div>
          </>
        )}
        {tab === 'following' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {following.map(u => (
              <UserCard key={u.id} user={u} isFollowing isMutual={isMutual(u.id)} onToggle={() => toggleFollow(u.id)}/>
            ))}
            {following.length === 0 && <EmptyState icon={<Icon.Users size={40}/>} title="Não segue ninguém" description="Explore e comece a seguir outros viajantes"/>}
          </div>
        )}
        {tab === 'followers' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {followers.map(u => (
              <UserCard key={u.id} user={u} isFollowing={isFollowing(u.id)} isMutual onToggle={() => toggleFollow(u.id)}/>
            ))}
            {followers.length === 0 && <EmptyState icon={<Icon.Heart size={40}/>} title="Sem seguidores" description="Partilhe o seu perfil para ganhar seguidores"/>}
          </div>
        )}
      </div>
    </div>
  );
}

function UserCard({ user, isFollowing, isMutual, onToggle }: { user: User; isFollowing: boolean; isMutual: boolean; onToggle: () => void }) {
  return (
    <div style={{ padding: 14, background: 'var(--color-bg)', borderRadius: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{user.avatar}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700 }}>{user.nome}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{user.email}</div>
        </div>
      </div>
      {user.bio && <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 10 }}>{user.bio}</div>}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {isFollowing && <span className="chip chip-blue">A seguir</span>}
        {isMutual && <span className="chip chip-primary">✓ Mútuo</span>}
      </div>
      <button onClick={onToggle} className={`btn ${isFollowing ? 'btn-ghost' : 'btn-primary'}`} style={{ width: '100%' }}>
        {isFollowing ? 'Deixar de seguir' : 'Seguir'}
      </button>
    </div>
  );
}
