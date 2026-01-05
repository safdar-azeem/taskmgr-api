import express from 'express'
import {
  getAllTeams,
  createTeam,
  getTeam,
  updateTeam,
  addMember,
} from '../controllers/team.controller'
import { protect } from '../middleware/auth.middleware'

const router = express.Router()

router.use(protect)

router.route('/').get(getAllTeams).post(createTeam)

router.route('/:id').get(getTeam).put(updateTeam)

router.route('/:id/members').post(addMember)

export default router
