import 'dotenv/config';
import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';

export default definePrismaConfig({
  orm: ormConfig({
    contract: "prisma/contract.prisma",
    db: {
      connection: (globalThis as typeof globalThis & {
        process?: { env?: Record<string, string | undefined> };
      }).process?.env?.['DATABASE_URL']!,
    },
    migrations: {
      dir: "prisma/migrations",
    }
  }),
});
