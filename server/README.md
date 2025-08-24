# Smart Study Scheduler - Server

This is the Node.js backend for the Smart Study Scheduler application.

## Features

- **RESTful API** with Express.js
- **MongoDB** database with Mongoose ODM
- **JWT Authentication** with bcrypt password hashing
- **Input Validation** with express-validator
- **Security Middleware** with Helmet and CORS
- **TypeScript** for type safety
- **Rate Limiting** and compression

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-study-scheduler
JWT_SECRET=your-secret-key-here
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

4. For production build:
```bash
npm run build
npm start
```

## API Routes

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user
- `POST /refresh` - Refresh JWT token

### Users (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `PUT /password` - Change password
- `GET /stats` - Get study statistics
- `DELETE /profile` - Delete account

### Tasks (`/api/tasks`)
- `GET /` - Get all tasks (with filtering)
- `POST /` - Create new task
- `GET /:id` - Get specific task
- `PUT /:id` - Update task
- `DELETE /:id` - Delete task
- `PUT /:id/status` - Update task status
- `GET /overdue` - Get overdue tasks
- `GET /upcoming` - Get upcoming tasks

### Study Sessions (`/api/study-sessions`)
- `GET /` - Get all sessions (with filtering)
- `POST /` - Start new session
- `GET /active` - Get active session
- `GET /:id` - Get specific session
- `PUT /:id/pause` - Pause session
- `PUT /:id/resume` - Resume session
- `PUT /:id/complete` - Complete session
- `PUT /:id/break` - Add break to session
- `GET /stats/summary` - Get session statistics

### Schedules (`/api/schedules`)
- `GET /` - Get all schedules
- `POST /` - Create new schedule
- `GET /:id` - Get specific schedule
- `PUT /:id` - Update schedule
- `DELETE /:id` - Delete schedule
- `PUT /:id/toggle` - Toggle schedule status
- `PUT /:id/time-blocks` - Add time block
- `DELETE /:id/time-blocks/:blockId` - Remove time block
- `GET /:id/conflicts` - Check for conflicts

## Database Models

### User Model
- Personal information (name, email, avatar)
- Study preferences (theme, notifications)
- Study statistics (total time, sessions, streaks)

### Task Model
- Task details (title, description, subject)
- Priority and status management
- Due dates and time estimates
- Tags and attachments

### StudySession Model
- Session timing and duration
- Subject and task association
- Break management and productivity tracking

### Schedule Model
- Weekly time blocks
- Recurring patterns
- Conflict detection
- Exception handling

## Middleware

- **Authentication** - JWT token verification
- **Validation** - Input sanitization and validation
- **Security** - Helmet, CORS, rate limiting
- **Logging** - Morgan HTTP request logging
- **Compression** - Response compression

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/smart-study-scheduler |
| `JWT_SECRET` | JWT signing secret | fallback-secret |
| `NODE_ENV` | Environment mode | development |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:3000 |

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (not implemented yet)

## Dependencies

### Production
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `express-validator` - Input validation
- `helmet` - Security headers
- `cors` - Cross-origin requests
- `compression` - Response compression
- `express-rate-limit` - Rate limiting
- `morgan` - HTTP request logging

### Development
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution
- `nodemon` - Development server with auto-restart
- `@types/node` - Node.js type definitions

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Security headers with Helmet
- CORS configuration
- Rate limiting
- Request size limits

## Error Handling

- Centralized error handling middleware
- Validation error responses
- Database error handling
- Authentication error handling
- 404 route handling
