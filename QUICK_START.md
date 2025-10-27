# Quick Start Guide

Get FitTrack running in 5 minutes!

## Prerequisites

- Node.js 18+
- AWS RDS PostgreSQL instance

## Setup (First Time Only)

```bash
# 1. Install all dependencies
npm install

# 2. Configure database connection
# Edit backend/.env and add your RDS connection string:
# DATABASE_URL=postgresql://user:pass@your-rds-endpoint:5432/fittrack

# 3. Set up database
npm run prisma:migrate

# 4. (Optional) Seed with test data
npm run prisma:seed
```

## Running Locally

```bash
# Start both frontend and backend
npm run dev

# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## First Steps

1. Open http://localhost:3000
2. Click "Sign Up" and create an account
3. Go to Dashboard
4. Add your first activity
5. Enjoy tracking your workouts! 🏃‍♂️

## Stopping Servers

Press `Ctrl+C` in the terminal where you ran `npm run dev`

## Common Tasks

### Check if database is set up
```bash
npm run prisma:studio
```
Opens a visual database explorer in your browser.

### Clear and reset database
```bash
cd backend
npx prisma migrate reset
cd ..
```

### Start only backend
```bash
npm run dev:backend
```

### Start only frontend
```bash
npm run dev:frontend
```

### Build for production
```bash
npm run build
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@host:5432/fittrack
JWT_SECRET=your-secret-key
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Troubleshooting

**Port 5000 in use?**
```bash
# Kill the process or change PORT in backend/.env
```

**Database connection error?**
```bash
# Check your DATABASE_URL is correct
# Verify RDS instance is running
# Check security group allows port 5432
```

**CORS error in browser?**
```bash
# Make sure backend is running
# Check FRONTEND_URL in backend/.env matches
```

## Reset Everything

```bash
# Stop the servers first (Ctrl+C)

# Clear node modules and reinstall
rm -rf node_modules frontend/node_modules backend/node_modules
npm install

# Reset database
cd backend
npx prisma migrate reset
npm run prisma:seed
cd ..

# Start fresh
npm run dev
```

## Deploy

### Backend
- Build: `npm run build:backend`
- Deploy to: Heroku, Railway, Google Cloud Run, etc.

### Frontend
- Push to GitHub
- Deploy via Vercel (easiest for Next.js)

---

**Need more help?** Check out `SETUP_GUIDE.md` for detailed instructions.
