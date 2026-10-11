import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { getDashboard } from '../controllers/dashboardController.js'
const router = Router()
router.get('/', requireAuth, requireAdmin, getDashboard)
export default router
