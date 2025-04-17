#!/usr/bin/env node

/**
 * This script is meant to be run manually after the initial deployment
 * to set up the production database.
 * 
 * Usage:
 * 1. Set up your production database (e.g., on Supabase, Neon, etc.)
 * 2. Set the DATABASE_URL environment variable in your Netlify dashboard
 * 3. Run this script from the Netlify CLI or via a manual build hook
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Setting up production database...');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Run migrations
  console.log('🚀 Running database migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  // Seed the database if needed
  const shouldSeed = process.env.SEED_DATABASE === 'true';
  if (shouldSeed) {
    console.log('🌱 Seeding the database...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
  }
  
  console.log('✅ Database setup completed successfully!');
} catch (error) {
  console.error('❌ Error setting up the database:', error);
  process.exit(1);
}
