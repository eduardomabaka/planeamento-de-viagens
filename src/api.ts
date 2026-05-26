// Camada de serviço que simula as chamadas à API PHP/MySQL usando localStorage.
// Em produção, estas funções seriam substituídas por chamadas fetch() a endpoints PHP reais.
// O código PHP equivalente está em /backend/api/*.php

import type { User, Trip, TripMember, TripTask, TripExpense, TripDocument, DiaryEntry, TripVote, Message, Notification, Publication, Follow, DestinoInfo } from './types';
import { seedUsers, seedTrips, seedMembers, seedTasks, seedExpenses, seedDocuments, seedDiary, seedVotes, seedMessages, seedNotifications, seedPublications, seedFollows, seedPasswords } from './seed';
import { APP_CURRENCY_CODE, formatAOA } from './utils/currency';

const DB_KEY = 'tripplanner_db';
const SESSION_KEY = 'tripplanner_session';

interface DB {
  users: User[];
  trips: Trip[];
  members: TripMember[];
  tasks: TripTask[];
  expenses: TripExpense[];
  documents: TripDocument[];
  diary: DiaryEntry[];
  votes: TripVote[];
  messages: Message[];
  notifications: Notification[];
  publications: Publication[];
  follows: Follow[];
  passwords: Record<string, string>;
  counters: {
    user: number; trip: number; member: number; task: number; expense: number;
    document: number; diary: number; vote: number; message: number;
    notification: number; publication: number;
  };
}

function initDB(): DB {
  const existing = localStorage.getItem(DB_KEY);
  if (existing) return JSON.parse(existing);
  const db: DB = {
    users: seedUsers,
    trips: seedTrips,
    members: seedMembers,
    tasks: seedTasks,
    expenses: seedExpenses,
    documents: seedDocuments,
    diary: seedDiary,
    votes: seedVotes,
    messages: seedMessages,
    notifications: seedNotifications,
    publications: seedPublications,
    follows: seedFollows,
    passwords: seedPasswords,
    counters: {
      user: 7, trip: 5, member: 8, task: 5, expense: 5, document: 5,
      diary: 2, vote: 6, message: 3, notification: 3, publication: 2,
    },
  };
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
}

function getDB(): DB {
  return initDB();
}

function saveDB(db: DB): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function nextId(db: DB, key: keyof DB['counters']): number {
  db.counters[key] += 1;
  return db.counters[key];
}

// Simulate async network call
const delay = (ms = 150) => new Promise(r => setTimeout(r, ms));
const DESTINO_NOT_FOUND_MESSAGE = 'Não foi possível obter informações automáticas para este destino. Podes continuar e preencher manualmente';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(DESTINO_NOT_FOUND_MESSAGE);
  return response.json();
}

function destinationSearchTerms(destino: string): string[] {
  const parts = destino.split(',').map(p => p.trim()).filter(Boolean);
  return Array.from(new Set([parts[parts.length - 1], destino.trim()].filter(Boolean)));
}

function localizedCountryName(country: any): string {
  return country.translations?.por?.common || country.name?.common || '';
}

function localizedRegion(region?: string): string | undefined {
  const regions: Record<string, string> = {
    Africa: 'África',
    Americas: 'Américas',
    Antarctic: 'Antártida',
    Asia: 'Ásia',
    Europe: 'Europa',
    Oceania: 'Oceânia',
  };
  return region ? regions[region] || region : undefined;
}

function localizedLanguages(languages: Record<string, string> = {}): string {
  const displayNames = typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['pt'], { type: 'language' })
    : null;

  return Object.entries(languages).map(([code, fallback]) => {
    const name = displayNames?.of(code) || fallback;
    return name.charAt(0).toUpperCase() + name.slice(1);
  }).join(', ');
}

function localizedCurrencyName(code: string, fallback?: string): string | undefined {
  const displayNames = typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['pt'], { type: 'currency' })
    : null;
  return displayNames?.of(code) || fallback;
}

