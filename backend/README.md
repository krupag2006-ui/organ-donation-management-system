# Organ Donation & Transplant Management System Backend

## Overview
This backend is built with Node.js, Express, MongoDB, Mongoose, and JWT authentication. It provides user registration, login, and profile retrieval for roles: `admin`, `donor`, `recipient`, and `hospital`.

## Setup
1. Open a terminal in `backend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```ini
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/organ-donation-db
   JWT_SECRET=your_jwt_secret_here
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```

## Available API Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user and return JWT
- `GET /api/auth/profile` - Get logged-in user profile (requires `Authorization: Bearer <token>`)

## Folder Structure
- `config/` - MongoDB connection setup
- `controllers/` - Route handler logic
- `middleware/` - JWT auth middleware
- `models/` - Mongoose schemas
- `routes/` - Express routers
- `utils/` - Error handling middleware
- `server.js` - Express app entrypoint

## Notes
- Ensure MongoDB is running locally or update `MONGO_URI` to point to your database.
- Do not commit `.env` to source control.
