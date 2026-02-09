#!/usr/bin/env node

/**
 * Script para corrigir os tipos de pacotes
 * Execute com: node scripts/fix-package-types.js
 */

const mongoose = require('mongoose');

// Conectar ao MongoDB
async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/treinavaga';
  await mongoose.connect(mongoUri);
  console.log('✅ Conectado ao MongoDB');
}

// Schemas simplificados para o script
const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  color: String,
  active: { type: Boolean, default: true }
});

const TokenPackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  tokenAmount: { type: Number, required: true, min: 1 },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  features: [String],
  active: { type: Boolean, default: true },
  validityDays: Number,
  value: Number,
  externalId: String,
  packageType: { type: String, enum: ['subscription', 'token_boost', 'test'], default: 'subscription' }
}, { timestamps: true });

const Role = mongoose.model('Role', RoleSchema);
const TokenPackage = mongoose.model('TokenPackage', TokenPackageSchema);

async function fixPackageTypes() {
  try {
    await connectDB();

    console.log('🔧 Corrigindo tipos de pacotes...');

    // Buscar pacotes atuais
    const packages = await TokenPackage.find({}).populate('role').exec();
    console.log('Pacotes encontrados:');
    packages.forEach(p => console.log(`- ${p.name}: ${p.packageType} (role: ${p.role?.name})`));

    // Corrigir tipos
    const updates = [
      {
        name: 'Teste',
        newType: 'test',
        reason: 'Pacote de teste não deve alterar cargo'
      },
      {
        name: 'Boost Pack',
        newType: 'token_boost',
        reason: 'Pacote de boost deve apenas adicionar tokens'
      }
    ];

    for (const update of updates) {
      const result = await TokenPackage.findOneAndUpdate(
        { name: update.name },
        { packageType: update.newType },
        { new: true }
      );

      if (result) {
        console.log(`✅ ${update.name} atualizado para ${update.newType}`);
        console.log(`   Motivo: ${update.reason}`);
      } else {
        console.log(`❌ ${update.name} não encontrado`);
      }
    }

    // Verificar resultado final
    const updatedPackages = await TokenPackage.find({}).populate('role').exec();
    console.log('\n📋 Pacotes após correção:');
    updatedPackages.forEach(p => console.log(`- ${p.name}: ${p.packageType} (role: ${p.role?.name})`));

  } catch (error) {
    console.error('❌ Erro ao corrigir pacotes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📪 Desconectado do MongoDB');
  }
}

if (require.main === module) {
  fixPackageTypes();
}