function weatherIcon(code?: string): string {
  if (!code) return '';
  if (code.startsWith('01')) return '☀️';
  if (code.startsWith('02')) return '⛅';
  if (code.startsWith('03') || code.startsWith('04')) return '☁️';
  if (code.startsWith('09') || code.startsWith('10')) return '🌧️';
  if (code.startsWith('11')) return '⛈️';
  if (code.startsWith('13')) return '❄️';
  if (code.startsWith('50')) return '🌫️';
  return '';
}

async function fetchCountryInfo(destino: string): Promise<any> {
  for (const term of destinationSearchTerms(destino)) {
    try {
      const countries = await fetchJson<any[]>(`https://restcountries.com/v3.1/name/${encodeURIComponent(term)}?fullText=true&fields=name,translations,capital,languages,currencies,timezones,region`);
      if (Array.isArray(countries) && countries.length > 0) return countries[0];
    } catch {
      // Try translated and fuzzy variants below.
    }
    try {
      const countries = await fetchJson<any[]>(`https://restcountries.com/v3.1/translation/${encodeURIComponent(term)}?fields=name,translations,capital,languages,currencies,timezones,region`);
      if (Array.isArray(countries) && countries.length > 0) return countries[0];
    } catch {
      // RestCountries may not know the translated country name.
    }
    try {
      const countries = await fetchJson<any[]>(`https://restcountries.com/v3.1/name/${encodeURIComponent(term)}?fields=name,translations,capital,languages,currencies,timezones,region`);
      if (Array.isArray(countries) && countries.length > 0) return countries[0];
    } catch {
      // Try the next term, e.g. "Paris, França" -> "França".
    }
  }
  throw new Error(DESTINO_NOT_FOUND_MESSAGE);
}

async function fetchAoaRate(currency: string): Promise<number> {
  if (currency === APP_CURRENCY_CODE) return 1;
  const exchange = await fetchJson<{ result?: string; rates?: Record<string, number> }>(`https://open.er-api.com/v6/latest/${encodeURIComponent(currency)}`);
  const rate = exchange.rates?.[APP_CURRENCY_CODE];
  if (!rate || Number.isNaN(rate)) throw new Error('Não foi possível obter o câmbio em tempo real para Kz');
  return rate;
}

async function fetchWeatherInfo(destino: string, dataPartida?: string): Promise<DestinoInfo['clima'] | undefined> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (!apiKey) return undefined;

  const query = encodeURIComponent(destino);
  const targetTime = dataPartida ? new Date(dataPartida).getTime() : Date.now();

  try {
    const forecast = await fetchJson<{ list?: any[] }>(`https://api.openweathermap.org/data/2.5/forecast?q=${query}&appid=${apiKey}&units=metric&lang=pt`);
    const entries = forecast.list || [];
    if (entries.length > 0) {
      const closest = entries.reduce((best, item) => {
        const itemTime = new Date(item.dt_txt).getTime();
        const bestTime = new Date(best.dt_txt).getTime();
        return Math.abs(itemTime - targetTime) < Math.abs(bestTime - targetTime) ? item : best;
      }, entries[0]);
      return {
        temp: Math.round(Number(closest.main?.temp)),
        descricao: closest.weather?.[0]?.description || '',
        icon: weatherIcon(closest.weather?.[0]?.icon),
      };
    }
  } catch {
    const current = await fetchJson<any>(`https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=metric&lang=pt`);
    if (current?.main && current?.weather?.[0]) {
      return {
        temp: Math.round(Number(current.main.temp)),
        descricao: current.weather[0].description || '',
        icon: weatherIcon(current.weather[0].icon),
      };
    }
  }

  return undefined;
}

