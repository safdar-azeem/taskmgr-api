import express from 'express'
import {
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  getTaskStats,
  searchTasks,
} from '../controllers/task.controller'
import { protect } from '../middleware/auth.middleware'

const router = express.Router()

router.use(protect)

router.route('/stats').get(getTaskStats)
router.route('/search').get(searchTasks)

router.route('/').get(getAllTasks).post(createTask)

router.route('/:id').get(getTask).put(updateTask).delete(deleteTask)

export default router
