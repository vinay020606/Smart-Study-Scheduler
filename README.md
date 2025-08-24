# Smart Study Scheduler

A comprehensive web application for managing study schedules, tracking study sessions, and organizing academic tasks. Built with Node.js, Express, MongoDB, and React.

## Features

### 🎯 Core Functionality
- **User Authentication**: Secure login/register system with JWT tokens
- **Task Management**: Create, organize, and track study tasks with priorities and due dates
- **Study Sessions**: Timer-based study sessions with break management and productivity tracking
- **Schedule Management**: Weekly study schedules with time blocks and conflict detection
- **Progress Analytics**: Comprehensive study statistics and progress tracking

### 📊 Dashboard
- Real-time study statistics overview
- Active study session monitoring
- Quick action buttons for common tasks
- Recent tasks and study sessions
- Visual progress indicators

### 🔐 Security Features
- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- Input validation and sanitization
- Rate limiting and security headers

## Tech Stack

### Backend
- **Node.js** with **Express.js** framework
- **MongoDB** with **Mongoose** ODM
- **TypeScript** for type safety
- **JWT** for authentication
- **bcrypt** for password hashing
- **express-validator** for input validation
- **Helmet** for security headers
- **CORS** for cross-origin requests

### Frontend
- **React 19** with **TypeScript**
- **React Router** for navigation
- **Context API** for state management
- **CSS3** with modern design patterns
- **Responsive design** for all devices

## Project Structure

```
smart-study-scheduler/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-study-scheduler
JWT_SECRET=your-secret-key-here
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the client directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `GET /api/users/stats` - Get study statistics

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/overdue` - Get overdue tasks
- `GET /api/tasks/upcoming` - Get upcoming tasks

### Study Sessions
- `GET /api/study-sessions` - Get all sessions
- `POST /api/study-sessions` - Start new session
- `GET /api/study-sessions/active` - Get active session
- `PUT /api/study-sessions/:id/pause` - Pause session
- `PUT /api/study-sessions/:id/resume` - Resume session
- `PUT /api/study-sessions/:id/complete` - Complete session
- `GET /api/study-sessions/stats/summary` - Get session statistics

### Schedules
- `GET /api/schedules` - Get all schedules
- `POST /api/schedules` - Create new schedule
- `GET /api/schedules/:id` - Get specific schedule
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule
- `PUT /api/schedules/:id/toggle` - Toggle schedule status

## Database Models

### User
- Personal information (name, email, avatar)
- Study preferences and settings
- Study statistics and progress tracking

### Task
- Task details (title, description, subject)
- Priority levels and status tracking
- Due dates and time estimates
- Tags and attachments

### StudySession
- Session timing and duration
- Subject and task association
- Break management
- Productivity metrics

### Schedule
- Weekly time blocks
- Recurring patterns
- Conflict detection
- Exception handling

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

## Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics and reporting
- [ ] Integration with calendar applications
- [ ] Study group features
- [ ] AI-powered study recommendations
- [ ] Offline mode support
