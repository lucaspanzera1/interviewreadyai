// MongoDB initialization script for TreinaVagaAI App

// Switch to the treinavagaai database
db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE || 'treinavagaai');

// Create application user with read/write permissions
db.createUser({
  user: process.env.MONGO_APP_USER || 'treinavagaai_user',
  pwd: process.env.MONGO_APP_PASSWORD || 'treinavagaai_password',
  roles: [
    { role: 'readWrite', db: process.env.MONGO_INITDB_DATABASE || 'treinavagaai' }
  ]
});

// Create indexes for users collection
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ googleId: 1 }, { unique: true, sparse: true });
db.users.createIndex({ createdAt: -1 });

// Create indexes for addresses collection
db.createCollection('addresses');
db.addresses.createIndex({ userId: 1 });

print('TreinaVagaAI database initialized successfully');
