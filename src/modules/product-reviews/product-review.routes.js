import { Router } from 'express';
import { addReview } from './product-review.controller.js';
import checkPermission from '../../middlewares/checkPermission.js';

const router = Router();

router.post('/add', checkPermission.verifyToken, addReview);

export default router; 