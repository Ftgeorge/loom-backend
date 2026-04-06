# Loom — Backend Command Center

Loom Backend is a robust, type-safe API server built with **Node.js, Express, and PostgreSQL**. It serves as the intelligent core for the Loom ecosystem, managing professional artisan searching, mission matching, and secure operative authentication.

## 🌟 Architectural Pillars

- **Express 5.0 Core:** Utilizing the latest Express features with built-in `asyncHandler` support for streamlined error management.
- **Type-Safe Infrastructure:** 100% TypeScript compliance across the entire services and repository layers.
- **Relational Integrity:** A solid **PostgreSQL** schema for managing users, artisans, skills, jobs, and mission tracking.
- **Schema-Safe Validation:** Heavy use of **Zod** for both request body validation and environment configuration.
- **Secure Authentication:** JWT-based authentication with role-based access control (Admin, Artisan, Customer).

## 🛠️ Tactical Tech Stack

- **Server:** Node.js (v20+)
- **Framework:** Express + TSX (for high-speed development)
- **Database:** PostgreSQL (using `pg` pool)
- **Validation:** Zod
- **Auth:** jsonwebtoken + bcrypt
- **Migrations:** Custom SQL-based migration runner (`src/db/migrate.ts`)

---

## 🚦 Operational Setup

### 1. Configure the Environment
Ensure you have a `.env` file in the root of `/loom-backend` with the following tactical variables:
```env
PORT=5000
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
JWT_SECRET=[high_entropy_secret_key]
JWT_EXPIRES_IN=7d
```

### 2. Deployment Protocol
To initialize the backend for development:
```bash
# Install tactical dependencies
npm install

# Run database migrations
npm run migrate

# Launch the server in development mode (watch mode)
npm run dev
```

### 3. Verify Type Safety
To perform a system-wide TypeScript audit:
```bash
npx tsc --noEmit
```

---

## 📂 Backend Logic Layer

- `/src/routes` — API entry points (Auth, Skill Matrix, Artisan Search, Jobs)
- `/src/services` — Intelligent business logic (Artisan searching, Job matching, Auth login)
- `/src/repositories` — Data access layer for PostgreSQL (Direct SQL queries via `src/db/query.ts`)
- `/src/db` — Pool configuration and migration runner logic
- `/src/validators` — Zod schemas for request validation

---

## 🧪 Testing and Quality
The backend includes a set of scripts for operational testing:
```bash
# Test localized user population
npm run test:users
```

## 🗺️ Roadmap
- [ ] Real-time Socket.io integration for instant mission notifications.
- [ ] Automated financial settlements for completed service missions.
- [ ] Advanced geospatial searching for locating closest artisans.
- [ ] Administrative management console for artisan verification.
