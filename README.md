# Solomon Bharat

This repository contains the frontend assets and a Node.js backend for the Solomon Bharat marketplace MVP.

## Backend

Backend code lives in the `backend/` directory. It uses Express.js with a SQLite database and integrates with OpenAI for requirement summaries.

### Getting Started
1. `cd backend`
2. Install packages:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in values for database path, JWT secret, admin credentials and OpenAI key.
4. Run the development server:
   ```
   npm run dev
   ```
   The server starts on port defined in `.env` (default 5000).

### API Endpoints
- `POST /buyer-form` – submit buyer requirement form.
- `POST /admin/login` – admin authentication.
- `GET /admin/requirements` – list all buyer submissions (admin token required).
- `POST /admin/approve/:id` – approve requirement and trigger AI suggestions.
- `POST /admin/reject/:id` – reject requirement.
- `POST /supplier/signup` – register supplier account.
- `POST /supplier/login` – supplier authentication.
- `GET /supplier/requirements` – fetch approved requirements (supplier token required).

## Deployment
This backend can be hosted for free on services like Render or Railway:
1. Create a new Node.js project on the platform.
2. Add environment variables from `.env`.
3. Set the start command to `npm start` and deploy.
