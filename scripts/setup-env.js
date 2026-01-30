#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Setup environment files for development
 * Copies .env.example files to .env if they don't exist
 */
function setupEnvironmentFiles() {
  console.log('🔧 Setting up environment files...\n');

  const envFiles = [
    {
      example: '.env.example',
      target: '.env',
      description: 'Root environment file'
    },
    {
      example: 'packages/backend/.env.example',
      target: 'packages/backend/.env',
      description: 'Backend environment file'
    },
    {
      example: 'packages/frontend/.env.example',
      target: 'packages/frontend/.env',
      description: 'Frontend environment file'
    }
  ];

  let hasChanges = false;

  envFiles.forEach(({ example, target, description }) => {
    if (!fs.existsSync(target)) {
      if (fs.existsSync(example)) {
        fs.copyFileSync(example, target);
        console.log(`✅ Created ${target} from ${example}`);
        hasChanges = true;
      } else {
        console.log(`⚠️  Warning: ${example} not found, skipping ${description}`);
      }
    } else {
      console.log(`ℹ️  ${target} already exists, skipping`);
    }
  });

  if (hasChanges) {
    console.log('\n📝 Environment files created! Please update them with your actual values:');
    console.log('   - Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)');
    console.log('   - JWT secret (JWT_SECRET)');
    console.log('   - MongoDB URI if different from defaults');
  } else {
    console.log('\n✨ All environment files are already set up!');
  }

  console.log('\n🚀 You can now run: pnpm dev');
}

/**
 * Check if required tools are available
 */
function checkPrerequisites() {
  const requirements = [
    { command: 'docker', description: 'Docker (for MongoDB container)' },
    { command: 'docker-compose', description: 'Docker Compose' }
  ];

  console.log('🔍 Checking prerequisites...\n');

  const { execSync } = require('child_process');
  let allGood = true;

  requirements.forEach(({ command, description }) => {
    try {
      execSync(`${command} --version`, { stdio: 'ignore' });
      console.log(`✅ ${description} is available`);
    } catch (error) {
      console.log(`❌ ${description} is not available`);
      allGood = false;
    }
  });

  if (!allGood) {
    console.log('\n⚠️  Some prerequisites are missing. Please install them before continuing.');
    console.log('   Docker: https://docs.docker.com/get-docker/');
    process.exit(1);
  }

  console.log('\n✨ All prerequisites are available!\n');
}

// Main execution
if (require.main === module) {
  try {
    checkPrerequisites();
    setupEnvironmentFiles();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

module.exports = { setupEnvironmentFiles, checkPrerequisites };