import { Router } from 'express';
import budgetController from '../controllers/budgetController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createBudgetSchema, updateBudgetSchema } from '../validators/budgetValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', budgetController.getAll);
router.get('/:id', budgetController.getOne);
router.post('/', validate(createBudgetSchema), budgetController.create);
router.put('/:id', validate(updateBudgetSchema), budgetController.update);
router.delete('/:id', budgetController.remove);

export default router;