// ========== AUTH ==========
export const authApi = {
  async login(email: string, password: string): Promise<User> {
    await delay();
    const db = getDB();
    const user = db.users.find(u => u.email === email);
    if (!user) throw new Error('Utilizador não encontrado');
    if (db.passwords[email] !== password) throw new Error('Password incorreta');
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, loggedAt: Date.now() }));
    return user;
  },
  async register(nome: string, email: string, password: string): Promise<User> {
    await delay();
    const db = getDB();
    if (db.users.find(u => u.email === email)) throw new Error('Email já registado');
    const newUser: User = {
      id: nextId(db, 'user'),
      nome, email, role: 'user',
      avatar: '🙂',
      bio: '',
      created_at: new Date().toISOString(),
    };
    db.users.push(newUser);
    db.passwords[email] = password;
    saveDB(db);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: newUser.id, loggedAt: Date.now() }));
    return newUser;
  },
  logout() {
    localStorage.removeItem(SESSION_KEY);
  },
  currentUser(): User | null {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    const { userId } = JSON.parse(session);
    return getDB().users.find(u => u.id === userId) || null;
  },
};

// ========== USERS ==========
export const usersApi = {
  async list(): Promise<User[]> {
    await delay();
    return getDB().users;
  },
  async get(id: number): Promise<User | undefined> {
    await delay();
    return getDB().users.find(u => u.id === id);
  },
  async update(id: number, data: Partial<User>): Promise<User> {
    await delay();
    const db = getDB();
    const idx = db.users.findIndex(u => u.id === id);
    if (idx < 0) throw new Error('Utilizador não encontrado');
    db.users[idx] = { ...db.users[idx], ...data };
    saveDB(db);
    return db.users[idx];
  },
  async changePassword(id: number, oldPw: string, newPw: string): Promise<void> {
    await delay();
    const db = getDB();
    const user = db.users.find(u => u.id === id);
    if (!user) throw new Error('Utilizador não encontrado');
    if (db.passwords[user.email] !== oldPw) throw new Error('Password atual incorreta');
    db.passwords[user.email] = newPw;
    saveDB(db);
  },
  async delete(id: number): Promise<void> {
    await delay();
    const db = getDB();
    const user = db.users.find(u => u.id === id);
    if (!user) throw new Error('Utilizador não encontrado');
    if (user.role === 'admin') throw new Error('Não é possível eliminar administradores');
    // Remove user + all related data (cascade)
    db.users = db.users.filter(u => u.id !== id);
    const tripIds = db.trips.filter(t => t.user_id === id).map(t => t.id);
    db.trips = db.trips.filter(t => t.user_id !== id);
    db.members = db.members.filter(m => m.user_id !== id && !tripIds.includes(m.trip_id));
    db.tasks = db.tasks.filter(t => t.responsavel_id !== id && !tripIds.includes(t.trip_id));
    db.expenses = db.expenses.filter(e => e.user_id !== id && !tripIds.includes(e.trip_id));
    db.documents = db.documents.filter(d => d.user_id !== id && !tripIds.includes(d.trip_id));
    db.diary = db.diary.filter(d => d.user_id !== id && !tripIds.includes(d.trip_id));
    db.votes = db.votes.filter(v => v.user_id !== id && !tripIds.includes(v.trip_id));
    db.messages = db.messages.filter(m => m.user_id !== id && !tripIds.includes(m.trip_id));
    db.notifications = db.notifications.filter(n => n.user_id !== id);
    db.follows = db.follows.filter(f => f.follower_id !== id && f.following_id !== id);
    delete db.passwords[user.email];
    saveDB(db);
  },
  async getStats(): Promise<{ total: number; users: number; admins: number }> {
    await delay();
    const users = getDB().users;
    return {
      total: users.length,
      users: users.filter(u => u.role === 'user').length,
      admins: users.filter(u => u.role === 'admin').length,
    };
  },
};

