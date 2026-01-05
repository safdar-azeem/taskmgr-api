import { Team } from '../models/team.model'
import { User } from '../models/user.model'
import { AppError } from '../utils/AppError'
import { Response, NextFunction } from 'express'
import { catchAsync } from '../utils/catchAsync'
import { ApiFeatures } from '../utils/apiFeatures'
import { AuthRequest } from '../middleware/auth.middleware'

export const createTeam = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { name, description, members } = req.body

    const newTeam = await Team.create({
      name,
      description,
      members: members || [],
      createdBy: req.user._id,
    })

    if (!newTeam.members.includes(req.user._id)) {
      newTeam.members.push(req.user._id)
      await newTeam.save()
    }

    res.status(201).json({
      status: 'success',
      data: { team: newTeam },
    })
  }
)

export const getAllTeams = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const defaultFilter = {
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    }

    const { data, pageInfo } = await new ApiFeatures(Team, req.query, defaultFilter)
      .search(['name', 'description'])
      .populate('members', 'name email')
      .execute()

    res.status(200).json({
      status: 'success',
      results: data.length,
      data: { teams: data },
      pageInfo,
    })
  }
)

export const getTeam = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const team = await Team.findById(req.params.id).populate('members', 'name email')

  if (!team) {
    return next(new AppError('No team found with that ID', 404))
  }

  const isMember = team.members.some((member: any) => member._id.equals(req.user._id))
  const isCreator = team.createdBy.equals(req.user._id)

  if (!isMember && !isCreator) {
    return next(new AppError('You do not have permission to view this team', 403))
  }

  res.status(200).json({
    status: 'success',
    data: { team },
  })
})

export const updateTeam = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const team = await Team.findOne({ _id: req.params.id, createdBy: req.user._id })

    if (!team) {
      return next(new AppError('No team found or you are not the owner', 404))
    }

    const updatedTeam = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      status: 'success',
      data: { team: updatedTeam },
    })
  }
)

export const addMember = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { userId } = req.body
  const team = await Team.findOne({ _id: req.params.id, createdBy: req.user._id })

  if (!team) {
    return next(new AppError('No team found or you are not the owner', 404))
  }

  const userToAdd = await User.findById(userId)
  if (!userToAdd) {
    return next(new AppError('User not found', 404))
  }

  if (team.members.includes(userId)) {
    return next(new AppError('User is already a member of this team', 400))
  }

  team.members.push(userId)
  await team.save()

  res.status(200).json({
    status: 'success',
    data: { team },
  })
})
