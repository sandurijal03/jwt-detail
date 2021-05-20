import { Router } from 'express';
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
} from '../controllers/auth.controllers';

const router = Router();

router.post('/register', registerController);

router.post('/login', loginController);

router.post('/refresh-token', refreshTokenController);

router.delete('/logout', logoutController);

export default router;
