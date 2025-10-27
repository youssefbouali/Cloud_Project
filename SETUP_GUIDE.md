# FitTrack Setup Guide

This guide will walk you through setting up the FitTrack project locally with a NestJS backend and Next.js frontend connected to AWS RDS.

## Prerequisites

Before you start, ensure you have:

- **Node.js** 18 or higher (download from [nodejs.org](https://nodejs.org))
- **npm** (comes with Node.js)
- **Git** (optional, for version control)
- **PostgreSQL** running on AWS RDS or locally

## Step 1: Clone or Download the Project

```bash
# If using git
git clone <your-repository-url>
cd fittrack

# Or download the ZIP file and extract it
cd fittrack
```

## Step 2: Create AWS RDS Database

### If you don't have an RDS instance yet:

1. **Go to AWS RDS Console**: https://console.aws.amazon.com/rds/

2. **Create Database**:
   - Click "Create database"
   - Choose **PostgreSQL** engine
   - Select version: 14 or higher

3. **Configuration**:
   - **DB instance identifier**: `fittrack-db`
   - **Master username**: `postgres`
   - **Master password**: Create a strong password and save it
   - **Database name**: `fittrack`
   - **Storage**: 20GB (default is fine for development)
   - **Publicly accessible**: Yes (for development; set to No in production)

4. **Security Group**:
   - Click "Create new security group"
   - Name: `fittrack-sg`
   - After creation, edit the security group to allow inbound traffic:
     - **Type**: PostgreSQL
     - **Protocol**: TCP
     - **Port**: 5432
     - **Source**: 0.0.0.0/0 (for development; restrict in production)

5. **Get Connection Details**:
   - Once the database is created, go to the database details page
   - Copy the **Endpoint** (e.g., `fittrack-db.xxxxx.us-east-1.rds.amazonaws.com`)
   - The port is **5432** (default)
   - Username: `postgres`
   - Password: (the one you created)
   - Database name: `fittrack`

## Step 3: Install Dependencies

```bash
# Install root dependencies
npm install

# This automatically installs dependencies for frontend and backend
```

## Step 4: Configure Environment Variables

### Backend Configuration

1. **Edit `backend/.env`**:

```bash
# Replace with your actual RDS connection details
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@fittrack-db.xxxxx.us-east-1.rds.amazonaws.com:5432/fittrack
JWT_SECRET=your_super_secret_key_change_this_in_production
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**Replace:**
- `YOUR_PASSWORD` - Your RDS master password
- `fittrack-db.xxxxx.us-east-1.rds.amazonaws.com` - Your RDS endpoint
- `your_super_secret_key_change_this_in_production` - A random secret string (generate one with `openssl rand -hex 32`)

### Frontend Configuration

The frontend `.env.local` is already configured for local development:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production, change to your backend URL:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## Step 5: Initialize the Database

### Generate Prisma Client

```bash
npm run prisma:generate
```

### Run Database Migrations

```bash
npm run prisma:migrate
```

This creates all tables in your RDS database based on the schema.

### (Optional) Seed Database with Test Data

```bash
npm run prisma:seed
```

This creates test users and activities for development:
- User 1: `user1@example.com` / `password123`
- User 2: `user2@example.com` / `password123`

## Step 6: Start Development Servers

```bash
npm run dev
```

This starts both servers concurrently:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

Wait for both servers to start before opening the app.

## Step 7: Test the Application

1. Open http://localhost:3000 in your browser
2. Click "Sign Up" and create a test account
3. Log in with your account
4. Go to Dashboard and add some activities
5. Verify activities are saved and displayed

## Troubleshooting

### Error: "Cannot connect to database"

**Solution:**
1. Check your DATABASE_URL is correct
2. Verify RDS instance is running (check AWS RDS console)
3. Verify security group allows port 5432 inbound
4. Test connection with:
   ```bash
   psql "postgresql://postgres:PASSWORD@ENDPOINT:5432/fittrack"
   ```

### Error: "CORS error" or "Failed to fetch from API"

**Solution:**
1. Ensure backend is running on port 5000
2. Check FRONTEND_URL in `backend/.env` matches your frontend URL
3. Check NEXT_PUBLIC_API_URL in `frontend/.env.local`

### Error: "Port already in use"

**Solution:**
```bash
# Find and kill process on port 5000 (backend)
lsof -i :5000
kill -9 <PID>

# Or change port in backend/.env
PORT=5001
```

### Error: "@nestjs/config not found"

**Solution:**
```bash
cd backend
npm install @nestjs/config
```

### Error: "Prisma client not generated"

**Solution:**
```bash
npm run prisma:generate
```

## Useful Commands

```bash
# Development
npm run dev                    # Start both frontend and backend
npm run dev:frontend          # Start only frontend
npm run dev:backend           # Start only backend

# Building
npm run build                 # Build both frontend and backend
npm run build:frontend        # Build only frontend
npm run build:backend         # Build only backend

# Database
npm run prisma:generate       # Generate Prisma client
npm run prisma:migrate        # Run pending migrations
npm run prisma:studio         # Open Prisma Studio (visual explorer)
npm run prisma:seed           # Seed database with test data

# Linting
npm --prefix backend run lint # Lint backend code
```

## Project Structure

```
fittrack/
├── frontend/                 # Next.js frontend
│   ├── pages/               # Routes and pages
│   ├── components/          # React components
│   ├── context/             # React Context for state
│   ├── lib/                 # Utilities (API client)
│   ├── styles/              # Global styles
│   ├── .env.local          # Frontend config
│   └── package.json
│
├── backend/                  # NestJS backend
│   ├── src/
│   │   ├── main.ts          # Entry point
│   │   ├── app.module.ts    # Root module
│   │   ├── auth/            # Authentication
│   │   ├── activities/      # Activities CRUD
│   │   ├── users/           # User management
│   │   └── prisma/          # Database service
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Test data
│   ├── .env                 # Backend config
│   └── package.json
│
├── package.json             # Root config
└── README.md               # Project documentation
```

## Deployment

### Deploy Backend (NestJS)

1. **Build the backend:**
   ```bash
   npm run build:backend
   ```

2. **Deploy to platform** (e.g., Heroku, Railway, Google Cloud Run):
   - Follow platform-specific deployment instructions
   - Set environment variables:
     - `DATABASE_URL` (your RDS endpoint)
     - `JWT_SECRET` (strong random string)
     - `NODE_ENV=production`
     - `FRONTEND_URL` (your frontend URL)

### Deploy Frontend (Next.js)

1. **Push code to Git** (GitHub, GitLab, etc.)

2. **Deploy to Vercel** (recommended for Next.js):
   - Connect your GitHub/GitLab repository
   - Set environment variables:
     - `NEXT_PUBLIC_API_URL` (your backend URL)
   - Deploy with one click

3. **Or deploy to other platforms**:
   - Build: `npm run build:frontend`
   - Start: `npm start`
   - Follow platform-specific instructions

## Security Notes

1. **Never commit `.env` files** with real credentials
2. **Use strong JWT_SECRET** in production
3. **Set RDS security group** to restrict access in production
4. **Use HTTPS** for production deployments
5. **Change default credentials** before going live

## Support and Resources

- **NestJS Documentation**: https://docs.nestjs.com
- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **AWS RDS Documentation**: https://docs.aws.amazon.com/rds/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

## What's Next?

- Add more activity types
- Implement photo upload to cloud storage (S3, CloudFront)
- Add activity filtering and search
- Implement workout statistics and analytics
- Add social features (sharing, comments)
- Set up CI/CD pipeline
- Add comprehensive test coverage

Happy tracking! 🏃‍♂️💪
