import { Request, Response } from 'express';
import transactionService from '../services/transactionService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

class TransactionController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { categoryId, budgetId, type, startDate, endDate } = req.query as Record<string, string>;

    const transactions = await transactionService.findAll(userId, {
  ...(categoryId !== undefined && { categoryId }),
  ...(budgetId !== undefined && { budgetId }),
  ...(type !== undefined && { type }),
  ...(startDate !== undefined && { startDate }),
  ...(endDate !== undefined && { endDate }),
});

    res.json({ success: true, data: transactions });
  });

  getOne = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const transaction = await transactionService.findById(req.params.id as string, userId);

    res.json({ success: true, data: transaction });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const transaction = await transactionService.create({ ...req.body, userId });

    res.status(201).json({ success: true, data: transaction });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const transaction = await transactionService.update(req.params.id as string, userId, req.body);

    res.json({ success: true, data: transaction });
  });

  remove = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    await transactionService.delete(req.params.id as string, userId);

    res.json({ success: true, message: 'Transaction deleted successfully' });
  });
}

export default new TransactionController();
