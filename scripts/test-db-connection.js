// scripts/test-db-connection.js
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 NETLIFY BUILD: Testing database connection...');
  console.log(`🔌 Testing database connection...`);

  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    // Try a simple query
    console.log('🔄 Executing test query...');
    const result = await prisma.$queryRaw`SELECT current_database() as db_name, current_user as user_name`;

    console.log('✅ DATABASE CONNECTION SUCCESSFUL!');
    console.log(`📊 Connected to database: ${result[0].db_name}`);
    console.log(`👤 Connected as user: ${result[0].user_name}`);

    // Try to query the Plan table to verify our seed data
    console.log('🔄 Checking for Plan records...');
    const plans = await prisma.plan.findMany({
      select: {
        id: true,
        name: true,
        tier: true,
      },
    });

    if (plans.length > 0) {
      console.log(`✅ Found ${plans.length} plans in the database:`);
      plans.forEach(plan => {
        console.log(`   - ${plan.name} (${plan.tier}): ${plan.id}`);
      });
    } else {
      console.log('⚠️ No plans found in the database. You may need to run the seed script.');
    }

    return true;
  } catch (error) {
    console.error('❌ DATABASE CONNECTION FAILED!');
    console.error('🔴 Error details:', error);

    // Additional error information
    if (error.code) {
      console.error(`🔑 Error code: ${error.code}`);
    }

    if (error.message && error.message.includes('SSL')) {
      console.error('🔒 SSL ERROR: Make sure your connection string includes ?sslmode=require');
    }

    if (error.message && error.message.includes('password authentication failed')) {
      console.error('🔑 AUTHENTICATION ERROR: Check your username and password');
    }

    if (error.message && error.message.includes('connect ETIMEDOUT')) {
      console.error('⏱️ TIMEOUT ERROR: Check IP restrictions or network issues');
    }

    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testConnection()
  .then(success => {
    console.log('🏁 Database connection test completed.');
    if (!success) {
      console.log('⚠️ WARNING: The application may not function correctly without database access.');
      // We don't exit with error code to allow the build to complete
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error in test script:', error);
    // We don't exit with error code to allow the build to complete
  });
