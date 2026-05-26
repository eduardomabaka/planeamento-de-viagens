-- ============================================================
-- TripPlanner - Schema MySQL
-- Base de dados completa com todas as tabelas necessárias
-- ============================================================

CREATE DATABASE IF NOT EXISTS tripplanner
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tripplanner;

-- Utilizadores
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  avatar VARCHAR(20) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB;

-- Seguidores mútuos
CREATE TABLE follows (
  follower_id INT NOT NULL,
  following_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_following (following_id)
) ENGINE=InnoDB;

-- Viagens
CREATE TABLE trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nome VARCHAR(200) NOT NULL,
  destino VARCHAR(200) NOT NULL,
  data_partida DATE NOT NULL,
  data_regresso DATE NOT NULL,
  num_viajantes INT NOT NULL DEFAULT 1,
  tipo ENUM('lazer', 'negocios', 'aventura') NOT NULL,
  orcamento_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('planeamento', 'ativa', 'concluida', 'cancelada') DEFAULT 'planeamento',
  destino_info JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_user (user_id),
  INDEX idx_datas (data_partida, data_regresso)
) ENGINE=InnoDB;

-- Membros da viagem
CREATE TABLE trip_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('criador', 'convidado') NOT NULL,
  accepted BOOLEAN DEFAULT FALSE,
  UNIQUE KEY uniq_trip_user (trip_id, user_id),
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tarefas da viagem
CREATE TABLE trip_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT DEFAULT NULL,
  status ENUM('pendente', 'em_progresso', 'concluida') DEFAULT 'pendente',
  responsavel_id INT DEFAULT NULL,
  data_limite DATE DEFAULT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (responsavel_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_trip_status (trip_id, status)
) ENGINE=InnoDB;

-- Despesas
CREATE TABLE trip_expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  user_id INT NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data DATE NOT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_trip (trip_id)
) ENGINE=InnoDB;

-- Documentos
CREATE TABLE trip_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  user_id INT NOT NULL,
  nome VARCHAR(200) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  ficheiro VARCHAR(255) DEFAULT NULL,
  status ENUM('pendente', 'tratado') DEFAULT 'pendente',
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_trip_status (trip_id, status)
) ENGINE=InnoDB;

-- Diário de viagem
CREATE TABLE trip_diary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  user_id INT NOT NULL,
  data DATE NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT NOT NULL,
  fotos JSON DEFAULT NULL,
  notas TEXT DEFAULT NULL,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_trip_data (trip_id, data)
) ENGINE=InnoDB;

-- Votações
CREATE TABLE trip_votes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  actividade VARCHAR(200) NOT NULL,
  user_id INT NOT NULL,
  voto BOOLEAN NOT NULL,
  UNIQUE KEY uniq_vote (trip_id, actividade, user_id),
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Mensagens (chat)
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  user_id INT NOT NULL,
  mensagem TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_trip_time (trip_id, created_at)
) ENGINE=InnoDB;

-- Notificações
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  tipo VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_lida (user_id, lida)
) ENGINE=InnoDB;

-- Publicações do admin
CREATE TABLE admin_publications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  mensagem TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Cache de destinos
CREATE TABLE destination_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  destino VARCHAR(200) NOT NULL UNIQUE,
  dados JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_destino (destino)
) ENGINE=InnoDB;

-- ============================================================
-- DADOS INICIAIS
-- ============================================================

-- Admin padrão (password: admin123 - bcrypt hash)
INSERT INTO users (nome, email, password, role, avatar, bio) VALUES
('Admin Geral', 'admin@tripplanner.com', '$2y$10$YourHashHere', 'admin', '👑', 'Administrador da plataforma'),
('Ana Silva', 'ana@demo.com', '$2y$10$YourHashHere', 'user', '👩', 'Apaixonada por viagens');

-- Para gerar hashes PHP corretos, use:
-- echo password_hash('admin123', PASSWORD_BCRYPT);
