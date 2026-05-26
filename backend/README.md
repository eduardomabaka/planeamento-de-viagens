# Backend PHP — TripPlanner

Esta pasta contém a estrutura de referência para o backend PHP que pode ser ligado ao frontend React.

## Estrutura

```
backend/
├── config/
│   └── database.php      # Conexão PDO ao MySQL
├── api/
│   ├── auth/
│   │   ├── login.php     # POST - Login (JWT)
│   │   └── register.php  # POST - Registo
│   ├── users/            # CRUD utilizadores
│   ├── trips/            # CRUD viagens
│   ├── destinos/
│   │   └── info.php      # GET - Integração APIs externas
│   ├── tasks/
│   ├── expenses/
│   ├── documents/
│   ├── diary/
│   ├── messages/
│   ├── notifications/
│   └── publications/
├── .env.example
└── .htaccess             # Apache rewrite rules
```

## Configuração

1. Copie `.env.example` para `.env`
2. Configure as credenciais da base de dados
3. Adicione as chaves das APIs externas:
   - OpenWeatherMap: https://openweathermap.org/api
   - ExchangeRate API: https://open.er-api.com

## Servidor

### Apache

```apache
<VirtualHost *:80>
    ServerName api.tripplanner.local
    DocumentRoot /caminho/para/backend
    <Directory /caminho/para/backend>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### PHP Built-in (dev)

```bash
cd backend
php -S localhost:8000
```

## Ligação ao Frontend

No frontend, substitua as funções em `src/api.ts` por chamadas `fetch()`:

```typescript
// Exemplo: substituir authApi.login
async login(email: string, password: string): Promise<User> {
  const res = await fetch('http://localhost:8000/api/auth/login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error);
  }
  const data = await res.json();
  localStorage.setItem('token', data.token);
  return data.user;
}
```

## Segurança

- Todas as passwords são hash com `password_hash()` (bcrypt)
- JWT tokens com expiração
- CORS configurado
- Prepared statements em todas as queries SQL
- Validação server-side em todos os inputs
