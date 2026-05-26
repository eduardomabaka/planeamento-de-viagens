import type {
  User, Trip, TripMember, TripTask, TripExpense, TripDocument,
  DiaryEntry, TripVote, Message, Notification, Publication, Follow, DestinoInfo,
} from './types';
import { APP_CURRENCY_CODE, formatAOA } from './utils/currency';

const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost/full-stack-travel-planner/backend/api').replace(/\/$/, '');
const TOKEN_KEY = 'tripplanner_token';
const USER_KEY = 'tripplanner_user';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

function query(params: Record<string, unknown> = {}): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') qs.set(key, String(value));
  });
  return qs.toString() ? `?${qs}` : '';
}

async function apiFetch<T>(path: string, options: { method?: Method; body?: unknown; params?: Record<string, unknown> } = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_BASE}/index.php/${path}${query(options.params)}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.error || 'Erro na comunicação com a API');
  }
  return data as T;
}

function storeSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function normalizeTrip(trip: Trip): Trip {
  return { ...trip, orcamento_total: Number(trip.orcamento_total || 0), num_viajantes: Number(trip.num_viajantes || 1) };
}

function normalizeExpense(expense: TripExpense & { user?: User }): TripExpense & { user?: User } {
  return { ...expense, valor: Number(expense.valor || 0) };
}

export const authApi = {
  async login(email: string, password: string): Promise<User> {
    const data = await apiFetch<{ token: string; user: User }>('auth/login', { method: 'POST', body: { email, password } });
    storeSession(data.token, data.user);
    return data.user;
  },
  async register(nome: string, email: string, password: string): Promise<User> {
    const data = await apiFetch<{ token: string; user: User }>('auth/register', { method: 'POST', body: { nome, email, password } });
    storeSession(data.token, data.user);
    return data.user;
  },
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  currentUser(): User | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },
};

export const usersApi = {
  async list(): Promise<User[]> {
    return apiFetch<User[]>('users');
  },
  async get(id: number): Promise<User | undefined> {
    const user = await apiFetch<User | null>(`users/${id}`);
    return user || undefined;
  },
  async update(id: number, data: Partial<User>): Promise<User> {
    const user = await apiFetch<User>(`users/${id}`, { method: 'PUT', body: data });
    const current = authApi.currentUser();
    if (current?.id === id) storeSession(localStorage.getItem(TOKEN_KEY) || '', user);
    return user;
  },
  async changePassword(): Promise<void> {
    throw new Error('Alteração de password ainda não implementada no backend PHP');
  },
  async delete(id: number): Promise<void> {
    await apiFetch(`users/${id}`, { method: 'DELETE' });
  },
  async getStats(): Promise<{ total: number; users: number; admins: number }> {
    return apiFetch('users/stats');
  },
};

