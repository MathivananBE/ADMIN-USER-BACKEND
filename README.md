# Admin-Registers-User Backend

Node.js + TypeScript + Express + PostgreSQL backend where:

- **Admin** has one login (credentials from `.env`, no admin table, no admin signup).
- Admin is the **only one** who can create user accounts (`/api/admin/register-user`).
- **Users** can only **log in** (`/api/auth/login`) — there is no signup/register route for them at all.

## 1. Setup

```bash
cp .env.example .env
# edit .env: set DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

npm install
npm run migrate   # creates the "users" table
npm run dev        # starts the dev server with ts-node + nodemon
```

Production build:

```bash
npm run build
npm start
```

## 2. Database

One table, created by `npm run migrate` (`src/config/migrate.ts`):

```sql
users (
  id, name, email, password_hash,
  is_active, created_by, created_at, updated_at
)
```

There is intentionally **no admin table** — the admin identity is just the
`ADMIN_EMAIL` / `ADMIN_PASSWORD` pair in `.env`, checked directly in
`adminLogin`.

## 3. API Endpoints

### Admin

| Method | Route                     | Auth        | Description                          |
|--------|---------------------------|-------------|---------------------------------------|
| POST   | `/api/admin/login`        | Public      | Admin logs in, gets a JWT (`role: admin`) |
| POST   | `/api/admin/register-user`| Admin token | Creates a new user (name, email, password) |
| GET    | `/api/admin/users`        | Admin token | List all registered users             |

**POST /api/admin/login**
```json
{ "email": "admin@example.com", "password": "SuperSecretAdminPass123!" }
```

**POST /api/admin/register-user** (header `Authorization: Bearer <admin token>`)
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "at-least-6-chars" }
```

### User (auth only, no signup)

| Method | Route            | Auth       | Description               |
|--------|------------------|------------|----------------------------|
| POST   | `/api/auth/login`| Public     | User logs in, gets a JWT (`role: user`) |
| GET    | `/api/auth/me`   | User token | Returns the logged-in user's profile |

**POST /api/auth/login**
```json
{ "email": "jane@example.com", "password": "at-least-6-chars" }
```

## 4. How the "no signup" rule is enforced

- There is simply **no route file/controller** that inserts a user from a public
  request — `authRoutes.ts` only exposes `POST /login` and `GET /me`.
- The only code path that does `INSERT INTO users` is `registerUser` in
  `adminController.ts`, and that route is wrapped with `authenticate` +
  `requireAdmin` middleware, which requires a valid **admin** JWT
  (`role: "admin"`), which in turn can only be obtained via `/api/admin/login`
  using the credentials in `.env`.
- `requireAdmin` / `requireUser` middleware check the `role` claim embedded in
  the JWT, so a user token can never be used to hit admin-only routes and
  vice versa.

## 5. Project structure

```
src/
  config/
    db.ts         # pg Pool
    migrate.ts     # creates the users table
  controllers/
    adminController.ts   # adminLogin, registerUser, listUsers
    authController.ts     # userLogin, getMe
  middleware/
    auth.ts        # authenticate, requireAdmin, requireUser
  routes/
    adminRoutes.ts
    authRoutes.ts
  types/
    index.ts
  utils/
    jwt.ts
  app.ts
  server.ts
```

## 6. Security notes

- Passwords are hashed with `bcrypt` before being stored — never stored in plain text.
- JWTs are signed with `JWT_SECRET` and expire after `JWT_EXPIRES_IN` (default `1d`).
- Input is validated with `zod` on every route that accepts a body.
- Swap the admin login for something stronger (e.g. a proper admin table with
  its own hashed password, or SSO) if you need more than one admin later —
  the current design assumes a single admin identity.
