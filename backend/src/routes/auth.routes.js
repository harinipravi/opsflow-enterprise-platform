import { Router } from 'express';
import { login, register } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
