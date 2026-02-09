#!/usr/bin/env node

/**
 * Script para criar pacotes de tokens iniciais
 * Execute com: node scripts/create-token-packages.js
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

async function createPackages() {
  try {
    await connectDB();

    // Buscar roles existentes
    const clientRole = await Role.findOne({ name: 'client' });
    const proRole = await Role.findOne({ name: 'pro' });

    if (!clientRole || !proRole) {
      console.error('❌ Roles não encontradas. Execute primeiro o seed de roles.');
      process.exit(1);
    }

    console.log('📦 Criando pacotes de tokens...');

    // Pacote de Assinatura PRO (30 dias)
    const proPackage = await TokenPackage.findOneAndUpdate(
      { name: 'Plano PRO - 30 dias' },
      {
        name: 'Plano PRO - 30 dias',
        description: 'Acesso completo à plataforma com recursos premium por 30 dias',
        tokenAmount: 5,
        role: proRole._id,
        features: ['Análise de vídeo', 'Simulação de entrevista', 'Flashcards premium', 'Relatórios avançados'],
        validityDays: 30,
        value: 29.90,
        externalId: 'pro_30_days',
        packageType: 'subscription',
        active: true
      },
      { upsert: true, new: true }
    );

    // Pacote de Teste (gratuito ou baixo valor)
    const testPackage = await TokenPackage.findOneAndUpdate(
      { name: 'Pacote de Teste' },
      {
        name: 'Pacote de Teste',
        description: 'Teste gratuito da plataforma com tokens limitados',
        tokenAmount: 2,
        role: clientRole._id, // Mantém o cargo atual
        features: ['Acesso básico aos quizzes', 'Teste de funcionalidades'],
        validityDays: null, // Vitalício
        value: 0, // Gratuito
        externalId: 'test_package',
        packageType: 'test',
        active: true
      },
      { upsert: true, new: true }
    );

    // Pacote de Recarga de Tokens
    const boostPackage = await TokenPackage.findOneAndUpdate(
      { name: 'Recarga de 10 Tokens' },
      {
        name: 'Recarga de 10 Tokens',
        description: 'Adicione 10 tokens à sua conta sem alterar seu plano atual',
        tokenAmount: 10,
        role: clientRole._id, // Mantém o cargo atual
        features: ['10 tokens adicionais', 'Mantém plano atual'],
        validityDays: null, // Vitalício
        value: 9.90,
        externalId: 'token_boost_10',
        packageType: 'token_boost',
        active: true
      },
      { upsert: true, new: true }
    );

    console.log('✅ Pacotes criados/atualizados:');
    console.log(`   - ${proPackage.name} (${proPackage.packageType})`);
    console.log(`   - ${testPackage.name} (${testPackage.packageType})`);
    console.log(`   - ${boostPackage.name} (${boostPackage.packageType})`);

  } catch (error) {
    console.error('❌ Erro ao criar pacotes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📪 Desconectado do MongoDB');
  }
}

if (require.main === module) {
  createPackages();
}