export const tripsApi = {
  async list(userId?: number): Promise<Trip[]> {
    const trips = await apiFetch<Trip[]>('trips', { params: { userId } });
    return trips.map(normalizeTrip);
  },
  async get(id: number): Promise<Trip | undefined> {
    const trip = await apiFetch<Trip | null>(`trips/${id}`);
    return trip ? normalizeTrip(trip) : undefined;
  },
  async create(data: Omit<Trip, 'id' | 'user_id' | 'created_at' | 'status'>, userId: number): Promise<Trip> {
    const trip = await apiFetch<Trip>('trips', { method: 'POST', body: { ...data, user_id: userId } });
    return normalizeTrip(trip);
  },
  async update(id: number, data: Partial<Trip>): Promise<Trip> {
    const trip = await apiFetch<Trip>(`trips/${id}`, { method: 'PUT', body: data });
    return normalizeTrip(trip);
  },
  async delete(id: number): Promise<void> {
    await apiFetch(`trips/${id}`, { method: 'DELETE' });
  },
  async fetchDestinoInfo(destino: string, dataPartida?: string): Promise<DestinoInfo> {
    const response = await fetch(`${API_BASE}/destinos/info.php${query({ destino, data_partida: dataPartida })}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Não foi possível obter informações automáticas para este destino');
    return data;
  },
  async adminStats(): Promise<{
    total: number; ativas: number; concluidas: number;
    porMes: { mes: string; count: number }[];
    porTipo: { tipo: string; count: number }[];
    topDestinos: { destino: string; count: number }[];
    recentes: Trip[];
  }> {
    return apiFetch('trips/admin-stats');
  },
};

export const membersApi = {
  async listByTrip(tripId: number): Promise<(TripMember & { user?: User })[]> {
    return apiFetch('members', { params: { tripId } });
  },
  async invite(tripId: number, userId: number): Promise<TripMember> {
    return apiFetch('members', { method: 'POST', body: { trip_id: tripId, user_id: userId } });
  },
  async remove(tripId: number, userId: number): Promise<void> {
    await apiFetch('members', { method: 'DELETE', params: { tripId, userId } });
  },
};

export const tasksApi = {
  async listByTrip(tripId: number): Promise<(TripTask & { responsavel?: User })[]> {
    return apiFetch('tasks', { params: { tripId } });
  },
  async create(data: Omit<TripTask, 'id'>): Promise<TripTask> {
    return apiFetch('tasks', { method: 'POST', body: data });
  },
  async update(id: number, data: Partial<TripTask>): Promise<TripTask> {
    return apiFetch(`tasks/${id}`, { method: 'PUT', body: data });
  },
  async delete(id: number): Promise<void> {
    await apiFetch(`tasks/${id}`, { method: 'DELETE' });
  },
};

export const expensesApi = {
  async listByTrip(tripId: number): Promise<(TripExpense & { user?: User })[]> {
    const expenses = await apiFetch<(TripExpense & { user?: User })[]>('expenses', { params: { tripId } });
    return expenses.map(normalizeExpense);
  },
  async create(data: Omit<TripExpense, 'id'>): Promise<TripExpense> {
    const expense = await apiFetch<TripExpense>('expenses', { method: 'POST', body: data });
    return normalizeExpense(expense);
  },
  async delete(id: number): Promise<void> {
    await apiFetch(`expenses/${id}`, { method: 'DELETE' });
  },
};

export const documentsApi = {
  async listByTrip(tripId: number): Promise<TripDocument[]> {
    return apiFetch('documents', { params: { tripId } });
  },
  async create(data: Omit<TripDocument, 'id'>): Promise<TripDocument> {
    return apiFetch('documents', { method: 'POST', body: data });
  },
  async toggleStatus(id: number): Promise<TripDocument> {
    return apiFetch(`documents/${id}/toggle`, { method: 'PATCH' });
  },
  async delete(id: number): Promise<void> {
    await apiFetch(`documents/${id}`, { method: 'DELETE' });
  },
};

export const diaryApi = {
  async listByTrip(tripId: number): Promise<DiaryEntry[]> {
    return apiFetch('diary', { params: { tripId } });
  },
  async create(data: Omit<DiaryEntry, 'id'>): Promise<DiaryEntry> {
    return apiFetch('diary', { method: 'POST', body: data });
  },
  async delete(id: number): Promise<void> {
    await apiFetch(`diary/${id}`, { method: 'DELETE' });
  },
};

export const votesApi = {
  async listByTrip(tripId: number): Promise<TripVote[]> {
    return apiFetch('votes', { params: { tripId } });
  },
  async vote(tripId: number, actividade: string, userId: number, voto: boolean): Promise<TripVote> {
    return apiFetch('votes', { method: 'POST', body: { trip_id: tripId, actividade, user_id: userId, voto } });
  },
  async addActividade(tripId: string, actividade: string, userId: number): Promise<TripVote> {
    return votesApi.vote(Number(tripId), actividade, userId, true);
  },
  async updateActividade(tripId: number, oldActividade: string, newActividade: string): Promise<void> {
    await apiFetch('votes/activity', { method: 'PATCH', body: { trip_id: tripId, oldActividade, newActividade } });
  },
  async deleteActividade(tripId: number, actividade: string): Promise<void> {
    await apiFetch('votes/activity', { method: 'DELETE', params: { tripId, actividade } });
  },
};

export const messagesApi = {
  async listByTrip(tripId: number): Promise<(Message & { user?: User })[]> {
    return apiFetch('messages', { params: { tripId } });
  },
  async send(tripId: number, userId: number, mensagem: string): Promise<Message> {
    return apiFetch('messages', { method: 'POST', body: { trip_id: tripId, user_id: userId, mensagem } });
  },
};

export const notificationsApi = {
  async listByUser(userId: number): Promise<Notification[]> {
    return apiFetch('notifications', { params: { userId } });
  },
  async markAsRead(id: number): Promise<void> {
    await apiFetch(`notifications/${id}/read`, { method: 'PATCH' });
  },
  async markAllRead(userId: number): Promise<void> {
    await apiFetch('notifications/read-all', { method: 'PATCH', params: { userId } });
  },
};

export const publicationsApi = {
  async list(): Promise<Publication[]> {
    return apiFetch('publications');
  },
  async create(adminId: number, titulo: string, mensagem: string): Promise<Publication> {
    return apiFetch('publications', { method: 'POST', body: { admin_id: adminId, titulo, mensagem } });
  },
  async delete(id: number): Promise<void> {
    await apiFetch(`publications/${id}`, { method: 'DELETE' });
  },
};

export const followsApi = {
  async getFollowers(userId: number): Promise<User[]> {
    return apiFetch('follows', { params: { type: 'followers', userId } });
  },
  async getFollowing(userId: number): Promise<User[]> {
    return apiFetch('follows', { params: { type: 'following', userId } });
  },
  async isFollowing(fromId: number, toId: number): Promise<boolean> {
    const following = await followsApi.getFollowing(fromId);
    return following.some(user => user.id === toId);
  },
  async isMutual(a: number, b: number): Promise<boolean> {
    const [aFollowsB, bFollowsA] = await Promise.all([followsApi.isFollowing(a, b), followsApi.isFollowing(b, a)]);
    return aFollowsB && bFollowsA;
  },
  async toggle(fromId: number, toId: number): Promise<void> {
    await apiFetch('follows', { method: 'POST', body: { fromId, toId } });
  },
};

export function exportToCSV(trip: Trip, tasks: TripTask[], expenses: TripExpense[], documents: TripDocument[], votes: TripVote[], members: TripMember[]): string {
  const lines: string[] = [];
  lines.push('RELATÓRIO DE VIAGEM');
  lines.push('');
  lines.push(`Nome;${trip.nome}`);
  lines.push(`Destino;${trip.destino}`);
  lines.push(`Partida;${trip.data_partida}`);
  lines.push(`Regresso;${trip.data_regresso}`);
  lines.push(`Tipo;${trip.tipo}`);
  lines.push(`Viajantes;${members.length}`);
  lines.push(`Moeda;${APP_CURRENCY_CODE}`);
  lines.push(`Orçamento;${formatAOA(trip.orcamento_total)}`);
  lines.push('');
  lines.push('GASTOS');
  lines.push(`Categoria;Descrição;Valor (${APP_CURRENCY_CODE});Data`);
  expenses.forEach(e => lines.push(`${e.categoria};${e.descricao};${formatAOA(e.valor)};${e.data}`));
  const total = expenses.reduce((s, e) => s + e.valor, 0);
  lines.push(`TOTAL;;;${formatAOA(total)}`);
  lines.push('');
  lines.push('DOCUMENTOS');
  lines.push('Nome;Tipo;Status');
  documents.forEach(d => lines.push(`${d.nome};${d.tipo};${d.status}`));
  lines.push('');
  lines.push('TAREFAS');
  lines.push('Título;Status;Prazo');
  tasks.forEach(t => lines.push(`${t.titulo};${t.status};${t.data_limite}`));
  lines.push('');
  lines.push('ATIVIDADES VOTADAS');
  const actMap: Record<string, { sim: number; nao: number }> = {};
  votes.forEach(v => {
    if (!actMap[v.actividade]) actMap[v.actividade] = { sim: 0, nao: 0 };
    if (v.voto) actMap[v.actividade].sim++; else actMap[v.actividade].nao++;
  });
  Object.entries(actMap).forEach(([act, c]) => lines.push(`${act};${c.sim} sim / ${c.nao} não`));
  lines.push('');
  lines.push('DIVISÃO DE DESPESAS');
  const perUser: Record<number, number> = {};
  expenses.forEach(e => { perUser[e.user_id] = (perUser[e.user_id] || 0) + e.valor; });
  Object.entries(perUser).forEach(([uid, v]) => lines.push(`Utilizador ${uid};${formatAOA(v)}`));
  if (members.length > 0) {
    lines.push(`Por pessoa (total/${members.length});${formatAOA(total / members.length)}`);
  }
  return lines.join('\n');
}

export function exportDiaryToHTML(trip: Trip, entries: DiaryEntry[]): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Diário: ${trip.nome}</title>
<style>
body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:20px;color:#222}
h1{color:#004E98;border-bottom:3px solid #FF6700;padding-bottom:10px}
h2{color:#3A6EA5;margin-top:30px}
.entry{background:#f9f9f9;padding:15px;border-left:4px solid #FF6700;margin:15px 0;border-radius:6px}
.date{color:#888;font-size:14px}
.notas{background:#fff8e1;padding:10px;border-radius:4px;margin-top:10px;font-style:italic}
</style></head><body>
<h1>Diário: ${trip.nome}</h1>
<p><strong>Destino:</strong> ${trip.destino}</p>
<p><strong>Datas:</strong> ${trip.data_partida} → ${trip.data_regresso}</p>
<hr/>
${entries.map(e => `<div class="entry">
<h2>${e.titulo}</h2>
<div class="date">${e.data}</div>
<p>${e.descricao}</p>
${e.notas ? `<div class="notas">${e.notas}</div>` : ''}
</div>`).join('')}
</body></html>`;
}

export function resetDB(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
