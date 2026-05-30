# Organ Donation & Transplant Management System

A full-stack web application for managing organ donors, recipients, hospitals, transplant requests, donor-recipient matching, analytics, and role-based user access.

The project is built with a React + Vite frontend and a Node.js + Express + MongoDB backend.

## Features

- User registration and login with JWT authentication
- Role-based access for admin, donor, recipient, and hospital users
- Donor management with availability and medical details
- Recipient management with urgency level, diagnosis, and organ requirements
- Hospital management with capacity, emergency availability, and organ availability
- Transplant request tracking with pending, approved, rejected, and completed statuses
- Matching system for donor-recipient compatibility workflows
- Analytics dashboard for transplant and system overview
- User profile management
- Demo seed script for presentation data

## Tech Stack

**Frontend**

- React
- Vite
- React Router
- Axios
- Bootstrap
- Bootstrap Icons
- Recharts

**Backend**

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- dotenv
- CORS

## Project Structure

```text
dbms-pro/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    scripts/
    utils/
    server.js
    package.json
  frontend/
    src/
      components/
      context/
      pages/
      services/
      styles/
      utils/
    index.html
    package.json
```

## Prerequisites

Install these before running the project:

- Node.js
- npm
- MongoDB running locally, or a MongoDB connection string

## Backend Setup

Open a terminal in the backend folder:

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```ini
PORT=5000
MONGO_URI=mongodb://localhost:27017/organ-donation-db
JWT_SECRET=replace_with_a_secure_secret
```

Start the backend server:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

## Frontend Setup

Open a second terminal in the frontend folder:

```bash
cd frontend
npm install
```

Optional: create a `.env.local` file inside `frontend/` if the backend API URL is different:

```ini
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

The frontend usually runs on:

```text
http://localhost:5173
```

## Demo Data

The backend includes a presentation seed script:

```bash
cd backend
node scripts/presentationSeed.js
```

Make sure MongoDB is running and `backend/.env` contains a valid `MONGO_URI` before running the script.

## API Routes

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in and receive a JWT token
- `GET /api/auth/profile` - Get the current user profile
- `PUT /api/auth/profile` - Update the current user profile

### Donors

- `GET /api/donors` - List donors
- `POST /api/donors` - Create a donor
- `PUT /api/donors/:id` - Update a donor
- `DELETE /api/donors/:id` - Delete a donor

### Recipients

- `GET /api/recipients` - List recipients
- `POST /api/recipients` - Create a recipient
- `PUT /api/recipients/:id` - Update a recipient
- `DELETE /api/recipients/:id` - Delete a recipient

### Hospitals

- `GET /api/hospitals` - List hospitals
- `POST /api/hospitals` - Create a hospital
- `PUT /api/hospitals/:id` - Update a hospital
- `DELETE /api/hospitals/:id` - Delete a hospital

### Transplant Requests

- `GET /api/transplant-requests` - List transplant requests
- `POST /api/transplant-requests` - Create a transplant request
- `PUT /api/transplant-requests/:id` - Update a transplant request
- `PATCH /api/transplant-requests/:id/status` - Update request status
- `DELETE /api/transplant-requests/:id` - Delete a transplant request

## Presentation Flow

1. Start MongoDB.
2. Start the backend with `npm run dev`.
3. Start the frontend with `npm run dev`.
4. Register or log in as a user.
5. Show the dashboard overview.
6. Demonstrate donors, recipients, hospitals, and transplant requests.
7. Open the matching page to show donor-recipient matching.
8. Open analytics to show system-level insights.
9. Update the profile page to show authenticated user features.

## Build Check

To verify the frontend production build:

```bash
cd frontend
npm run build
```

## Important Notes

- Do not commit real `.env` files or secrets.
- Keep MongoDB running before starting the backend.
- The frontend uses `http://localhost:5000/api` by default.
- Use strong random values for `JWT_SECRET` in real deployments.

## License

MIT
