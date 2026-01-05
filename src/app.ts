import cors from 'cors'
import helmet from 'helmet'
import xss from 'xss-clean'
import express from 'express'
import rateLimit from 'express-rate-limit'
import { AppError } from './utils/AppError'
import authRoutes from './routes/auth.routes'
import taskRoutes from './routes/task.routes'
import teamRoutes from './routes/team.routes'
import mongoSanitize from 'express-mongo-sanitize'

const app = express()

// Security Middleware
app.set('trust proxy', 1)
app.use(helmet())

app.use(
  cors({
    origin: ['https://taskmgr-client.vercel.app', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
)

app.use(express.json())

// Rate Limiting
const limiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 1500,
  message: 'Too many requests to api endpoint, please try again later',
  validate: { xForwardedForHeader: false },
})
app.use('/api', limiter)

// Data Sanitization
app.use(mongoSanitize())
app.use(xss())

// Routes
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Task Management API is running...' })
})

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/teams', teamRoutes)

// 404 Handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })
})

export default app
