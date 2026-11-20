//this is the controller layer which controles the route 
import { Request, Response } from 'express';
import budgetService from '../services/budgetService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

class BudgetController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const budgets = await budgetService.findAll(userId);

    res.json({ success: true, data: budgets });
  });

  getOne = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const budget = await budgetService.findById(req.params.id as string, userId);

    res.json({ success: true, data: budget });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const budget = await budgetService.create({ ...req.body, userId });

    res.status(201).json({ success: true, data: budget });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const budget = await budgetService.update(req.params.id as string, userId, req.body);

    res.json({ success: true, data: budget });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    await budgetService.delete(req.params.id as string, userId);

    res.json({ success: true, message: 'Budget deleted successfully' });
  });
}

export default new BudgetController();
