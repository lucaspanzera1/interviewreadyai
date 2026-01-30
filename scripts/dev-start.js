#!/usr/bin/env node

const { spawn } = require('child_process');
const waitOn = require('wait-on');

/**
 * Development startup script with proper service orchestration
 */
async function startDevelopment() {
  console.log('🚀 Starting TreinaVagaAI development environment...\n');

  try {
    // Step 1: Start MongoDB container
    console.log('📦 Starting MongoDB container...');
    await runCommand('pnpm', ['docker:up']);
    
    // Step 2: Wait for MongoDB to be ready
    console.log('⏳ Waiting for MongoDB to be ready...');
    await waitOn({
      resources: ['tcp:localhost:27017'],
      timeout: 30000,
      interval: 1000
    });
    console.log('✅ MongoDB is ready!\n');

    // Step 3: Start backend and frontend concurrently
    console.log('🎯 Starting backend and frontend servers...\n');
    
    const concurrentProcess = spawn('pnpm', ['dev:services'], {
      stdio: 'inherit',
      shell: true
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development environment...');
      concurrentProcess.kill('SIGINT');
      process.exit(0);
    });

    concurrentProcess.on('exit', (code) => {
      if (code !== 0) {
        console.log(`\n❌ Development environment exited with code ${code}`);
        process.exit(code);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start development environment:', error.message);
    process.exit(1);
  }
}

/**
 * Run a command and wait for it to complete
 */
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.stderr.on('data', (data) => {
      output += data.toString();
    });

    proc.on('exit', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${output}`));
      }
    });
  });
}

// Run if called directly
if (require.main === module) {
  startDevelopment();
}

module.exports = { startDevelopment };