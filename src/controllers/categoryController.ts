//this is the file which controls the logic what is in the routes
import { Request, Response } from 'express';
import categoryServices from '../services/categoryServices';
import { asyncHandler } from '../utils/asyncHandler';
import { success } from 'zod';

class CategoryController {
    getAll = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId
        const categories = await categoryServices.findAll(userId);
        res.json({ success: true, data: categories });
    })
    create = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId
        const category = await categoryServices.create({ ...req.body, userId });
        res.status(201).json({ success: true, data: category })// here it is category before it was categories because we wanted all the list of categories
    })
    update = asyncHandler(async(req:Request, res:Response)=>{
        const userId = req.user!.userId
        const category = await categoryServices.update(req.params.id as string, userId, req.body);
        res.json({success:true, data:category});
    })
    remove = asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.userId
        await categoryServices.delete(req.params.id as string, userId);
        res.json({ success: true, message: 'Category deleted successfully' })
    })

}
export default new CategoryController;