import {Router} from 'express';
import userRouter from './userRoutes.js';
import authRouter from './authRoutes.js'
import budgetRouter from './budgetRoutes.js'
import categoryRouter from './categoryRoutes.js'
import receiptRouter from './receiptRoutes.js';
import sharedItemRouter from './sharedItemRoutes.js'
import transationRouter from './transationRoutes.js'

const router = Router();
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/budgets', budgetRouter);
router.use('/categories', categoryRouter);
router.use('/receipts', receiptRouter);
router.use('/shared-items', sharedItemRouter);
router.use('/transations', transationRouter);
export default router;