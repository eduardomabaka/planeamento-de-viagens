import type { User, Trip, TripMember, TripTask, TripExpense, TripDocument, DiaryEntry, TripVote, Message, Notification, Publication, Follow } from './types';

export const seedUsers: User[] = [
  { id: 1, nome: 'Admin Geral', email: 'admin@tripplanner.com', role: 'admin', avatar: '👑', bio: 'Administrador da plataforma', created_at: '2025-01-15T10:00:00Z' },
  { id: 2, nome: 'Ana Silva', email: 'ana@demo.com', role: 'user', avatar: '👩', bio: 'Apaixonada por viagens e fotografia', created_at: '2025-02-10T09:30:00Z' },
  { id: 3, nome: 'Bruno Costa', email: 'bruno@demo.com', role: 'user', avatar: '👨', bio: 'Aventureiro e viajante', created_at: '2025-03-05T14:20:00Z' },
  { id: 4, nome: 'Carla Martins', email: 'carla@demo.com', role: 'user', avatar: '👩‍💼', bio: 'Viajante de negócios', created_at: '2025-04-20T11:15:00Z' },
  { id: 5, nome: 'Diogo Pereira', email: 'diogo@demo.com', role: 'user', avatar: '🧑', bio: 'Explorador de novos destinos', created_at: '2025-05-12T16:45:00Z' },
  { id: 6, nome: 'Eva Sousa', email: 'eva@demo.com', role: 'user', avatar: '👱‍♀️', bio: 'Amante de praias e montanhas', created_at: '2025-06-01T08:00:00Z' },
  { id: 7, nome: 'Filipe Rocha', email: 'filipe@demo.com', role: 'user', avatar: '🧔', bio: 'Foodie e viajante', created_at: '2025-07-18T13:00:00Z' },
];

const today = new Date();
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };

export const seedTrips: Trip[] = [
  {
    id: 1, user_id: 2, nome: 'Férias em Paris', destino: 'Paris, França',
    data_partida: addDays(today, 15), data_regresso: addDays(today, 25),
    num_viajantes: 2, tipo: 'lazer', orcamento_total: 3500, status: 'planeamento',
    created_at: '2025-10-01T10:00:00Z',
    destino_info: {
      pais: 'França', capital: 'Paris', idioma: 'Francês', moeda: 'EUR', cambio: 1,
      fuso_horario: 'GMT+1',
      clima: { temp: 18, descricao: 'Parcialmente nublado', icon: '⛅' },
      contactos_emergencia: { embaixada: '+33 1 40 59 93 00', hospital: '+33 1 42 34 76 48', policia: '17' },
      dicas_culturais: ['Cumprimentar com "Bonjour"', 'Gorjeta de 10% é habitual', 'Evitar falar alto em transportes'],
      atracoes: ['Torre Eiffel', 'Museu do Louvre', 'Notre-Dame', 'Montmartre', 'Arco do Triunfo'],
      vacinas: ['Nenhuma vacina obrigatória', 'Cartão Europeu de Seguro de Doença recomendado'],
      hoteis: [
        { nome: 'Hotel Le Marais', preco: 180, rating: 4.5 },
        { nome: 'Ibis Paris Centre', preco: 95, rating: 4.0 },
      ],
      transporte: ['Metro', 'Uber', 'Táxi G7', 'Aluguer de carro'],
    },
  },
  {
    id: 2, user_id: 3, nome: 'Negócios em Berlim', destino: 'Berlim, Alemanha',
    data_partida: addDays(today, 5), data_regresso: addDays(today, 9),
    num_viajantes: 1, tipo: 'negocios', orcamento_total: 1800, status: 'ativa',
    created_at: '2025-10-10T10:00:00Z',
    destino_info: {
      pais: 'Alemanha', capital: 'Berlim', idioma: 'Alemão', moeda: 'EUR', cambio: 1,
      fuso_horario: 'GMT+1',
      clima: { temp: 14, descricao: 'Nublado', icon: '☁️' },
      contactos_emergencia: { embaixada: '+49 30 515 61 0', hospital: '+49 30 450 50', policia: '110' },
      dicas_culturais: ['Pontualidade é essencial', 'Gorjeta 5-10%', 'Domingos lojas fechadas'],
      atracoes: ['Portão de Brandemburgo', 'Muro de Berlim', 'Reichstag', 'Ilha dos Museus'],
      vacinas: ['Nenhuma obrigatória'],
      hoteis: [{ nome: 'NH Berlin Mitte', preco: 120, rating: 4.3 }],
      transporte: ['U-Bahn', 'S-Bahn', 'Táxi', 'Bolt'],
    },
  },
  {
    id: 3, user_id: 4, nome: 'Aventura no Nepal', destino: 'Katmandu, Nepal',
    data_partida: addDays(today, 45), data_regresso: addDays(today, 60),
    num_viajantes: 3, tipo: 'aventura', orcamento_total: 5200, status: 'planeamento',
    created_at: '2025-09-20T10:00:00Z',
    destino_info: {
      pais: 'Nepal', capital: 'Katmandu', idioma: 'Nepalês', moeda: 'NPR', cambio: 140,
      fuso_horario: 'GMT+5:45',
      clima: { temp: 22, descricao: 'Ameno', icon: '🌤️' },
      contactos_emergencia: { embaixada: '+977 1 441 4251', hospital: '+977 1 425 2911', policia: '100' },
      dicas_culturais: ['Retirar sapatos em templos', 'Não usar mão esquerda para cumprimentar', 'Barganhar em mercados'],
      atracoes: ['Monte Everest', 'Bhaktapur', 'Pokhara', 'Chitwan National Park'],
      vacinas: ['Hepatite A e B', 'Tétano', 'Febre tifóide', 'Raiva'],
      hoteis: [{ nome: 'Hotel Yak & Yeti', preco: 90, rating: 4.2 }],
      transporte: ['Táxi', 'Autocarro local', 'Voo doméstico'],
    },
  },
  {
    id: 4, user_id: 2, nome: 'Fim de semana no Porto', destino: 'Porto, Portugal',
    data_partida: addDays(today, -10), data_regresso: addDays(today, -7),
    num_viajantes: 2, tipo: 'lazer', orcamento_total: 400, status: 'concluida',
    created_at: '2025-08-01T10:00:00Z',
  },
  {
    id: 5, user_id: 5, nome: 'Conferência Lisboa', destino: 'Lisboa, Portugal',
    data_partida: addDays(today, -30), data_regresso: addDays(today, -27),
    num_viajantes: 1, tipo: 'negocios', orcamento_total: 600, status: 'concluida',
    created_at: '2025-07-10T10:00:00Z',
  },
];

