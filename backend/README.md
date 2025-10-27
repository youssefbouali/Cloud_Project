# FitTrack Backend

NestJS backend for FitTrack application using Prisma ORM and PostgreSQL (AWS RDS).

## Prerequisites

- Node.js 18+
- PostgreSQL (AWS RDS or local)
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update `.env` file with your AWS RDS connection details:

```
DATABASE_URL=postgresql://user:password@your-rds-endpoint:5432/fittrack
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Replace:
- `user` - Your RDS master username
- `password` - Your RDS master password
- `your-rds-endpoint` - Your RDS endpoint (e.g., `fittrack-db.xxxxx.us-east-1.rds.amazonaws.com`)
- `fittrack` - Your database name

### 3. Set Up Database

#### Generate Prisma Client

```bash
npm run prisma:generate
```

#### Run Migrations

```bash
npm run prisma:migrate
```

This will create the database schema based on the Prisma schema.

#### Seed Database (Optional)

```bash
npm run prisma:seed
```

This creates test users and activities for development.

## Running the Backend

### Development Mode (with hot reload)

```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user

### Activities

- `GET /api/activities` - Get all activities
- `GET /api/activities/user/:userId` - Get activities for specific user
- `GET /api/activities/:id` - Get single activity
- `POST /api/activities` - Create activity (requires JWT token)
- `DELETE /api/activities/:id` - Delete activity (requires JWT token)

### Health Check

- `GET /api/health` - Health check endpoint

## Database Schema

### User Model
- `id` - Unique identifier
- `email` - User email (unique)
- `password` - Hashed password
- `createdAt` - Created timestamp
- `updatedAt` - Updated timestamp

### Activity Model
- `id` - Unique identifier
- `type` - Activity type (Course, Marche, Vélo, Natation, Gym)
- `date` - Activity date
- `duration` - Duration in minutes
- `distance` - Distance in km
- `photo` - Base64 encoded photo (optional)
- `ownerId` - Reference to User
- `createdAt` - Created timestamp
- `updatedAt` - Updated timestamp

## Prisma Commands

- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run pending migrations
- `npm run prisma:studio` - Open Prisma Studio (visual database explorer)
- `npm run prisma:seed` - Seed database with test data

## Troubleshooting

### Database Connection Issues

1. Check that DATABASE_URL is correctly formatted
2. Verify RDS security group allows incoming connections on port 5432
3. Confirm credentials are correct

### CORS Issues

Update `FRONTEND_URL` in `.env` to match your frontend URL:

```
FRONTEND_URL=http://localhost:3000
```

For production, set to your actual frontend domain:

```
FRONTEND_URL=https://your-frontend-domain.com
```

## Learn More

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
