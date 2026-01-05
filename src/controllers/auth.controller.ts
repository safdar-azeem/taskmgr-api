import jwt from 'jsonwebtoken'
import { User } from '../models/user.model'
import { AppError } from '../utils/AppError'
import { catchAsync } from '../utils/catchAsync'
import { sendEmail } from '../queue/email.queue'
import { Request, Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN as any,
  })
}

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await User.create({
    name,
    email,
    password,
    otp,
    otpExpires,
    isValid: false,
  })

  // Send Email
  const message = `Your OTP for account verification is: ${otp}. It is valid for 10 minutes.`
  sendEmail(email, 'Verify Your Account', message)

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully. Please check your email for OTP.',
  })
})

export const verifyOTP = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    return next(new AppError('Please provide email and OTP', 400))
  }

  const user: any = await User.findOne({ email }).select('+otp +otpExpires')

  if (!user) {
    return next(new AppError('User not found', 404))
  }

  if (user.isValid) {
    return next(new AppError('User is already verified', 400))
  }

  if (user.otpExpires < new Date()) {
    return next(new AppError('OTP has expired', 400))
  }

  const isMatch = await user.correctOTP(otp, user.otp)
  if (!isMatch) {
    return next(new AppError('Invalid OTP', 400))
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: { isValid: true },
      $unset: { otp: 1, otpExpires: 1 },
    },
    { new: true }
  )

  const token = signToken(user._id.toString())

  res.status(200).json({
    status: 'success',
    token,
    data: { user: updatedUser },
  })
})

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400))
  }

  const user: any = await User.findOne({ email }).select('+password')

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401))
  }

  if (!user.isValid) {
    return next(new AppError('Please verify your email first', 401))
  }

  const token = signToken(user._id.toString())

  res.status(200).json({
    status: 'success',
    token,
    data: { user },
  })
})

export const getMe = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  })
})

export const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  })
})