export const seedMembers: TripMember[] = [
  { id: 1, trip_id: 1, user_id: 2, role: 'criador', accepted: true },
  { id: 2, trip_id: 1, user_id: 3, role: 'convidado', accepted: true },
  { id: 3, trip_id: 2, user_id: 3, role: 'criador', accepted: true },
  { id: 4, trip_id: 3, user_id: 4, role: 'criador', accepted: true },
  { id: 5, trip_id: 3, user_id: 5, role: 'convidado', accepted: true },
  { id: 6, trip_id: 3, user_id: 6, role: 'convidado', accepted: true },
  { id: 7, trip_id: 4, user_id: 2, role: 'criador', accepted: true },
  { id: 8, trip_id: 5, user_id: 5, role: 'criador', accepted: true },
];

export const seedTasks: TripTask[] = [
  { id: 1, trip_id: 1, titulo: 'Reservar voo', descricao: 'Reservar voo TAP Lisboa-Paris', status: 'concluida', responsavel_id: 2, data_limite: addDays(today, 5) },
  { id: 2, trip_id: 1, titulo: 'Reservar hotel', descricao: 'Hotel perto do Marais', status: 'em_progresso', responsavel_id: 3, data_limite: addDays(today, 8) },
  { id: 3, trip_id: 1, titulo: 'Comprar bilhetes Torre Eiffel', descricao: 'Comprar online com antecedência', status: 'pendente', responsavel_id: 2, data_limite: addDays(today, 10) },
  { id: 4, trip_id: 2, titulo: 'Preparar apresentação', descricao: 'Slides da reunião', status: 'em_progresso', responsavel_id: 3, data_limite: addDays(today, 3) },
  { id: 5, trip_id: 3, titulo: 'Reservar guia de trekking', descricao: 'Contratar guia local para o Himalaia', status: 'pendente', responsavel_id: 4, data_limite: addDays(today, 30) },
];

export const seedExpenses: TripExpense[] = [
  { id: 1, trip_id: 1, user_id: 2, categoria: 'Voos', descricao: 'Bilhetes TAP ida e volta', valor: 420, data: addDays(today, -5) },
  { id: 2, trip_id: 1, user_id: 3, categoria: 'Alojamento', descricao: 'Hotel Le Marais 10 noites', valor: 1800, data: addDays(today, -3) },
  { id: 3, trip_id: 1, user_id: 2, categoria: 'Alimentação', descricao: 'Reserva restaurante', valor: 120, data: addDays(today, -1) },
  { id: 4, trip_id: 2, user_id: 3, categoria: 'Voos', descricao: 'Voo Lufthansa', valor: 280, data: addDays(today, -10) },
  { id: 5, trip_id: 3, user_id: 4, categoria: 'Voos', descricao: 'Voo Qatar Airways', valor: 950, data: addDays(today, -20) },
];

export const seedDocuments: TripDocument[] = [
  { id: 1, trip_id: 1, user_id: 2, nome: 'Passaporte Ana', tipo: 'Passaporte', status: 'tratado' },
  { id: 2, trip_id: 1, user_id: 3, nome: 'Passaporte Bruno', tipo: 'Passaporte', status: 'tratado' },
  { id: 3, trip_id: 1, user_id: 2, nome: 'Seguro viagem', tipo: 'Seguro', status: 'pendente' },
  { id: 4, trip_id: 3, user_id: 4, nome: 'Visto Nepal', tipo: 'Visto', status: 'pendente' },
  { id: 5, trip_id: 3, user_id: 4, nome: 'Vacinas', tipo: 'Certificado', status: 'pendente' },
];

