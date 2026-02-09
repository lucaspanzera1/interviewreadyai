// Script de teste para verificar configuração do Google Gemini
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log('🧪 Testando configuração do Google Gemini...\n');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY não encontrada no .env');
    return;
  }
  
  console.log('✅ API Key encontrada:', apiKey.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Testar texto simples primeiro
    console.log('\n📝 Testando com texto simples...');
    const textModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const textResult = await textModel.generateContent(['Olá, responda apenas com "OK" se você está funcionando.']);
    const textResponse = await textResult.response;
    console.log('✅ Resposta texto:', textResponse.text());
    
    // Listar modelos disponíveis  
    console.log('\n📋 Modelos disponíveis para análise de vídeo:');
    console.log('- gemini-1.5-flash (recomendado para vídeo - mais rápido)');
    console.log('- gemini-1.5-pro (mais preciso, mas mais lento)');
    console.log('- gemini-pro-vision (para imagens/vídeo curtos)');
    
    console.log('\n⚠️  IMPORTANTE - Limitações de vídeo:');
    console.log('- Tamanho máximo: 20MB (upload inline)');
    console.log('- Para vídeos maiores, use Gemini File API');
    console.log('- Formatos suportados: MP4, MOV, AVI, WEBM');
    
    console.log('\n✅ Configuração básica OK!');
    console.log('\n💡 Próximos passos:');
    console.log('1. Verifique se os vídeos não ultrapassam 20MB');
    console.log('2. Considere comprimir vídeos no frontend antes do upload');
    console.log('3. Para vídeos grandes, implemente upload para Google Cloud Storage');
    
  } catch (error) {
    console.error('\n❌ Erro ao testar Gemini:', error.message);
    
    if (error.message?.includes('404')) {
      console.error('\n💡 Erro 404 - Modelo não encontrado.');
      console.error('Verifique:');
      console.error('1. Se o nome do modelo está correto (SEM prefixo "models/")');
      console.error('2. Se sua API Key tem acesso ao Gemini 1.5');
      console.error('3. Se você habilitou a API no Google Cloud Console');
      console.error('\n🔑 Obtenha uma nova chave em: https://makersuite.google.com/app/apikey');
    }
    
    if (error.message?.includes('API key')) {
      console.error('\n💡 Erro de API Key.');
      console.error('Verifique se a chave está correta e ativa em:');
      console.error('https://makersuite.google.com/app/apikey');
    }
    
    console.error('\nDetalhes completos:', error);
  }
}

testGemini();
