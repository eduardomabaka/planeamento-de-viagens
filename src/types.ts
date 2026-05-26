export type Role = 'admin' | 'user';
export type TripType = 'lazer' | 'negocios' | 'aventura';
export type TripStatus = 'planeamento' | 'ativa' | 'concluida' | 'cancelada';
export type DocStatus = 'pendente' | 'tratado';
export type TaskStatus = 'pendente' | 'em_progresso' | 'concluida';

export interface User {
  id: number;
  nome: string;
  email: string;
  role: Role;
  avatar?: string;
  bio?: string;
  created_at: string;
}

export interface Trip {
  id: number;
  user_id: number;
  nome: string;
  destino: string;
  data_partida: string;
  data_regresso: string;
  num_viajantes: number;
  tipo: TripType;
  orcamento_total: number;
  status: TripStatus;
  created_at: string;
  destino_info?: DestinoInfo;
}

export interface DestinoInfo {
  pais: string;
  capital?: string;
  idioma: string;
  moeda: string;
  cambio: number;
  fuso_horario: string;
  clima: { temp: number; descricao: string; icon: string };
  contactos_emergencia: { embaixada: string; hospital: string; policia: string };
  dicas_culturais: string[];
  atracoes: string[];
  vacinas: string[];
  hoteis: { nome: string; preco: number; rating: number }[];
  transporte: string[];
}

export interface TripMember {
  id: number;
  trip_id: number;
  user_id: number;
  role: 'criador' | 'convidado';
  accepted: boolean;
  user?: User;
}

export interface TripTask {
  id: number;
  trip_id: number;
  titulo: string;
  descricao: string;
  status: TaskStatus;
  responsavel_id: number;
  data_limite: string;
  responsavel?: User;
}

export interface TripExpense {
  id: number;
  trip_id: number;
  user_id: number;
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  user?: User;
}

export interface TripDocument {
  id: number;
  trip_id: number;
  user_id: number;
  nome: string;
  tipo: string;
  ficheiro?: string;
  status: DocStatus;
}

export interface DiaryEntry {
  id: number;
  trip_id: number;
  user_id: number;
  data: string;
  titulo: string;
  descricao: string;
  fotos: string[];
  notas?: string;
}

export interface TripVote {
  id: number;
  trip_id: number;
  actividade: string;
  user_id: number;
  voto: boolean;
}

export interface Message {
  id: number;
  trip_id: number;
  user_id: number;
  mensagem: string;
  created_at: string;
  user?: User;
}

export interface Notification {
  id: number;
  user_id: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  tipo: string;
  created_at: string;
}

export interface Publication {
  id: number;
  admin_id: number;
  titulo: string;
  mensagem: string;
  created_at: string;
}

export interface Follow {
  follower_id: number;
  following_id: number;
  created_at: string;
}
