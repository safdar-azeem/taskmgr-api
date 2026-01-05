import { Task } from '../models/task.model'
import { AppError } from '../utils/AppError'
import { Response, NextFunction } from 'express'
import { catchAsync } from '../utils/catchAsync'
import { ApiFeatures } from '../utils/apiFeatures'
import { AuthRequest } from '../middleware/auth.middleware'

export const getAllTasks = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const defaultFilter = {
      $or: [{ user: req.user._id }, { assignedTo: req.user._id }],
    }

    const { data, pageInfo } = await new ApiFeatures(Task, req.query, defaultFilter)
      .search(['title', 'description'])
      .populate('assignedTo', 'name email')
      .execute()

    res.status(200).json({
      status: 'success',
      results: data.length,
      data: { tasks: data },
      pageInfo,
    })
  }
)

export const createTask = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.body.user) req.body.user = req.user._id
    if (!req.body.assignedTo) req.body.assignedTo = req.user._id

    const newTask = await Task.create(req.body)

    res.status(201).json({
      status: 'success',
      data: { task: newTask },
    })
  }
)

export const getTask = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const task = await Task.findById(req.params.id).populate('assignedTo', 'name')

  if (!task) {
    return next(new AppError('No task found with that ID', 404))
  }

  if (
    task.user.toString() !== req.user._id.toString() &&
    task.assignedTo?.toString() !== req.user._id.toString()
  ) {
    return next(new AppError('No task found with that ID', 404))
  }

  res.status(200).json({
    status: 'success',
    data: { task },
  })
})

export const updateTask = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return next(new AppError('No task found with that ID', 404))
    }

    if (
      task.user.toString() !== req.user._id.toString() &&
      task.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return next(new AppError('Not authorized to update this task', 403))
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      status: 'success',
      data: { task: updatedTask },
    })
  }
)

export const deleteTask = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id })

    if (!task) {
      return next(new AppError('No task found with that ID or unauthorized', 404))
    }

    res.status(204).json({
      status: 'success',
      data: null,
    })
  }
)

// Kept for backward compatibility, but getAllTasks now handles search too
export const searchTasks = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { q } = req.query

    if (!q) {
      return next(new AppError('Please provide a search query', 400))
    }

    const tasks = await Task.find({
      $text: { $search: q as string },
      $or: [{ user: req.user._id }, { assignedTo: req.user._id }],
    })

    res.status(200).json({
      status: 'success',
      results: tasks.length,
      data: { tasks },
    })
  }
)

export const getTaskStats = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const stats = await Task.aggregate([
      {
        $match: {
          $or: [{ user: req.user._id }, { assignedTo: req.user._id }],
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          tasks: { $push: { title: '$title', dueDate: '$dueDate' } },
        },
      },
    ])

    res.status(200).json({
      status: 'success',
      data: { stats },
    })
  }
)
