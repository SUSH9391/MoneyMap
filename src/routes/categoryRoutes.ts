import {Router} from 'express';
import { authenticate } from '../middlewares/auth';
import categoryController from '../controllers/categoryController';
import { createCategorySchema, updateCategorySchema } from '../validators/categoryValidators';
import {validate} from'../middlewares/validate.js';
const router = Router();
router.use(authenticate);

router.get('/', categoryController.getAll);
router.post('/', validate(createCategorySchema),categoryController.create);
router.put('/:id',validate(updateCategorySchema),categoryController.update);
router.delete('/:id',categoryController.remove);
export default router;
