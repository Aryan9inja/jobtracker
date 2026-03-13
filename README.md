# JobTracker

JobTracker is a full-stack job application tracker built with Next.js, React, Prisma, and MariaDB/MySQL. It gives you two views over the same data: a dashboard for filtering and bulk review, and a kanban board for moving applications through your pipeline.

## Features

- Create, edit, and delete job applications
- Track status across Saved, Applied, Interviewing, Offer, and Rejected
- Assign priority levels and store salary, location, job URL, and notes
- Filter and search by company, title, location, status, and priority
- Sort by multiple fields from the dashboard
- Drag and drop applications between kanban columns
- Export all tracked jobs as CSV
- Light and dark mode UI

## Tech Stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7
- MariaDB/MySQL
- dnd-kit for kanban interactions

## Screens

- Dashboard view at `/`
- Kanban view at `/kanban`
- API routes under `/api/jobs`

## Project Structure

```text
app/
	api/jobs/           REST API for listing, creating, updating, deleting, and exporting jobs
	generated/prisma/   Generated Prisma client output
	kanban/             Kanban page
	page.tsx            Dashboard page
components/           UI building blocks
lib/prisma.ts         Prisma client setup with MariaDB adapter
prisma/schema.prisma  Database schema
```

## Prerequisites

- Node.js 20+
- npm 10+
- A running MariaDB or MySQL database

## Environment Variables

Copy `.env.example` to `.env` and update the values for your local database.

```env
DATABASE_URL="mysql://root:password@localhost:3306/jobtracker"

DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD="password"
DB_NAME="jobtracker"
DB_CONNECT_TIMEOUT_MS="5000"
DB_ACQUIRE_TIMEOUT_MS="5000"
DB_POOL_LIMIT="10"
```

Notes:

- `DATABASE_URL` is used by Prisma tooling and is now also preferred by runtime in `lib/prisma.ts`.
- `DB_*` variables are used as runtime fallback when `DATABASE_URL` is not set.
- `DB_CONNECT_TIMEOUT_MS`, `DB_ACQUIRE_TIMEOUT_MS`, and `DB_POOL_LIMIT` are optional runtime tuning values.

## Installation

```bash
npm install
```

## Database Setup

This repository currently includes the Prisma schema but does not include committed migrations. For a fresh local setup, push the schema directly to your database:

```bash
npx prisma generate
npx prisma db push
```

If you want migration files before publishing or deploying to shared environments, create an initial migration:

```bash
npx prisma migrate dev --name init
```

## Running Locally

Start the development server:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## API Overview

### `GET /api/jobs`

Returns jobs with optional query params:

- `search`
- `status`
- `priority`
- `sort`
- `order`

### `POST /api/jobs`

Creates a new job.

### `PUT /api/jobs/:id`

Updates an existing job.

### `DELETE /api/jobs/:id`

Deletes a job.

### `GET /api/jobs/export`

Downloads all jobs as CSV.

## Publishing Notes

Before publishing this repository:

- Keep `.env.example` updated as configuration changes
- Decide whether to commit Prisma migrations or keep `db push` as the setup path
- Confirm your production database connection strategy matches `lib/prisma.ts`
- Add screenshots or a demo GIF if you want a more polished public repo page

## License

This project is licensed under the MIT License. See `LICENSE` for details.
