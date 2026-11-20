
import { db } from "../../prisma/db";
import { and } from "@prisma/orm-postgres/orm-client";
import { NotFoundError, ForbiddenError } from "../utils/errors";

interface CreateBudgetData {
  userId: string;
  categoryId: string;
  name: string;
  amount: number;
  currency?: string;
  period: string;
  startDate: string;
  endDate?: string;
}

interface UpdateBudgetData {
  name?: string;
  amount?: number;
  currency?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

class BudgetService {

  // Get all budgets belonging to a user
  async findAll(userId: string) {
    const budgets = await db.orm.public.Budget
      .where({ userId })
      .include("category")
      .orderBy((b) => b.createdAt.desc())
      .all();

    return Promise.all(
      budgets.map((budget) => this.withProgress(budget))
    );
  }

  // Get one budget by ID
  async findById(id: string, userId: string) {
    const budget = await db.orm.public.Budget
      .include("category")
      .whereUnique({ id })
      .first();

    if (!budget) {
      throw new NotFoundError("Budget not found");
    }

    if (budget.userId !== userId) {
      throw new ForbiddenError("Access denied");
    }

    return this.withProgress(budget);
  }

  // Create a new budget
  async create(data: CreateBudgetData) {
    const created = await db.orm.public.Budget.create({
      userId: data.userId,
      categoryId: data.categoryId,
      name: data.name,
      amount: String(data.amount),
      currency: data.currency ?? "USD",
      period: data.period,
      startDate: new Date(data.startDate),
      ...(data.endDate && {
        endDate: new Date(data.endDate),
      }),
    });

    // Fetch the created budget with its category relation
    const budget = await db.orm.public.Budget
      .include("category")
      .whereUnique({ id: created.id })
      .first();

    if (!budget) {
      throw new NotFoundError("Created budget could not be retrieved");
    }

    return this.withProgress(budget);
  }

  // Update an existing budget
  async update(
    id: string,
    userId: string,
    data: UpdateBudgetData
  ) {
    const budget = await db.orm.public.Budget
      .whereUnique({ id })
      .first();

    if (!budget) {
      throw new NotFoundError("Budget not found");
    }

    if (budget.userId !== userId) {
      throw new ForbiddenError("Access denied");
    }

    const updated = await db.orm.public.Budget
      .where({ id })
      .update({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.amount !== undefined && { amount: String(data.amount) }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.period !== undefined && { period: data.period }),
        ...(data.startDate !== undefined && {
          startDate: new Date(data.startDate),
        }),
        ...(data.endDate !== undefined && {
          endDate: new Date(data.endDate),
        }),
        ...(data.isActive !== undefined && {
          isActive: data.isActive,
        }),
      });

    if (!updated) {
      throw new NotFoundError("Budget could not be updated");
    }

    const budgetWithCategory = await db.orm.public.Budget
      .include("category")
      .whereUnique({ id: updated.id })
      .first();

    if (!budgetWithCategory) {
      throw new NotFoundError("Updated budget could not be retrieved");
    }

    return this.withProgress(budgetWithCategory);
  }

  // Delete a budget
  async delete(id: string, userId: string) {
    const budget = await db.orm.public.Budget
      .whereUnique({ id })
      .first();

    if (!budget) {
      throw new NotFoundError("Budget not found");
    }

    if (budget.userId !== userId) {
      throw new ForbiddenError("Access denied");
    }

    await db.orm.public.Budget
      .where({ id })
      .delete();
  }

  // Calculate budget spending and progress
  private async withProgress(budget: any) {
    const periodStart = this.getPeriodStart(
      budget.period,
      budget.startDate
    );

    const result = await db.orm.public.Transaction
      .where((t) =>
        and(
          t.userId.eq(budget.userId),
          t.categoryId.eq(budget.categoryId),
          t.type.eq("expense"),
          t.date.gte(periodStart)
        )
      )
      .aggregate((agg) => ({
        spent: agg.sum("amount"),
      }));

    const spent = Number(result.spent ?? 0);
    const limit = Number(budget.amount);

    const remaining = limit - spent;

    const percentage =
      limit > 0
        ? Math.round((spent / limit) * 100)
        : 0;

    return {
      ...budget,
      amount: limit,
      progress: {
        spent,
        remaining,
        percentage,
        isOverBudget: spent > limit,
        isNearLimit: percentage >= 80 && percentage < 100,
      },
    };
  }

  // Determine the beginning of the current budget period
  private getPeriodStart(period: string, startDate: Date): Date {
    const now = new Date();

    switch (period) {
      case "daily":
        return new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate()
          )
        );

      case "weekly": {
        const day = now.getUTCDay();
        const diff =
          now.getUTCDate() - day + (day === 0 ? -6 : 1);

        return new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            diff
          )
        );
      }

      case "monthly":
        return new Date(
          Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            1
          )
        );

      case "yearly":
        return new Date(
          Date.UTC(now.getUTCFullYear(), 0, 1)
        );

      default:
        return startDate;
    }
  }
}

export default new BudgetService();
