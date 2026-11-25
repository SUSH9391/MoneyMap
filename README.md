# Budget Management API

Clean Node.js/Express API with PostgreSQL, Prisma, and JWT authentication.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Server runs at: http://localhost:3000
```

## Completed Features

### Authentication
- User registration & login
- Short-lived JWT access tokens (15m) + long-lived refresh tokens (30d)
- Refresh token rotation with single-use enforcement
- Reuse detection — revoked token triggers full-account revocation
- Bcrypt password hashing (10 rounds)
- Forgot password via email (nodemailer) with time-limited deep-link token (60m)
- Password reset with atomic transaction (updates password + revokes all refresh tokens)

### Budget Management
- Full CRUD for budgets (create, list, get, update, delete)
- Budget progress calculation (spent vs. limit)

### Category Management
- 11 default seeded categories
- Custom category creation, update, and deletion per user

### Transaction Management
- Full CRUD for transactions
- Filtering support (by date range, category, type)
- Automatic budget linkage via category

### Receipt Scanning (OCR Pipeline)
- Receipt image upload (multipart/form-data via multer)
- OCR processing — Google Cloud Vision + LLM item extraction
- Receipt item review and editing
- Confirm receipt → atomically creates transactions

### Infrastructure
- 4-layer architecture: Routes → Controllers → Services → Database
- Zod validation on all endpoints
- Custom error classes with consistent HTTP status codes
- Winston logging + Morgan HTTP request logs
- Helmet, CORS, rate limiting

## Project Structure

```
src/
├── config/           # Configuration & database client
├── controllers/      # Request handlers (auth, budget, category, transaction, receipt)
├── services/         # Business logic
├── middleware/        # Auth, validate, errorHandler
├── routes/           # API route definitions
├── validators/       # Zod schemas
├── utils/            # jwt, password, email, ocr, errors, refreshToken
└── models/           # TypeScript types

prisma/
├── schema.prisma     # 7-model database schema
├── migrations/       # Versioned migrations
└── seed.ts           # Seeds 11 default categories
```

## API Endpoints

### Health
- `GET /` — API info
- `GET /health` — Health check

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login, returns access + refresh tokens
- `POST /api/auth/refresh` — Rotate refresh token, returns new pair
- `POST /api/auth/forgot-password` — Send password reset email
- `POST /api/auth/reset-password` — Reset password via token
- `GET /api/auth/me` — Get current user *(protected)*
- `POST /api/auth/logout` — Revoke refresh token *(protected)*

### Budgets *(all protected)*
- `GET /api/budgets` — List all budgets
- `GET /api/budgets/:id` — Get budget with progress
- `POST /api/budgets` — Create budget
- `PUT /api/budgets/:id` — Update budget
- `DELETE /api/budgets/:id` — Delete budget

### Categories *(all protected)*
- `GET /api/categories` — List all categories (default + custom)
- `POST /api/categories` — Create custom category
- `PUT /api/categories/:id` — Update category
- `DELETE /api/categories/:id` — Delete category

### Transactions *(all protected)*
- `GET /api/transactions` — List transactions (with filters)
- `GET /api/transactions/:id` — Get transaction
- `POST /api/transactions` — Create manual transaction
- `PUT /api/transactions/:id` — Update transaction
- `DELETE /api/transactions/:id` — Delete transaction


## Testing

### Postman Collection
```bash
# Import into Postman:
1. moneymap-backend-testsuite.json
```
See [POSTMAN.md](./docs/POSTMAN.md) for detailed guide.

### Jest Tests
```bash
npm test                   # Run all tests
npm run test:coverage      # With coverage report
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:watch         # Watch mode
```

## Database Commands

```bash
npm run db:migrate   # Run migrations
npm run db:seed      # Seed default categories
npm run db:studio    # Open Prisma Studio GUI
npm run db:push      # Push schema changes
```

## Environment Variables

```env
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5433/dbname"

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:5173

# Email (nodemailer)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=your-smtp-password


# Deep links (password reset)
APP_SCHEME=myledger
```

## Architecture

**4-Layer design (Clean SRP)**:
- **Routes** — map HTTP verbs/paths to controller methods
- **Controllers** — parse request, call service, return response
- **Services** — business logic, DB queries via Prisma
- **Utils** — jwt, bcrypt, email, OCR, error helpers

**Security**:
- Short-lived JWT (15m) + opaque refresh tokens (30d, SHA-256 hashed in DB)
- Single-use token rotation; reuse detection triggers account-wide revocation
- Bcrypt (10 rounds), Zod validation, Helmet headers, rate limiting

## Documentation

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — DDIA-aligned system design study guide
- [AUTH.md](./docs/AUTH.md) — Auth API reference (all 7 endpoints)
- [REFRESH_TOKEN.md](./docs/REFRESH_TOKEN.md) — Refresh token design deep-dive
- [DEEP_LINKS_AND_PASSWORD_RESET.md](./docs/DEEP_LINKS_AND_PASSWORD_RESET.md) — Deep links + password reset flow
- [DATABASE.md](./docs/DATABASE.md) — Schema, models, seed data
- [TESTING.md](./docs/TESTING.md) — Testing guide (Jest + Supertest)
- [POSTMAN.md](./docs/POSTMAN.md) — Postman collection guide
- [REQUIREMENTS.md](./docs/REQUIREMENTS.md) — Full functional & non-functional requirements

## Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| Runtime | Node.js | v22 |
| Framework | Express.js | 5.3.x |
| Language | TypeScript | 7.0.x |
| Database | PostgreSQL | 8.23.x (pg driver) |
| Auth | JWT + bcryptjs | 9.0.x / 3.0.x |
| Validation | Zod | 4.6.x |
| Email | Nodemailer | 10.6.x |
| Security | Helmet, CORS | 8.3.x / 2.8.x |
| Logging | Morgan | 1.12.x |
| Middleware | Compression, dotenv | 1.8.x / 18.0.x |
| Development | tsx | 4.23.x |

## License

ISC