// ========== TRIPS ==========
export const tripsApi = {
  async list(userId?: number): Promise<Trip[]> {
    await delay();
    const db = getDB();
    if (userId) {
      const myTrips = db.members.filter(m => m.user_id === userId && m.accepted).map(m => m.trip_id);
      return db.trips.filter(t => t.user_id === userId || myTrips.includes(t.id));
    }
    return db.trips;
  },
  async get(id: number): Promise<Trip | undefined> {
    await delay();
    return getDB().trips.find(t => t.id === id);
  },
  async create(data: Omit<Trip, 'id' | 'user_id' | 'created_at' | 'status'>, userId: number): Promise<Trip> {
    await delay();
    const db = getDB();
    const trip: Trip = {
      ...data,
      id: nextId(db, 'trip'),
      user_id: userId,
      status: 'planeamento',
      created_at: new Date().toISOString(),
    };
    db.trips.push(trip);
    db.members.push({
      id: nextId(db, 'member'),
      trip_id: trip.id,
      user_id: userId,
      role: 'criador',
      accepted: true,
    });
    saveDB(db);
    return trip;
  },
  async update(id: number, data: Partial<Trip>): Promise<Trip> {
    await delay();
    const db = getDB();
    const idx = db.trips.findIndex(t => t.id === id);
    if (idx < 0) throw new Error('Viagem não encontrada');
    db.trips[idx] = { ...db.trips[idx], ...data };
    saveDB(db);
    return db.trips[idx];
  },
  async delete(id: number): Promise<void> {
    await delay();
    const db = getDB();
    db.trips = db.trips.filter(t => t.id !== id);
    db.members = db.members.filter(m => m.trip_id !== id);
    db.tasks = db.tasks.filter(t => t.trip_id !== id);
    db.expenses = db.expenses.filter(e => e.trip_id !== id);
    db.documents = db.documents.filter(d => d.trip_id !== id);
    db.diary = db.diary.filter(d => d.trip_id !== id);
    db.votes = db.votes.filter(v => v.trip_id !== id);
    db.messages = db.messages.filter(m => m.trip_id !== id);
    saveDB(db);
  },
  async fetchDestinoInfo(destino: string, dataPartida?: string): Promise<DestinoInfo> {
    await delay(150);
    const country = await fetchCountryInfo(destino);
    const currencies = country.currencies || {};
    const currency = Object.keys(currencies)[0];
    if (!currency) throw new Error('Não foi possível obter a moeda local do destino');
    const rateAoa = await fetchAoaRate(currency);
    const weather = await fetchWeatherInfo(destino, dataPartida);

    return {
      pais: localizedCountryName(country),
      capital: country.capital?.[0],
      idioma: localizedLanguages(country.languages || {}),
      moeda: currency,
      moeda_nome: localizedCurrencyName(currency, currencies[currency]?.name),
      cambio: rateAoa,
      cambio_aoa: rateAoa,
      conversao_aoa: `1 ${currency} = ${formatAOA(rateAoa)}`,
      fuso_horario: (country.timezones || []).join(', '),
      regiao: localizedRegion(country.region),
      clima: weather,
    };
  },
  // Admin stats
  async adminStats(): Promise<{
    total: number; ativas: number; concluidas: number;
    porMes: { mes: string; count: number }[];
    porTipo: { tipo: string; count: number }[];
    topDestinos: { destino: string; count: number }[];
    recentes: Trip[];
  }> {
    await delay();
    const db = getDB();
    const trips = db.trips;
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const porMes = meses.map((mes, i) => ({
      mes,
      count: trips.filter(t => new Date(t.created_at).getMonth() === i).length,
    }));
    const porTipo = [
      { tipo: 'Lazer', count: trips.filter(t => t.tipo === 'lazer').length },
      { tipo: 'Negócios', count: trips.filter(t => t.tipo === 'negocios').length },
      { tipo: 'Aventura', count: trips.filter(t => t.tipo === 'aventura').length },
    ];
    const destinoCount: Record<string, number> = {};
    trips.forEach(t => {
      const d = t.destino.split(',')[0].trim();
      destinoCount[d] = (destinoCount[d] || 0) + 1;
    });
    const topDestinos = Object.entries(destinoCount)
      .map(([destino, count]) => ({ destino, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    return {
      total: trips.length,
      ativas: trips.filter(t => t.status === 'ativa' || t.status === 'planeamento').length,
      concluidas: trips.filter(t => t.status === 'concluida').length,
      porMes,
      porTipo,
      topDestinos,
      recentes: [...trips].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5),
    };
  },
};

// ========== MEMBERS ==========
export const membersApi = {
  async listByTrip(tripId: number): Promise<(TripMember & { user?: User })[]> {
    await delay();
    const db = getDB();
    return db.members.filter(m => m.trip_id === tripId).map(m => ({
      ...m, user: db.users.find(u => u.id === m.user_id),
    }));
  },
  async invite(tripId: number, userId: number): Promise<TripMember> {
    await delay();
    const db = getDB();
    const exists = db.members.find(m => m.trip_id === tripId && m.user_id === userId);
    if (exists) throw new Error('Utilizador já é membro');
    const member: TripMember = {
      id: nextId(db, 'member'),
      trip_id: tripId,
      user_id: userId,
      role: 'convidado',
      accepted: true,
    };
    db.members.push(member);
    // Create notification
    const trip = db.trips.find(t => t.id === tripId);
    db.notifications.push({
      id: nextId(db, 'notification'),
      user_id: userId,
      titulo: 'Convite para viagem',
      mensagem: `Foste convidado para "${trip?.nome}"`,
      lida: false,
      tipo: 'convite',
      created_at: new Date().toISOString(),
    });
    saveDB(db);
    return member;
  },
  async remove(tripId: number, userId: number): Promise<void> {
    await delay();
    const db = getDB();
    db.members = db.members.filter(m => !(m.trip_id === tripId && m.user_id === userId));
    saveDB(db);
  },
};

// ========== TASKS ==========
export const tasksApi = {
  async listByTrip(tripId: number): Promise<(TripTask & { responsavel?: User })[]> {
    await delay();
    const db = getDB();
    return db.tasks.filter(t => t.trip_id === tripId).map(t => ({
      ...t, responsavel: db.users.find(u => u.id === t.responsavel_id),
    }));
  },
  async create(data: Omit<TripTask, 'id'>): Promise<TripTask> {
    await delay();
    const db = getDB();
    const task: TripTask = { ...data, id: nextId(db, 'task') };
    db.tasks.push(task);
    saveDB(db);
    return task;
  },
  async update(id: number, data: Partial<TripTask>): Promise<TripTask> {
    await delay();
    const db = getDB();
    const idx = db.tasks.findIndex(t => t.id === id);
    if (idx < 0) throw new Error('Tarefa não encontrada');
    db.tasks[idx] = { ...db.tasks[idx], ...data };
    saveDB(db);
    return db.tasks[idx];
  },
  async delete(id: number): Promise<void> {
    await delay();
    const db = getDB();
    db.tasks = db.tasks.filter(t => t.id !== id);
    saveDB(db);
  },
};

// ========== EXPENSES ==========
export const expensesApi = {
  async listByTrip(tripId: number): Promise<(TripExpense & { user?: User })[]> {
    await delay();
    const db = getDB();
    return db.expenses.filter(e => e.trip_id === tripId).map(e => ({
      ...e, user: db.users.find(u => u.id === e.user_id),
    }));
  },
  async create(data: Omit<TripExpense, 'id'>): Promise<TripExpense> {
    await delay();
    const db = getDB();
    const exp: TripExpense = { ...data, id: nextId(db, 'expense') };
    db.expenses.push(exp);
    saveDB(db);
    return exp;
  },
  async delete(id: number): Promise<void> {
    await delay();
    const db = getDB();
    db.expenses = db.expenses.filter(e => e.id !== id);
    saveDB(db);
  },
};

// ========== DOCUMENTS ==========
export const documentsApi = {
  async listByTrip(tripId: number): Promise<TripDocument[]> {
    await delay();
    return getDB().documents.filter(d => d.trip_id === tripId);
  },
  async create(data: Omit<TripDocument, 'id'>): Promise<TripDocument> {
    await delay();
    const db = getDB();
    const doc: TripDocument = { ...data, id: nextId(db, 'document') };
    db.documents.push(doc);
    saveDB(db);
    return doc;
  },
  async toggleStatus(id: number): Promise<TripDocument> {
    await delay();
    const db = getDB();
    const idx = db.documents.findIndex(d => d.id === id);
    if (idx < 0) throw new Error('Documento não encontrado');
    db.documents[idx].status = db.documents[idx].status === 'pendente' ? 'tratado' : 'pendente';
    saveDB(db);
    return db.documents[idx];
  },
  async delete(id: number): Promise<void> {
    await delay();
    const db = getDB();
    db.documents = db.documents.filter(d => d.id !== id);
    saveDB(db);
  },
};

// ========== DIARY ==========
export const diaryApi = {
  async listByTrip(tripId: number): Promise<DiaryEntry[]> {
    await delay();
    return getDB().diary.filter(d => d.trip_id === tripId).sort((a, b) => b.data.localeCompare(a.data));
  },
  async create(data: Omit<DiaryEntry, 'id'>): Promise<DiaryEntry> {
    await delay();
    const db = getDB();
    const entry: DiaryEntry = { ...data, id: nextId(db, 'diary') };
    db.diary.push(entry);
    saveDB(db);
    return entry;
  },
  async delete(id: number): Promise<void> {
    await delay();
    const db = getDB();
    db.diary = db.diary.filter(d => d.id !== id);
    saveDB(db);
  },
};

// ========== VOTES ==========
export const votesApi = {
  async listByTrip(tripId: number): Promise<TripVote[]> {
    await delay();
    return getDB().votes.filter(v => v.trip_id === tripId);
  },
  async vote(tripId: number, actividade: string, userId: number, voto: boolean): Promise<TripVote> {
    await delay();
    const db = getDB();
    const existing = db.votes.find(v => v.trip_id === tripId && v.actividade === actividade && v.user_id === userId);
    if (existing) {
      existing.voto = voto;
      saveDB(db);
      return existing;
    }
    const v: TripVote = { id: nextId(db, 'vote'), trip_id: tripId, actividade, user_id: userId, voto };
    db.votes.push(v);
    saveDB(db);
    return v;
  },
  async addActividade(tripId: string, actividade: string, userId: number): Promise<TripVote> {
    await delay();
    const db = getDB();
    const v: TripVote = { id: nextId(db, 'vote'), trip_id: Number(tripId), actividade, user_id: userId, voto: true };
    db.votes.push(v);
    saveDB(db);
    return v;
  },
  async updateActividade(tripId: number, oldActividade: string, newActividade: string, userId: number): Promise<void> {
    await delay();
    const db = getDB();
    const votes = db.votes.filter(v => v.trip_id === tripId && v.actividade === oldActividade);
    if (votes.length === 0) throw new Error('Votação não encontrada');
    if (votes[0].user_id !== userId) throw new Error('Só o criador pode editar esta votação');
    const duplicate = db.votes.some(v => v.trip_id === tripId && v.actividade === newActividade && v.actividade !== oldActividade);
    if (duplicate) throw new Error('Já existe uma votação com esse título');
    votes.forEach(v => { v.actividade = newActividade; });
    saveDB(db);
  },
  async deleteActividade(tripId: number, actividade: string, userId: number): Promise<void> {
    await delay();
    const db = getDB();
    const votes = db.votes.filter(v => v.trip_id === tripId && v.actividade === actividade);
    if (votes.length === 0) throw new Error('Votação não encontrada');
    if (votes[0].user_id !== userId) throw new Error('Só o criador pode eliminar esta votação');
    db.votes = db.votes.filter(v => !(v.trip_id === tripId && v.actividade === actividade));
    saveDB(db);
  },
};

// ========== MESSAGES ==========
export const messagesApi = {
  async listByTrip(tripId: number): Promise<(Message & { user?: User })[]> {
    await delay(50);
    const db = getDB();
    return db.messages.filter(m => m.trip_id === tripId).map(m => ({
      ...m, user: db.users.find(u => u.id === m.user_id),
    }));
  },
  async send(tripId: number, userId: number, mensagem: string): Promise<Message> {
    await delay();
    const db = getDB();
    const msg: Message = {
      id: nextId(db, 'message'),
      trip_id: tripId,
      user_id: userId,
      mensagem,
      created_at: new Date().toISOString(),
    };
    db.messages.push(msg);
    saveDB(db);
    return msg;
  },
};

// ========== NOTIFICATIONS ==========
export const notificationsApi = {
  async listByUser(userId: number): Promise<Notification[]> {
    await delay();
    return getDB().notifications.filter(n => n.user_id === userId).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  async markAsRead(id: number): Promise<void> {
    await delay();
    const db = getDB();
    const n = db.notifications.find(x => x.id === id);
    if (n) { n.lida = true; saveDB(db); }
  },
  async markAllRead(userId: number): Promise<void> {
    await delay();
    const db = getDB();
    db.notifications.filter(n => n.user_id === userId).forEach(n => n.lida = true);
    saveDB(db);
  },
};

// ========== PUBLICATIONS ==========
export const publicationsApi = {
  async list(): Promise<Publication[]> {
    await delay();
    return getDB().publications.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  async create(adminId: number, titulo: string, mensagem: string): Promise<Publication> {
    await delay();
    const db = getDB();
    const pub: Publication = {
      id: nextId(db, 'publication'),
      admin_id: adminId,
      titulo, mensagem,
      created_at: new Date().toISOString(),
    };
    db.publications.push(pub);
    // Notify all users
    db.users.filter(u => u.role === 'user').forEach(u => {
      db.notifications.push({
        id: nextId(db, 'notification'),
        user_id: u.id,
        titulo: 'Nova publicação',
        mensagem: `O admin publicou: ${titulo}`,
        lida: false,
        tipo: 'publicacao',
        created_at: new Date().toISOString(),
      });
    });
    saveDB(db);
    return pub;
  },
  async delete(id: number): Promise<void> {
    await delay();
    const db = getDB();
    db.publications = db.publications.filter(p => p.id !== id);
    saveDB(db);
  },
};

// ========== FOLLOWS ==========
export const followsApi = {
  async getFollowers(userId: number): Promise<User[]> {
    await delay();
    const db = getDB();
    const ids = db.follows.filter(f => f.following_id === userId).map(f => f.follower_id);
    return db.users.filter(u => ids.includes(u.id));
  },
  async getFollowing(userId: number): Promise<User[]> {
    await delay();
    const db = getDB();
    const ids = db.follows.filter(f => f.follower_id === userId).map(f => f.following_id);
    return db.users.filter(u => ids.includes(u.id));
  },
  async isFollowing(fromId: number, toId: number): Promise<boolean> {
    const db = getDB();
    return db.follows.some(f => f.follower_id === fromId && f.following_id === toId);
  },
  async isMutual(a: number, b: number): Promise<boolean> {
    const db = getDB();
    const aFollowsB = db.follows.some(f => f.follower_id === a && f.following_id === b);
    const bFollowsA = db.follows.some(f => f.follower_id === b && f.following_id === a);
    return aFollowsB && bFollowsA;
  },
  async toggle(fromId: number, toId: number): Promise<void> {
    await delay();
    const db = getDB();
    const idx = db.follows.findIndex(f => f.follower_id === fromId && f.following_id === toId);
    if (idx >= 0) {
      db.follows.splice(idx, 1);
    } else {
      db.follows.push({ follower_id: fromId, following_id: toId, created_at: new Date().toISOString() });
    }
    saveDB(db);
  },
};

// ========== EXPORT HELPERS ==========
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
<h1>📖 ${trip.nome}</h1>
<p><strong>Destino:</strong> ${trip.destino}</p>
<p><strong>Datas:</strong> ${trip.data_partida} → ${trip.data_regresso}</p>
<hr/>
${entries.map(e => `<div class="entry">
<h2>${e.titulo}</h2>
<div class="date">${e.data}</div>
<p>${e.descricao}</p>
${e.notas ? `<div class="notas">📝 ${e.notas}</div>` : ''}
</div>`).join('')}
</body></html>`;
}

export function resetDB(): void {
  localStorage.removeItem(DB_KEY);
  initDB();
}
