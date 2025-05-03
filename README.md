# NeatPeek - Design QA Analysis SaaS

## Project Overview

NeatPeek is a SaaS platform that analyzes design frames against brand guidelines and provides feedback through Figma comments. It uses AI-powered analysis to ensure design consistency and adherence to brand guidelines.

## Technical Stack & Tools

- Next.js 14+ (App Router)
- PostgreSQL as the database
- Prisma ORM with TypeScript
- Vercel for deployment

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database server
- Figma account for integration testing

### Database Setup

1. Install PostgreSQL on your machine or use a cloud service (like Railway, Supabase, etc.)

2. Create a database named `neatpeekdb`:

   ```
   CREATE DATABASE neatpeekdb;
   ```

3. Create a user and grant privileges (adjust as needed for your setup):

   ```
   CREATE USER neatpeekuser WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE neatpeekdb TO neatpeekuser;
   ```

4. Update the `.env` file with your database credentials:
   ```
   DATABASE_URL="postgresql://neatpeekuser:your_secure_password@localhost:5432/neatpeekdb?schema=public"
   ```

### Installation

1. Clone the repository

   ```
   git clone <repository-url>
   cd neatpeek
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Generate Prisma client

   ```
   npm run prisma:generate
   ```

4. Run database migrations

   ```
   npm run prisma:migrate:dev
   ```

5. Seed the database with initial data

   ```
   npm run prisma:seed
   ```

6. Start the development server

   ```
   npm run dev
   ```

7. Open [http://localhost:4455](http://localhost:4455) in your browser

## Database Schema

The database schema includes these core models:

- **User and Account Models**: For user authentication and management
- **Subscription Models**: For handling different subscription tiers
- **Brand Models**: For storing brand guidelines and design examples
- **Design Analysis Models**: For storing analysis results and feedback
- **Figma Integration Models**: For tracking Figma files and frames

### Migration Process

When updating the database schema, follow these steps:

1. Update the `prisma/schema.prisma` file with your changes
2. Run `npm run prisma:migrate:dev -- --name descriptive_migration_name` to create a new migration
3. Commit both the schema changes and the generated migration files

### Development Guidelines

- Use the singleton Prisma client instance from `src/lib/prisma.ts`
- Use the database helper functions in `src/lib/db.ts` for common operations
- Add new helper functions as needed for specific business logic

## Contributing

[Add contribution guidelines here]

## License

[Add license information here]
