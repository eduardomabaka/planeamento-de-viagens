import { useState } from 'react';
import { useApp } from '../context';
import { usersApi } from '../api';
import { Icon, ConfirmDialog } from '../components/ui';

export function Profile({ admin = false }: { admin?: boolean }) {
  const { user, setUser, showToast } = useApp();
  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await usersApi.update(user.id, { nome, email, bio, avatar });
      setUser(updated);
      showToast('success', 'Perfil atualizado com sucesso');
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setSaving(false);
      setShowSaveConfirm(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) {
      showToast('error', 'As passwords não coincidem');
      return;
    }
    if (newPw.length < 6) {
      showToast('error', 'A nova password deve ter pelo menos 6 caracteres');
      return;
    }
    setSaving(true);
    try {
      await usersApi.changePassword(user.id, currentPw, newPw);
      showToast('success', 'Password alterada com sucesso');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setSaving(false);
      setShowPwConfirm(false);
    }
  };

  const avatarEmojis = ['🙂', '😊', '👩', '👨', '🧑', '👩‍💼', '👨‍💼', '🧔', '👱‍♀️', '👑'];

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26 }}>Perfil {admin && '(Admin)'}</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>Gerir as suas informações pessoais</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
        <div className="card">
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>👤 Informações pessoais</h3>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6700, #3A6EA5)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 10 }}>{avatar || '🙂'}</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
              {avatarEmojis.map(e => (
                <button key={e} onClick={() => setAvatar(e)} style={{ width: 32, height: 32, fontSize: 20, background: avatar === e ? '#FF6700' : 'var(--color-bg)', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{e}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Nome</label>
            <input className="input" value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Bio</label>
            <textarea className="textarea" value={bio} onChange={e => setBio(e.target.value)} rows={3} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowSaveConfirm(true)}>Guardar alterações</button>
        </div>

        <div className="card">
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>🔐 Alterar password</h3>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Password atual</label>
            <input className="input" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Nova password</label>
            <input className="input" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="label">Confirmar nova password</label>
            <input className="input" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
          </div>
          <button className="btn btn-blue" style={{ width: '100%' }} onClick={() => setShowPwConfirm(true)} disabled={!currentPw || !newPw}>Alterar password</button>

          <div style={{ marginTop: 24, padding: 14, background: 'var(--color-bg)', borderRadius: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Icon.User size={16}/> Informações da conta</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              <div><strong>ID:</strong> #{user.id}</div>
              <div><strong>Role:</strong> {user.role}</div>
              <div><strong>Membro desde:</strong> {new Date(user.created_at).toLocaleDateString('pt-PT')}</div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog open={showSaveConfirm} onClose={() => setShowSaveConfirm(false)} onConfirm={handleSaveProfile} title="Guardar alterações?" message="Tem a certeza que deseja guardar as alterações no perfil?" confirmLabel={saving ? 'A guardar...' : 'Guardar'} />
      <ConfirmDialog open={showPwConfirm} onClose={() => setShowPwConfirm(false)} onConfirm={handleChangePassword} title="Alterar password?" message="A sua password será alterada. Terá de usar a nova password no próximo login." confirmLabel={saving ? 'A alterar...' : 'Alterar password'} />
    </div>
  );
}
