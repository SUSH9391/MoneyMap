import { Router } from 'express';
import transactionController from '../controllers/transactionController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createTransactionSchema, updateTransactionSchema } from '../validators/transactionValidators.js'

const router = Router();

router.use(authenticate);

router.get('/', transactionController.getAll);
router.get('/:id', transactionController.getOne);
router.post('/', validate(createTransactionSchema), transactionController.create);
router.put('/:id', validate(updateTransactionSchema), transactionController.update);
router.delete('/:id', transactionController.remove);

export default router;
