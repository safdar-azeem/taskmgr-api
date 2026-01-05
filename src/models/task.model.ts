import mongoose from 'mongoose'
import { TaskDocument, TaskModel } from 'mongoose.gen'

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'A task must have a title'] },
    description: { type: String },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: { type: Date },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
    },
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    teamId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Team',
    },
    // For Kanban Board
    position: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

taskSchema.index({ user: 1 })
taskSchema.index({ assignedTo: 1 })
taskSchema.index({ teamId: 1 })
taskSchema.index({ status: 1 })
taskSchema.index({ title: 'text', description: 'text' })

export const Task = mongoose.model<TaskDocument, TaskModel>('Task', taskSchema)
