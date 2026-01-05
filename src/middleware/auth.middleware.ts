import jwt from 'jsonwebtoken'
import { User } from '../models/user.model'
import { AppError } from '../utils/AppError'
import { catchAsync } from '../utils/catchAsync'
import { Request, Response, NextFunction } from 'express'

export interface AuthRequest extends Request {
  user?: any
}

export const protect = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401))
  }

  const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string)

  const currentUser = await User.findById(decoded.id)
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer does exist.', 401))
  }

  req.user = currentUser
  next()
})
