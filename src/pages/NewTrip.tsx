import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { tripsApi } from '../api';
import type { DestinoInfo, TripType } from '../types';
import { Icon } from '../components/ui';

export function NewTrip() {
  const { user, showToast } = useApp();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [destino, setDestino] = useState('');
  const [dataPartida, setDataPartida] = useState('');
  const [dataRegresso, setDataRegresso] = useState('');
  const [numViajantes, setNumViajantes] = useState(2);
  const [tipo, setTipo] = useState<TripType>('lazer');
  const [orcamento, setOrcamento] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [destinoInfo, setDestinoInfo] = useState<DestinoInfo | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const today = new Date().toISOString().slice(0, 10);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nome.trim()) e.nome = 'O nome é obrigatório';
    if (!destino.trim()) e.destino = 'O destino é obrigatório';
    if (!dataPartida) e.dataPartida = 'Data de partida obrigatória';
    if (!dataRegresso) e.dataRegresso = 'Data de regresso obrigatória';
    if (dataPartida && dataPartida < today) e.dataPartida = 'Não é possível planear uma viagem para uma data que já passou';
    if (dataRegresso && dataRegresso < today) e.dataRegresso = 'Não é possível planear uma viagem para uma data que já passou';
    if (dataPartida && dataRegresso && dataRegresso < dataPartida) e.dataRegresso = 'A data de regresso deve ser posterior à de partida';
    if (numViajantes < 1) e.numViajantes = 'Mínimo 1 viajante';
    if (orcamento < 0) e.orcamento = 'Orçamento inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const fetchDestino = async () => {
    if (!destino.trim()) return;
    setLoadingInfo(true);
    try {
      const info = await tripsApi.fetchDestinoInfo(destino);
      setDestinoInfo(info);
      showToast('success', `Informação de ${info.pais} carregada`);
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('error', 'Verifique os campos marcados');
      return;
    }
    setLoading(true);
    try {
      const trip = await tripsApi.create({
        nome, destino,
        data_partida: dataPartida,
        data_regresso: dataRegresso,
        num_viajantes: numViajantes,
        tipo,
        orcamento_total: orcamento,
        destino_info: destinoInfo ?? undefined,
      }, user!.id);
      showToast('success', 'Viagem criada com sucesso!');
      navigate(`/viagens/${trip.id}`);
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span className="chip chip-primary">✨ Começar</span>
        </div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>Nova viagem</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 6, fontSize: 15 }}>Planeie a sua próxima aventura em minutos</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <span style={{ fontSize: 16 }}>1</span>
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Informações básicas</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            <div>
              <label className="label">Nome da viagem *</label>
              <input className="input" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Férias em Paris" />
              {errors.nome && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.nome}</div>}
            </div>
            <div>
              <label className="label">Destino *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="input" value={destino} onChange={e => setDestino(e.target.value)} placeholder="Ex: Paris, França" style={{ flex: 1 }} />
                <button type="button" className="btn btn-blue" onClick={fetchDestino} disabled={loadingInfo || !destino.trim()}>
                  {loadingInfo ? '...' : <><Icon.Search size={16}/> Info</>}
                </button>
              </div>
              {errors.destino && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.destino}</div>}
            </div>
            <div>
              <label className="label">Data de partida *</label>
              <input className="input" type="date" min={today} value={dataPartida} onChange={e => setDataPartida(e.target.value)} />
              {errors.dataPartida && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.dataPartida}</div>}
            </div>
            <div>
              <label className="label">Data de regresso *</label>
              <input className="input" type="date" min={dataPartida || today} value={dataRegresso} onChange={e => setDataRegresso(e.target.value)} />
              {errors.dataRegresso && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.dataRegresso}</div>}
            </div>
            <div>
              <label className="label">Nº de viajantes *</label>
              <input className="input" type="number" min="1" value={numViajantes} onChange={e => setNumViajantes(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Orçamento total (€) *</label>
              <input className="input" type="number" min="0" value={orcamento} onChange={e => setOrcamento(Number(e.target.value))} />
            </div>
            <div style={{ gridColumn: 'span 1' }}>
              <label className="label">Tipo de viagem *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {([
                  { key: 'lazer', label: '🌴 Lazer' },
                  { key: 'negocios', label: '💼 Negócios' },
                  { key: 'aventura', label: '⛰️ Aventura' },
                ] as const).map(t => (
                  <button key={t.key} type="button" onClick={() => setTipo(t.key)} className={`btn ${tipo === t.key ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {destinoInfo && (
          <div className="card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, rgba(255,103,0,0.05), rgba(58,110,165,0.05))' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon.Globe size={18}/> Informações automáticas — {destinoInfo.pais}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <InfoBlock icon="🗣️" title="Idioma" value={destinoInfo.idioma}/>
              <InfoBlock icon="💰" title="Moeda" value={`${destinoInfo.moeda} (câmbio: ${destinoInfo.cambio})`}/>
              <InfoBlock icon="🕐" title="Fuso horário" value={destinoInfo.fuso_horario}/>
              <InfoBlock icon={destinoInfo.clima.icon} title="Clima" value={`${destinoInfo.clima.temp}°C - ${destinoInfo.clima.descricao}`}/>
            </div>

            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: 14, margin: '0 0 8px' }}>🚨 Contactos de emergência</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, fontSize: 13 }}>
                <div>🏛️ Embaixada: {destinoInfo.contactos_emergencia.embaixada}</div>
                <div>🏥 Hospital: {destinoInfo.contactos_emergencia.hospital}</div>
                <div>👮 Polícia: {destinoInfo.contactos_emergencia.policia}</div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: 14, margin: '0 0 8px' }}>💡 Dicas culturais</h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
                {destinoInfo.dicas_culturais.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>

            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: 14, margin: '0 0 8px' }}>🏛️ Atrações turísticas</h4>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {destinoInfo.atracoes.map((a, i) => <span key={i} className="chip chip-blue">{a}</span>)}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: 14, margin: '0 0 8px' }}>💉 Vacinas recomendadas</h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
                {destinoInfo.vacinas.map((v, i) => <li key={i}>{v}</li>)}
              </ul>
            </div>

            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: 14, margin: '0 0 8px' }}>🏨 Sugestões de hotéis</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {destinoInfo.hoteis.map((h, i) => (
                  <div key={i} style={{ padding: 10, background: 'var(--color-bg)', borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{h.nome}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>⭐ {h.rating} · {h.preco}€/noite</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: 14, margin: '0 0 8px' }}>🚗 Transporte</h4>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {destinoInfo.transporte.map((t, i) => <span key={i} className="chip">{t}</span>)}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/viagens')}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'A criar...' : 'Criar viagem'}
          </button>
        </div>
      </form>
    </div>
  );
}

function InfoBlock({ icon, title, value }: { icon: string; title: string; value: string }) {
  return (
    <div style={{ padding: 12, background: 'var(--color-bg)', borderRadius: 8 }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{title}</div>
      <div style={{ fontWeight: 600, fontSize: 14 }}>{value}</div>
    </div>
  );
}
