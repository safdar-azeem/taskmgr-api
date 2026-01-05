# TaskMgr API - Task Management System Backend

A robust, scalable RESTful API for a task management system built with Node.js, Express, TypeScript, and MongoDB. This API powers the TaskMgr application, enabling teams to collaborate effectively through tasks, teams, and user management.

## 🎯 Project Overview

TaskMgr API is a production-ready backend service that provides comprehensive task management capabilities including user authentication with OTP verification, task CRUD operations, team management, and real-time statistics tracking.

## 🚀 Tech Stack

### Core Technologies

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM

### Security & Authentication

- **JWT** - Token-based authentication
- **bcrypt.js** - Password hashing
- **express-mongo-sanitize** - MongoDB injection prevention
- **xss-clean** - XSS attack protection
- **helmet** - HTTP headers security
- **hpp** - HTTP parameter pollution prevention
- **express-rate-limit** - API rate limiting

### Background Jobs & Messaging

- **Bull** - Redis-based queue for background jobs
- **Nodemailer** - Email sending functionality
- **Redis** - Message broker and caching

### Development Tools

- **esbuild** - Fast TypeScript bundler
- **tsx** - TypeScript execution and watch mode
- **jest** - Testing framework
- **supertest** - HTTP assertions
- **mongodb-memory-server** - In-memory MongoDB for testing
- **mongoose-tsgen** - TypeScript type generation from schemas

### DevOps & Deployment

- **Vercel** - Serverless deployment platform
- **GitHub Actions** - CI/CD pipeline
- **Docker** (optional) - Containerization

## 📁 Folder Architecture

```
taskmgr-api/
├── .github/
│   └── workflows/
│       └── build.yml                 # CI/CD workflow configuration
├── .vercel/
│   ├── project.json                  # Vercel project configuration
│   └── README.txt                    # Vercel deployment info
├── src/
│   ├── config/
│   │   └── db.ts                     # MongoDB connection setup
│   ├── controllers/
│   │   ├── auth.controller.ts        # Authentication logic (register, login, OTP)
│   │   ├── task.controller.ts        # Task CRUD operations
│   │   └── team.controller.ts        # Team management operations
│   ├── middleware/
│   │   └── auth.middleware.ts        # JWT authentication middleware
│   ├── models/
│   │   ├── task.model.ts             # Task schema definition
│   │   ├── team.model.ts             # Team schema definition
│   │   └── user.model.ts             # User schema with auth methods
│   ├── queue/
│   │   └── email.queue.ts            # Bull queue for email jobs
│   ├── routes/
│   │   ├── auth.routes.ts            # Authentication endpoints
│   │   ├── task.routes.ts            # Task endpoints
│   │   └── team.routes.ts            # Team endpoints
│   ├── tests/
│   │   └── auth.test.ts              # Authentication integration tests
│   ├── types/
│   │   ├── mongoose.gen.ts           # Auto-generated TypeScript types
│   │   └── xss-clean.d.ts            # XSS clean type definitions
│   ├── utils/
│   │   ├── apiFeatures.ts            # Pagination, filtering, search utilities
│   │   ├── AppError.ts               # Custom error class
│   │   └── catchAsync.ts             # Async error wrapper
│   ├── app.ts                        # Express app configuration
│   └── server.ts                     # Server entry point
├── dist/                             # Compiled JavaScript output
├── .env                              # Environment variables (not in repo)
├── .env.example                      # Environment variables template
├── .gitignore                        # Git ignore rules
├── esbuild.config.js                 # ESBuild configuration
├── jest.config.js                    # Jest test configuration
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript compiler options
├── vercel.json                       # Vercel deployment config
└── README.md                         # This file
```

## 🔧 Setup & Installation

### Prerequisites

- **Node.js** >= 20.x
- **MongoDB** >= 6.0 (local or cloud)
- **Redis** >= 7.0 (for email queue)
- **Yarn** or **npm** package manager

### Installation Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd taskmgr-api
```

2. **Install dependencies**

```bash
yarn install
# or
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=4003

# Database
MONGODB_URI=mongodb://localhost:27017/task-mgmt-db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=1d

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
# REDIS_URL=redis://username:password@host:port (for production)

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

4. **Generate Mongoose TypeScript types**

```bash
yarn mtgen
```

5. **Start development server**

```bash
yarn dev
```

The API will be available at `http://localhost:4003`

6. **Build for production**

```bash
yarn build
```

7. **Start production server**

```bash
yarn start
```

## 📝 Environment Variables

| Variable         | Description                | Required   | Default       |
| ---------------- | -------------------------- | ---------- | ------------- |
| `NODE_ENV`       | Environment mode           | Yes        | `development` |
| `PORT`           | Server port                | Yes        | `4003`        |
| `MONGODB_URI`    | MongoDB connection string  | Yes        | -             |
| `JWT_SECRET`     | Secret key for JWT signing | Yes        | -             |
| `JWT_EXPIRES_IN` | JWT token expiration       | Yes        | `1d`          |
| `REDIS_HOST`     | Redis host address         | Yes (dev)  | `127.0.0.1`   |
| `REDIS_PORT`     | Redis port                 | Yes (dev)  | `6379`        |
| `REDIS_URL`      | Full Redis connection URL  | Yes (prod) | -             |
| `EMAIL_HOST`     | SMTP server host           | Yes        | -             |
| `EMAIL_PORT`     | SMTP server port           | Yes        | `587`         |
| `EMAIL_USER`     | Email account username     | Yes        | -             |
| `EMAIL_PASS`     | Email account password     | Yes        | -             |

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint      | Description                   | Auth Required |
| ------ | ------------- | ----------------------------- | ------------- |
| POST   | `/register`   | Register new user             | No            |
| POST   | `/verify-otp` | Verify OTP after registration | No            |
| POST   | `/login`      | User login                    | No            |
| POST   | `/logout`     | User logout                   | No            |
| GET    | `/me`         | Get current user profile      | Yes           |

