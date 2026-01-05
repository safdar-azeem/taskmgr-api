import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { User } from '../models/user.model'

process.env.JWT_SECRET = 'test-jwt-secret-key'
process.env.JWT_EXPIRES_IN = '1h'
process.env.NODE_ENV = 'test'

import app from '../app'

// Mock Bull Queue to avoid Redis connection in tests
jest.mock('../queue/email.queue', () => ({
  sendEmail: jest.fn(),
}))

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  // Start the In-Memory MongoDB instance
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  // Ensure we are disconnected from any other DB
  await mongoose.disconnect()

  // Connect Mongoose to the In-Memory DB
  await mongoose.connect(mongoUri)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

beforeEach(async () => {
  // Clear the database between tests
  await User.deleteMany({})
})

describe('Auth Endpoints', () => {
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  }

  // TEST 1: Registration Success
  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201', async () => {
      const res = await request(app).post('/api/auth/register').send(userData)

      expect(res.statusCode).toBe(201)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toContain('User registered successfully')

      const user = await User.findOne({ email: userData.email })
      expect(user).toBeTruthy()
      expect(user?.isValid).toBe(false)
    })

    // TEST 2: Duplicate Email Validation
    it('should not register user with existing email', async () => {
      await User.create(userData)
      const res = await request(app).post('/api/auth/register').send(userData)

      expect(res.statusCode).not.toBe(201)
    })
  })

  // TEST 3: Login Validation
  describe('POST /api/auth/login', () => {
    it('should return error if user is not verified', async () => {
      await User.create(userData)

      const res = await request(app).post('/api/auth/login').send({
        email: userData.email,
        password: userData.password,
      })

      expect(res.statusCode).toBe(401)
      expect(res.body.message).toBe('Please verify your email first')
    })
  })
})
