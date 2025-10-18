#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Communication Broker Tool...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  const envContent = `# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/communication_broker"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"
JWT_EXPIRES_IN="1h"

# Email Configuration (for development - use real credentials in production)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_SECURE="false"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@yourcompany.com"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Application
NODE_ENV="development"
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local created! Please update the database and email credentials.\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('pnpm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed!\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated!\n');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

console.log('🎉 Setup complete! Next steps:');
console.log('1. Set up PostgreSQL database and update DATABASE_URL in .env.local');
console.log('2. Configure email settings in .env.local');
console.log('3. Run: npx prisma db push (to create tables)');
console.log('4. Run: pnpm dev (to start development server)');
console.log('\n📚 For more information, check the README.md file.');