### Task Routes (`/api/tasks`)

| Method | Endpoint  | Description                           | Auth Required |
| ------ | --------- | ------------------------------------- | ------------- |
| GET    | `/`       | Get all tasks (paginated, filterable) | Yes           |
| POST   | `/`       | Create new task                       | Yes           |
| GET    | `/:id`    | Get single task by ID                 | Yes           |
| PUT    | `/:id`    | Update task                           | Yes           |
| DELETE | `/:id`    | Delete task                           | Yes           |
| GET    | `/stats`  | Get task statistics                   | Yes           |
| GET    | `/search` | Search tasks                          | Yes           |

### Team Routes (`/api/teams`)

| Method | Endpoint       | Description                           | Auth Required |
| ------ | -------------- | ------------------------------------- | ------------- |
| GET    | `/`            | Get all teams (paginated, filterable) | Yes           |
| POST   | `/`            | Create new team                       | Yes           |
| GET    | `/:id`         | Get single team by ID                 | Yes           |
| PUT    | `/:id`         | Update team                           | Yes           |
| POST   | `/:id/members` | Add member to team                    | Yes           |

## 📊 Features Implemented

### 1. User Authentication & Authorization

- **Registration with OTP Verification**: Users register with email/password and receive a 6-digit OTP via email
- **JWT-based Authentication**: Secure token-based authentication for API access
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Protected Routes**: Middleware-based route protection

### 2. Task Management

- **CRUD Operations**: Complete create, read, update, delete functionality
- **Status Tracking**: Tasks can be in todo, in-progress, review, or done states
- **Priority Levels**: Low, medium, high priority classification
- **Task Assignment**: Assign tasks to specific users
- **Team Association**: Link tasks to teams
- **Due Date Management**: Set and track task deadlines
- **Position Tracking**: Support for Kanban board positioning
- **Search & Filter**: Full-text search on title and description
- **Pagination**: Server-side pagination with configurable limits
- **Statistics**: Aggregate task data by status with counts

### 3. Team Management

- **Team Creation**: Create teams with name and description
- **Member Management**: Add/remove team members
- **Team Lists**: View all teams with member information
- **Access Control**: Only team creators can modify team details

### 4. Email Queue System

- **Background Processing**: Email sending handled by Bull queue
- **Retry Logic**: Automatic retry with exponential backoff
- **Job Monitoring**: Track email job status (completed/failed)
- **Production Ready**: Supports Redis TLS for cloud deployments

### 5. Advanced Query Features

- **ApiFeatures Class**:
  - Pagination (page, limit)
  - Sorting (ascending/descending)
  - Field selection
  - Search (regex-based)
  - Date range filtering (startDate, endDate)
  - Dynamic filtering (gte, gt, lte, lt operators)
  - Population (related documents)

### 6. Security Features

- **Rate Limiting**: 1000 requests per 2 minutes per IP
- **Helmet**: Secure HTTP headers
- **CORS**: Configured for specific origins
- **MongoDB Injection Prevention**: Input sanitization
- **XSS Protection**: Clean user input
- **HPP Protection**: Prevent parameter pollution
- **Password Security**: Never exposed in responses (select: false)

### 7. Error Handling

- **Global Error Handler**: Centralized error processing
- **Custom AppError Class**: Operational vs programming errors
- **CatchAsync Wrapper**: Automatic async error catching
- **Validation Errors**: Mongoose validation with custom messages
- **404 Handler**: Catch-all for undefined routes

### 8. Database Optimization

- **Indexes**: Optimized queries with strategic indexing
  - User: email (unique)
  - Task: user, assignedTo, teamId, status, text search (title, description)
  - Team: members, createdBy
- **Schema Validation**: Built-in Mongoose validation
- **Timestamps**: Automatic createdAt and updatedAt fields

## 🧪 Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage
```

### Test Structure

- **In-Memory MongoDB**: Uses mongodb-memory-server for fast, isolated tests
- **Mocked Dependencies**: Bull queue mocked to avoid Redis dependency
- **Integration Tests**: Full request/response cycle testing
- **Test Coverage**: Authentication flows, validation, error cases

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI**

```bash
yarn global add vercel
```

2. **Configure environment variables in Vercel dashboard**

3. **Deploy**

```bash
vercel --prod
```

### GitHub Actions CI/CD

The project includes a CI/CD pipeline (`.github/workflows/build.yml`) that:

- Installs dependencies
- Builds the project
- Deploys to Vercel on push to main branch

Required GitHub Secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Manual Production Setup

1. **Set production environment variables**

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
```

2. **Build and start**

```bash
yarn build
yarn start
```

## 📜 Scripts

```bash
yarn dev          # Start development server with watch mode
yarn build        # Build TypeScript to JavaScript
yarn start        # Start production server
yarn mtgen        # Generate Mongoose TypeScript types
yarn test         # Run Jest tests
```

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **JWT Secret**: Use strong, random secret in production
3. **CORS**: Restrict to specific domains in production
4. **Rate Limiting**: Adjust limits based on application needs
5. **MongoDB**: Use connection string with authentication
6. **Redis**: Enable TLS/SSL in production
7. **Email**: Use app-specific passwords, not account passwords

**Built with ❤️ by Safdar Azeem**
