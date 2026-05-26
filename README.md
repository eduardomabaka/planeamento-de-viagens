# TripPlanner - Sistema de Planeamento e Gestão de Viagens

Aplicação web completa para planeamento colaborativo de viagens com funcionalidades avançadas.

## 🚀 Tecnologias

- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: PHP 8.0+ com API REST
- **Banco de Dados**: MySQL 8.0+
- **Autenticação**: JWT (JSON Web Tokens)
- **Estilização**: CSS Variables + CSS Modules

## 📦 Instalação

### Backend (PHP)

1. Navegue até a pasta `backend`:
```bash
cd backend
```

2. Configure o arquivo `.env`:
```bash
cp .env.example .env
```

3. Edite o `.env` com suas credenciais:
```env
DB_HOST=localhost
DB_NAME=tripplanner
DB_USER=root
DB_PASS=sua_senha
JWT_SECRET=sua_chave_secreta
OPENWEATHER_API_KEY=sua_chave_openweather
```

4. Configure seu servidor web (Apache/Nginx) para apontar para a pasta `backend/public`

### Frontend (React)

1. Navegue até a pasta `frontend`:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o `.env`:
```env
VITE_API_URL=http://localhost/api
```

4. Execute em modo desenvolvimento:
```bash
npm run dev
```

5. Build para produção:
```bash
npm run build
```

### Banco de Dados

1. Crie o banco de dados:
```sql
CREATE DATABASE tripplanner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Importe o schema:
```bash
mysql -u root -p tripplanner < database/schema.sql
```

## 🔐 Credenciais Iniciais

### Admin Padrão
- **Email**: admin@tripplanner.com
- **Password**: admin123

## 📱 Funcionalidades

### Painel Admin
- Dashboard com estatísticas em tempo real
- Gestão de utilizadores
- Publicações e notificações globais
- Perfil editável

### Área do Utilizador
- Criação de planeamentos de viagem
- Integração automática com APIs (clima, moeda, países)
- Funcionalidades colaborativas (chat, tarefas, despesas)
- Diário de viagem com exportação PDF
- Sistema de seguidores

## 🎨 Paleta de Cores

- **Primária**: #FF6700 (Laranja)
- **Fundo Claro**: #EBEBEB
- **Fundo Secundário**: #C0C0C0
- **Azul Médio**: #3A6EA5
- **Azul Escuro**: #004E98
- **Modo Dark**: Suportado com toggle

## 📄 Licença

MIT License
