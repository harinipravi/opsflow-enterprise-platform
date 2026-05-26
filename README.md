# OpsFlow

OpsFlow is a full stack application scaffold with a React frontend and an Express/MySQL backend.

## Structure

```text
OpsFlow/
  frontend/
  backend/
```

## Frontend

Tech stack:

- React
- Tailwind CSS
- React Router
- Vite

Setup:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend dev server runs on `http://localhost:5173` by default.

Frontend modules:

- Dashboard
- Workflow management
- Enterprise bulk upload for workflow XLSX/CSV validation and SQL export

## Backend

Tech stack:

- Node.js
- Express
- MySQL

Setup:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Update `.env` with your local MySQL credentials before starting the backend.

The backend server runs on `http://localhost:5000` by default.

Create the initial database table:

```bash
mysql -u root -p opsflow < backend/src/database/schema.sql
```

The schema creates the `users`, `workflows`, and `activities` tables and inserts sample workflow/activity data for the dashboard.

## Available API

```text
GET /api/health
GET /api/dashboard/stats
GET /api/dashboard/activity
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
GET /api/workflows
GET /api/workflows/:id
POST /api/workflows
PUT /api/workflows/:id
DELETE /api/workflows/:id
```

Authentication responses include a JWT token. Send it to protected endpoints with:

```text
Authorization: Bearer <token>
```

## Notes

This repository contains only the initial project setup. Application features should be added later.
