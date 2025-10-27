# FitTrack

FitTrack is a lightweight workout and progress tracker application built with Next.js frontend and NestJS backend.

## Project Structure

```
fittrack/
├── frontend/              # Next.js TypeScript frontend
│   ├── pages/            # Next.js pages
│   ├── components/       # React components
│   ├── context/          # React Context (DataContext)
│   ├── lib/              # API client utilities
│   ├── styles/           # Global styles
│   └── package.json
│
├── backend/              # NestJS TypeScript backend
│   ├── src/              # Source code
│   │   ├── main.ts       # Entry point
│   │   ├── app.module.ts # Root module
│   │   ├── auth/         # Authentication module
│   │   ├── activities/   # Activities module
│   │   ├── users/        # Users module
│   │   └── prisma/       # Database service
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
│
└── package.json          # Root package.json with monorepo scripts
```

## Technology Stack

### Frontend
- **Next.js 13** - React framework with built-in SSR and routing
- **TypeScript** - Type-safe JavaScript
- **React Context API** - State management
- **CSS** - Global styling

### Backend
- **NestJS** - TypeScript backend framework
- **Prisma** - ORM for database operations
- **PostgreSQL** - Database (AWS RDS)
- **JWT** - Authentication
- **Passport.js** - Authentication middleware

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (AWS RDS)

## Quick Start

### 1. Clone and Install Dependencies

```bash
npm install
```

This installs dependencies for root, frontend, and backend.

### 2. Set Up Environment Variables

#### Backend Configuration

Create/update `backend/.env`:

```
DATABASE_URL=postgresql://user:password@your-rds-endpoint:5432/fittrack
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

#### Frontend Configuration

Create/update `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Initialize Database

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed  # Optional: seed with test data
```

### 4. Run Development Servers

```bash
npm run dev
```

This starts both:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

## Available Scripts

### Root Level

- `npm run dev` - Start both backend and frontend in development mode
- `npm run dev:backend` - Start only backend
- `npm run dev:frontend` - Start only frontend
- `npm run build` - Build both frontend and backend
- `npm run start` - Run production builds of both
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed database with test data

### Frontend Only

```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
```

### Backend Only

```bash
cd backend
npm run dev      # Development server with watch
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
npm run test     # Run tests
```

## Features

- **User Authentication** - Sign up and login with email
- **Activity Management** - Create, view, and delete workout activities
- **Activity Types** - Course, Marche, Vélo, Natation, Gym
- **Photo Support** - Attach photos to activities
- **JWT Authorization** - Secure API endpoints with JWT tokens
- **Database Persistence** - Store data in PostgreSQL

## API Documentation

### Authentication Endpoints

#### Sign Up
```
POST /api/auth/signup
Body: { email: string, password: string }
Response: { user: { id, email }, token: string }
```

#### Login
```
POST /api/auth/login
Body: { email: string, password: string }
Response: { user: { id, email }, token: string }
```

### Activities Endpoints

#### Get All Activities
```
GET /api/activities
Response: Activity[]
```

#### Get User's Activities
```
GET /api/activities/user/:userId
Response: Activity[]
```

#### Get Single Activity
```
GET /api/activities/:id
Response: Activity
```

#### Create Activity (Requires JWT)
```
POST /api/activities
Headers: Authorization: Bearer <token>
Body: {
  type: string,
  date: string,
  duration: number,
  distance: number,
  photo?: string (base64)
}
Response: Activity
```

#### Delete Activity (Requires JWT)
```
DELETE /api/activities/:id
Headers: Authorization: Bearer <token>
Response: Activity
```

### Health Check
```
GET /api/health
Response: { status: string, message: string }
```

## Database Schema

### Users
- `id` (String) - Primary key
- `email` (String) - Unique email
- `password` (String) - Password field
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- Relations: `activities`

### Activities
- `id` (String) - Primary key
- `type` (String) - Activity type
- `date` (String) - Activity date
- `duration` (Int) - Duration in minutes
- `distance` (Float) - Distance in km
- `photo` (String) - Base64 photo (optional)
- `ownerId` (String) - Foreign key to User
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- Relations: `owner` (User)

## Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing
- `NODE_ENV` - Environment (development/production)
- `PORT` - Backend server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:5000)

## Deployment

### Deploy to Production

1. Update environment variables for production
2. Build both frontend and backend:
   ```bash
   npm run build
   ```
3. Deploy using your preferred hosting service

### Backend Deployment Options
- Heroku
- Railway
- AWS EC2
- Google Cloud Run
- DigitalOcean

### Frontend Deployment Options
- Vercel
- Netlify
- AWS Amplify
- GitHub Pages
- Azure Static Web Apps

## AWS RDS Setup

### Create RDS Database

1. Go to AWS RDS Console
2. Click "Create database"
3. Choose PostgreSQL engine
4. Configure:
   - DB instance identifier: `fittrack-db`
   - Master username: `postgres`
   - Master password: (set a strong password)
   - Database name: `fittrack`
5. Configure security group to allow inbound connections on port 5432
6. Get the endpoint from the database details page

### Connection String Format

```
postgresql://username:password@endpoint:5432/database_name
```

Example:
```
postgresql://postgres:mypassword@fittrack-db.123456.us-east-1.rds.amazonaws.com:5432/fittrack
```

## Development Guidelines

### TypeScript
- All files should use `.ts` or `.tsx` extensions
- Maintain strict type checking
- Define interfaces for API responses

### Code Style
- Use prettier for formatting
- Follow NestJS convention for backend code
- Follow React best practices for frontend code

### Git Workflow
- Create feature branches from `main`
- Commit messages should be clear and descriptive
- Create pull requests for code review

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL format
- Check RDS security group inbound rules
- Ensure RDS instance is running

### CORS Errors
- Update `FRONTEND_URL` in backend `.env`
- Ensure backend is running on correct port
- Check browser console for specific error

### Port Already in Use
- Change port in backend `.env`
- Ensure no other services using same port

## Support

For issues and feature requests, please create an issue in the repository.

## License

MIT