export const seedDiary: DiaryEntry[] = [
  {
    id: 1, trip_id: 4, user_id: 2, data: '2025-10-20', titulo: 'Chegada ao Porto',
    descricao: 'Chegámos à cidade Invicta e fomos direto à Ribeira.',
    fotos: [], notas: 'Dia maravilhoso!'
  },
  {
    id: 2, trip_id: 4, user_id: 2, data: '2025-10-21', titulo: 'Caves de Vinho do Porto',
    descricao: 'Visita às caves em Vila Nova de Gaia com prova de vinhos.',
    fotos: [], notas: 'Provar o Taylor\'s 10 anos.'
  },
];

export const seedVotes: TripVote[] = [
  { id: 1, trip_id: 1, actividade: 'Jantar na Torre Eiffel', user_id: 2, voto: true },
  { id: 2, trip_id: 1, actividade: 'Jantar na Torre Eiffel', user_id: 3, voto: true },
  { id: 3, trip_id: 1, actividade: 'Passeio de barco no Sena', user_id: 2, voto: true },
  { id: 4, trip_id: 1, actividade: 'Passeio de barco no Sena', user_id: 3, voto: false },
  { id: 5, trip_id: 1, actividade: 'Visita a Versailles', user_id: 2, voto: true },
  { id: 6, trip_id: 1, actividade: 'Visita a Versailles', user_id: 3, voto: true },
];

export const seedMessages: Message[] = [
  { id: 1, trip_id: 1, user_id: 2, mensagem: 'Olá! Vamos planear a viagem?', created_at: addDays(today, -2) + 'T10:00:00Z' },
  { id: 2, trip_id: 1, user_id: 3, mensagem: 'Claro! Já viste os voos?', created_at: addDays(today, -2) + 'T10:15:00Z' },
  { id: 3, trip_id: 1, user_id: 2, mensagem: 'Sim, encontrei bons preços na TAP!', created_at: addDays(today, -2) + 'T10:30:00Z' },
];

export const seedNotifications: Notification[] = [
  { id: 1, user_id: 2, titulo: 'Convite para viagem', mensagem: 'Bruno convidou-te para "Aventura no Nepal"', lida: false, tipo: 'convite', created_at: addDays(today, -1) + 'T10:00:00Z' },
  { id: 2, user_id: 2, titulo: 'Documento pendente', mensagem: 'Faltam 7 dias para a viagem a Paris e ainda tens documentos por tratar', lida: false, tipo: 'documento', created_at: addDays(today, 0) + 'T08:00:00Z' },
  { id: 3, user_id: 3, titulo: 'Nova publicação', mensagem: 'O admin publicou: Novas funcionalidades disponíveis!', lida: true, tipo: 'publicacao', created_at: addDays(today, -3) + 'T10:00:00Z' },
];

export const seedPublications: Publication[] = [
  { id: 1, admin_id: 1, titulo: 'Bem-vindos ao TripPlanner!', mensagem: 'Uma nova forma de planear as suas viagens. Aproveitem todas as funcionalidades colaborativas.', created_at: '2025-01-15T12:00:00Z' },
  { id: 2, admin_id: 1, titulo: 'Novas funcionalidades', mensagem: 'Adicionámos exportação de diário em PDF e relatórios CSV. Descubram tudo!', created_at: '2025-09-10T12:00:00Z' },
];

export const seedFollows: Follow[] = [
  { follower_id: 2, following_id: 3, created_at: '2025-03-01T10:00:00Z' },
  { follower_id: 3, following_id: 2, created_at: '2025-03-02T10:00:00Z' },
  { follower_id: 2, following_id: 4, created_at: '2025-04-01T10:00:00Z' },
  { follower_id: 4, following_id: 2, created_at: '2025-04-02T10:00:00Z' },
  { follower_id: 3, following_id: 5, created_at: '2025-05-01T10:00:00Z' },
  { follower_id: 5, following_id: 3, created_at: '2025-05-02T10:00:00Z' },
  { follower_id: 4, following_id: 5, created_at: '2025-06-01T10:00:00Z' },
  { follower_id: 5, following_id: 4, created_at: '2025-06-02T10:00:00Z' },
  { follower_id: 4, following_id: 6, created_at: '2025-07-01T10:00:00Z' },
  { follower_id: 6, following_id: 4, created_at: '2025-07-02T10:00:00Z' },
];

// Passwords (hashed in real PHP with password_hash)
export const seedPasswords: Record<string, string> = {
  'admin@tripplanner.com': 'admin123',
  'ana@demo.com': 'demo123',
  'bruno@demo.com': 'demo123',
  'carla@demo.com': 'demo123',
  'diogo@demo.com': 'demo123',
  'eva@demo.com': 'demo123',
  'filipe@demo.com': 'demo123',
};
