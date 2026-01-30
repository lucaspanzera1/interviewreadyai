/**
 * Development Configuration
 * Centralized configuration for development environment
 */

module.exports = {
  // Port configurations
  ports: {
    frontend: 3000,
    backend: 3001,
    mongodb: 27017,
  },

  // Database configuration (MongoDB)
  database: {
    host: 'localhost',
    port: 27017,
    username: 'admin',
    password: 'password',
    database: 'treinavagaai',
    authSource: 'admin'
  },

  // API configuration
  api: {
    baseUrl: 'http://localhost:3001',
    timeout: 10000,
    cors: {
      origin: 'http://localhost:3000',
      credentials: true
    }
  },

  // Hot reload configuration
  hotReload: {
    backend: {
      watch: ['src/**/*.ts'],
      ignore: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
      preserveWatchOutput: true
    },
    frontend: {
      host: '0.0.0.0',
      port: 3000,
      open: false,
      hmr: true
    }
  },

  // Logging configuration
  logging: {
    level: 'debug',
    colorize: true,
    timestamp: true
  }
};