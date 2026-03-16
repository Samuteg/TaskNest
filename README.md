# TaskNest

Guia rápido para subir o backend e o frontend em desenvolvimento.

## Pré-requisitos

- Node.js 18+
- `pnpm` (recomendado)
- MongoDB acessível (local ou Atlas)

## Monorepo (root)

Rode backend e frontend juntos a partir da raiz:

```bash
pnpm install
pnpm dev
```

Scripts úteis na raiz:

- `pnpm dev` (backend + frontend)
- `pnpm build` (build de ambos)
- `pnpm start` (start de ambos)

## Backend (API)

1. Crie um arquivo `.env` em `backend/` com pelo menos:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=tasknest
JWT_SECRET=uma_chave_segura
FRONTEND_URL=http://localhost:3000
```

2. Variáveis opcionais (habilitam recursos específicos):

```env
RESEND_API_KEY=sua_chave_resend
RESEND_FROM_EMAIL=TaskNest <no-reply@seudominio.com>
PASSWORD_RESET_TOKEN_TTL_MINUTES=15

CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

3. Instale dependências e rode o servidor:

```bash
cd backend
pnpm install
pnpm dev
```

A API sobe por padrão em `http://localhost:5000`.

## Frontend (Next.js)

1. (Opcional) Configure a URL da API:

```env
# em frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Se `NEXT_PUBLIC_API_URL` não estiver definido em produção, o frontend usa a mesma origem (URL relativa) para chamar a API.

2. Instale dependências e rode o app:

```bash
cd frontend
pnpm install
pnpm dev
```

O frontend roda por padrão em `http://localhost:3000`.

## Docker (opcional)

Subir tudo via Docker:

```bash
docker compose up --build
```

O compose usa `backend/.env` para a API e define `NEXT_PUBLIC_API_URL=http://localhost:5000` para o frontend.

## Deploy (Render)

Crie dois serviços (web):

- **Backend**: root `backend/`, build `pnpm install --frozen-lockfile && pnpm build`, start `pnpm start`
- **Frontend**: root `frontend/`, build `pnpm install --frozen-lockfile && pnpm build`, start `pnpm start`

No frontend, configure `NEXT_PUBLIC_API_URL` apontando para a URL pública do backend.

## Checklist rápido

- MongoDB disponível e `MONGO_URI` correto
- `JWT_SECRET` definido
- `FRONTEND_URL` apontando para o frontend (CORS)
- Backend em `:5000` e frontend em `:3000`
