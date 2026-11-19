
import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../prisma/db.js";

// All seed users share this password
const SEED_PASSWORD = "Password123!";

const seedUsers = [
  {
    email: "alice@example.com",
    firstName: "Alice",
    lastName: "Martin",
    displayName: "alice_m",
    isDiscoverable: true,
    onboardingDone: true,
  },
  {
    email: "bob@example.com",
    firstName: "Bob",
    lastName: "Chen",
    displayName: "bob_chen",
    isDiscoverable: true,
    onboardingDone: true,
  },
  {
    email: "carol@example.com",
    firstName: "Carol",
    lastName: "Nguyen",
    displayName: "carol_n",
    isDiscoverable: true,
    onboardingDone: false,
  },
  {
    email: "dave@example.com",
    firstName: "Dave",
    lastName: "Patel",
    displayName: "dave_p",
    isDiscoverable: true,
    onboardingDone: true,
  },
  {
    email: "eve@example.com",
    firstName: "Eve",
    lastName: "Torres",
    displayName: "eve_t",
    isDiscoverable: false,
    onboardingDone: true,
  },
];

const defaultCategories = [
  { name: "Groceries", type: "expense", color: "#4CAF50", icon: "cart.fill", isDefault: true },
  { name: "Dining Out", type: "expense", color: "#FF9800", icon: "cup.and.saucer.fill", isDefault: true },
  { name: "Transportation", type: "expense", color: "#2196F3", icon: "car.fill", isDefault: true },
  { name: "Utilities", type: "expense", color: "#9C27B0", icon: "lightbulb.fill", isDefault: true },
  { name: "Entertainment", type: "expense", color: "#E91E63", icon: "film.fill", isDefault: true },
  { name: "Healthcare", type: "expense", color: "#F44336", icon: "cross.case.fill", isDefault: true },
  { name: "Shopping", type: "expense", color: "#FF5722", icon: "bag.fill", isDefault: true },
  { name: "Other", type: "expense", color: "#607D8B", icon: "archivebox.fill", isDefault: true },
  { name: "Salary", type: "income", color: "#8BC34A", icon: "dollarsign.circle.fill", isDefault: true },
  { name: "Freelance", type: "income", color: "#CDDC39", icon: "briefcase.fill", isDefault: true },
  { name: "Investment", type: "income", color: "#FFC107", icon: "chart.bar.fill", isDefault: true },
] satisfies Array<{
  name: string;
  type: "expense" | "income";
  color: string;
  icon: string;
  isDefault: boolean;
}>;

async function main() {
  console.log("Starting seed...");

  // 1. Seed default categories
  for (const category of defaultCategories) {
    const existing = await db.orm.public.Category
      .where({ name: category.name, isDefault: true })
      .first();

    if (existing) {
      await db.orm.public.Category
        .whereUnique({ id: existing.id })
        .update(category);
    } else {
      await db.orm.public.Category.create(category);
    }
  }

  console.log(`Upserted ${defaultCategories.length} categories`);

  // 2. Seed users
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const upsertedUsers: Record<string, string> = {};

  for (const userData of seedUsers) {
    const user = await db.orm.public.User.upsert({
      create: {
        ...userData,
        password: passwordHash,
      },
      update: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: userData.displayName,
        isDiscoverable: userData.isDiscoverable,
        onboardingDone: userData.onboardingDone,
      },
      conflictOn: { email: userData.email },
    });

    upsertedUsers[userData.email] = user.id;

    console.log(`Seeded user: ${userData.displayName}`);
  }

  console.log(`Upserted ${seedUsers.length} users`);
  console.log("Seeding completed successfully!");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.close();
  });
