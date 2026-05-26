import { Router } from 'express';
import { login, me, register } from '../../controllers/authController';
import { validateDto } from '../../middlewares/validateDto';
import { authenticate } from '../../middlewares/authMiddleware';
import { authLimiter } from '../../middlewares/rateLimitMiddleware';
import { RegisterUserDto } from '../../../infrastructure/validators/auth/RegisterUserDto';
import { LoginUserDto } from '../../../infrastructure/validators/auth/LoginUserDto';

const router = Router();

router.post('/register', authLimiter, validateDto(RegisterUserDto), register);
router.post('/login', authLimiter, validateDto(LoginUserDto), login);
router.get('/me', authenticate, me);

export default router;
