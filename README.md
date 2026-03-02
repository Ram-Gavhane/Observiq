# Better Uptime 

A full-stack, distributed website monitoring tool built with Next.js, Express, PostgreSQL, and Redis. This application allows users to monitor website uptime, track response times, and view historical "ticks" across different regions.

## Project Structure

This monorepo uses [Turborepo](https://turbo.build/) and [Bun](https://bun.sh/).

### Applications
-   **`apps/web`**: Next.js frontend with a dashboard to manage and view monitored websites.
-   **`apps/api`**: Express backend for user authentication and managing website monitoring data.
-   **`apps/producer`**: A background service that periodically pushes monitoring tasks to Redis Streams.
-   **`apps/worker`**: A distributed worker that consumes tasks from Redis Streams, performs uptime checks (ping/HTTP GET), and logs results to the database.

### Packages
-   **`packages/db`**: Prisma schema and client for PostgreSQL.
-   **`packages/redisstreams`**: Shared utility for Redis Stream operations (Producer/Consumer).
-   **`packages/typescript-config`**: Shared TypeScript configurations.
-   **`packages/eslint-config`**: Shared ESLint configurations.

---

## Local Development Setup

### Prerequisites
-   [Bun](https://bun.sh/) (v1.3.4 or higher)
-   [PostgreSQL](https://www.postgresql.org/)
-   [Redis](https://redis.io/)

### 1. Environment Variables

Create `.env` files in the following locations:

#### Root or `packages/db`
```env
DATABASE_URL="postgresql://user:password@localhost:5432/better_uptime"
```

#### `apps/api`
```env
JWT_SECRET="your_jwt_secret_here"
DATABASE_URL="postgresql://user:password@localhost:5432/better_uptime"
```

### 2. Install Dependencies

```sh
bun install
```

### 3. Database Setup

Ensure your PostgreSQL server is running, then run migrations:

```sh
bunx prisma migrate dev --name init
```

### 4. Running the Application

Start all services (Web, API, Producer, Worker) in development mode:

```sh
bun dev
```

The services will be available at:
-   **Web**: [http://localhost:3000](http://localhost:3000)
-   **API**: [http://localhost:3001](http://localhost:3001)

---

## Architecture Overview

1.  **Dashboard**: User adds a URL to monitor.
2.  **Producer**: Every 3 minutes (default), it fetches all URLs from the database and pushes them into a Redis Stream (`better-uptime:website`).
3.  **Worker**: Listens to the Redis Stream, performs a health check, and records the `responseTimeMs` and `status` (UP/DOWN) in the `WebsiteTick` table.
4.  **API**: Serves the monitoring data to the frontend for real-time visualization.
