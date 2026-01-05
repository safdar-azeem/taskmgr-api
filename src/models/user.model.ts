import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { UserDocument, UserModel } from 'mongoose.gen'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Please tell us your name!'], trim: true },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
      trim: true,
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isValid: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('otp') || !this.otp) return next()
  this.otp = await bcrypt.hash(this.otp, 12)
  next()
})

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.correctOTP = async function (candidateOTP: string, userOTP: string) {
  return await bcrypt.compare(candidateOTP, userOTP)
}

export const User = mongoose.model<UserDocument, UserModel>('User', userSchema)
