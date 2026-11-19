//business logic for the category and what is the services that this app is providing for the client
import { db } from "../../prisma/db"; //db.orm.public...
import { NotFoundError, ForbiddenError } from "../utils/errors";

// build interfaces in this schema defining the datastructure of the interfaces

interface CreateCategoryData {
    userId: string
    name: string
    type?: string
    color?: string
    icon?: string// these ? indicate that these fields are backed by the default values and are not nessessary
}

interface UpdateCategoryData {
    // here since we are updating the userid is passed in the body
    name?: string
    type?: string
    color?: string
    icon?: string
}

class CategoryService {
    async findAll(userId: string) {
        return (db.orm.public.Category as any).findMany({
            where: {
                OR: [{ isDefault: true }, { userId }],
            },
            orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
        });
    }
    async create(data: CreateCategoryData) {
        return db.orm.public.Category.create({

            userId: data.userId,
            name: data.name,
            type: data.type ?? 'expense',
            color: data.color ?? null,
            icon: data.icon ?? null,
            isDefault: false,

        });
    }
    async update(id: string, userId: string, data: UpdateCategoryData) {
        const category = await db.orm.public.Category.whereUnique({ id }).first();
        if (!category) throw new NotFoundError('Category not found');
        if (category.isDefault) throw new ForbiddenError('Cannot modify default categories');
        if (category.userId !== userId) throw new ForbiddenError('Access denied');
        return (db.orm.public.Category as any).update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.type !== undefined && { type: data.type }),
                ...(data.color !== undefined && { color: data.color }),
                ...(data.icon !== undefined && { icon: data.icon }),
            },
        });
    }
        async delete(id:string, userId: string){
            const category = await db.orm.public.Category.whereUnique({id}).first();
            if(!category) throw new NotFoundError('Category not found');
            if (category.isDefault) throw new ForbiddenError('Cannot modify default categories');
            if(category.userId !== userId) throw new ForbiddenError('Access Denied');
            await db.orm.public.Category.whereUnique({id}).delete()
        }
}
export default new CategoryService;