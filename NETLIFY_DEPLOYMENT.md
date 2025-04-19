# Netlify Deployment Guide

This guide explains how to deploy the NeatPeek application to Netlify and set up the production database.

## Initial Deployment

1. Push your code to GitHub
2. Log in to Netlify and create a new site from your GitHub repository
3. Configure the build settings:
   - Build command: `npm run netlify-build`
   - Publish directory: `.next`
4. Deploy the site

This will deploy the application without database functionality. The next steps will set up the database.

## Setting Up the Production Database

1. Create a PostgreSQL database using a service like:
   - [Supabase](https://supabase.com/)
   - [Neon](https://neon.tech/)
   - [Railway](https://railway.app/)
   - [Heroku Postgres](https://www.heroku.com/postgres)

2. Get your database connection string, which should look like:
   ```
   postgresql://username:password@host:port/database
   ```

3. Add the database connection string to your Netlify environment variables:
   - Go to Site settings > Environment variables
   - Add a new variable with the key `DATABASE_URL` and your connection string as the value

4. Set up other required environment variables:
   - `NEXTAUTH_URL`: Your Netlify site URL (e.g., https://neatpeek.netlify.app)
   - `NEXTAUTH_SECRET`: A random string for NextAuth.js (generate with `openssl rand -base64 32`)
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (if using Stripe)
   - Any other API keys needed by your application

5. Run the database setup script:
   - Option 1: Using Netlify CLI
     ```
     netlify login
     netlify env:set SEED_DATABASE true # Optional, if you want to seed the database
     netlify functions:invoke setup-prod-db
     ```

   - Option 2: Manually via Netlify UI
     - Go to Site settings > Functions > Trigger deploy
     - This will rebuild the site and run the database setup

6. Verify the database setup:
   - Check the Netlify deploy logs for any errors
   - Test the application functionality that relies on the database

## Troubleshooting

If you encounter issues with the database setup:

1. Check the Netlify deploy logs for specific error messages
2. Verify that your database connection string is correct
3. Make sure your database user has the necessary permissions
4. Try running the database setup script locally with the production database URL:
   ```
   DATABASE_URL=your_production_db_url npm run setup-prod-db
   ```

## Updating the Database Schema

When you make changes to the database schema:

1. Update your Prisma schema locally
2. Run `npx prisma migrate dev` to create a new migration
3. Commit and push the changes to GitHub
4. Deploy to Netlify
5. Run the database setup script again to apply the new migrations

## Custom Domain Setup

To set up a custom domain:

1. Go to Site settings > Domain management
2. Add your custom domain
3. Follow the DNS configuration instructions provided by Netlify
4. Update the `NEXTAUTH_URL` environment variable to use your custom domain
