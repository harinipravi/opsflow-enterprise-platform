import { Router } from 'express';
import {
  getDashboardActivity,
  getDashboardStats,
} from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/activity', getDashboardActivity);

export default router;
