
import { db } from "../../prisma/db";
import { and } from "@prisma/orm-postgres/orm-client";
import { NotFoundError, ForbiddenError } from "../utils/errors";

interface CreateTransactionData {
  userId: string;
  categoryId: string;
  budgetId?: string;
  type?: string;
  amount: number;
  description?: string;
  date?: string;
}

interface UpdateTransactionData {
  categoryId?: string;
  budgetId?: string | null;
  type?: string;
  amount?: number;
  description?: string;
  date?: string;
}

interface TransactionFilters {
  categoryId?: string;
  budgetId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

class TransactionService {

  // Get all transactions belonging to a user
  async findAll(userId: string, filters: TransactionFilters = {}) {
    const transactions = await db.orm.public.Transaction
      .where((t) =>
        and(
          t.userId.eq(userId),
          ...(filters.categoryId
            ? [t.categoryId.eq(filters.categoryId)]
            : []),
          ...(filters.budgetId
            ? [t.budgetId.eq(filters.budgetId)]
            : []),
          ...(filters.type
            ? [t.type.eq(filters.type)]
            : []),
          ...(filters.startDate
            ? [t.date.gte(new Date(filters.startDate))]
            : []),
          ...(filters.endDate
            ? [t.date.lte(new Date(filters.endDate))]
            : [])
        )
      )
      .include("category")
      .include("budget")
      .include("receiptItem", (item) =>
        item.include("receipt")
      )
      .orderBy((t) => t.date.desc())
      .all();

    return transactions;
  }

  // Get a transaction by ID
  async findById(id: string, userId: string) {
    const transaction = await db.orm.public.Transaction
      .whereUnique({ id })
      .include("category")
      .include("budget")
      .include("receiptItem", (item) =>
        item.include("receipt")
      )
      .first();

    if (!transaction) {
      throw new NotFoundError("Transaction not found");
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenError("Access denied");
    }

    return transaction;
  }

  // Create a transaction
  async create(data: CreateTransactionData) {
    if (data.budgetId) {
      await this.ensureBudgetAccess(data.budgetId, data.userId);
    }

    const created = await db.orm.public.Transaction.create({
      userId: data.userId,
      categoryId: data.categoryId,
      budgetId: data.budgetId ?? null,
      type: data.type ?? "expense",
      amount:String(data.amount),
      description: data.description ?? null,
      date: data.date ? new Date(data.date) : new Date(),
    });

    // Fetch the created transaction with its relations
    return db.orm.public.Transaction
      .whereUnique({ id: created.id })
      .include("category")
      .include("budget")
      .include("receiptItem", (item) =>
        item.include("receipt")
      )
      .first();
  }

  // Update a transaction
  async update(
    id: string,
    userId: string,
    data: UpdateTransactionData
  ) {
    const transaction = await db.orm.public.Transaction
      .whereUnique({ id })
      .first();

    if (!transaction) {
      throw new NotFoundError("Transaction not found");
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenError("Access denied");
    }

    if (data.budgetId) {
      await this.ensureBudgetAccess(data.budgetId, userId);
    }

    const updated = await db.orm.public.Transaction
      .whereUnique({ id })
      .include("category")
      .include("budget")
      .include("receiptItem", (item) =>
        item.include("receipt")
      )
      .update({
        ...(data.categoryId !== undefined && {
          categoryId: data.categoryId,
        }),
        ...(data.budgetId !== undefined && {
          budgetId: data.budgetId,
        }),
        ...(data.type !== undefined && {
          type: data.type,
        }),
        ...(data.amount !== undefined && {
          amount: String(data.amount),
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.date !== undefined && {
          date: new Date(data.date),
        }),
      });

    if (!updated) {
      throw new NotFoundError("Transaction not found");
    }

    return updated;
  }

  // Delete a transaction
  async delete(id: string, userId: string) {
    const transaction = await db.orm.public.Transaction
      .whereUnique({ id })
      .first();

    if (!transaction) {
      throw new NotFoundError("Transaction not found");
    }

    if (transaction.userId !== userId) {
      throw new ForbiddenError("Access denied");
    }

    await db.orm.public.Transaction
      .whereUnique({ id })
      .delete();
  }

  private async ensureBudgetAccess(budgetId: string, userId: string) {
    const budget = await db.orm.public.Budget
      .whereUnique({ id: budgetId })
      .first();

    if (!budget) {
      throw new NotFoundError("Budget does not exist");
    }

    if (budget.userId !== userId) {
      throw new ForbiddenError("Access denied");
    }
  }
}

export default new TransactionService();
