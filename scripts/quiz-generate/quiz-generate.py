import json
import requests
import os
import sys
import time
import re
from typing import Dict, Any

# Configurações
API_BASE_URL = os.getenv('API_BASE_URL', 'https://api.treinavaga.tech//api')
AUTH_TOKEN = os.getenv('AUTH_TOKEN')

if not AUTH_TOKEN:
    print("Erro: AUTH_TOKEN não definido. Defina a variável de ambiente AUTH_TOKEN com seu token JWT.")
    sys.exit(1)

HEADERS = {
    'Authorization': f'Bearer {AUTH_TOKEN}',
    'Content-Type': 'application/json'
}

# Mapeamento de níveis do JSON para a API
LEVEL_MAPPING = {
    'Iniciante': 'INICIANTE',
    'Médio': 'MEDIO',
    'Difícil': 'DIFÍCIL',
    'Expert': 'EXPERT'
}

def load_quizzes_from_md(file_path: str) -> list:
    """Carrega os quizzes do arquivo quiz.md"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            # Remove possíveis caracteres extras e parseia como JSON
            quizzes = json.loads(content)
            return quizzes
    except Exception as e:
        print(f"Erro ao carregar arquivo {file_path}: {e}")
        sys.exit(1)

def map_quiz_data(quiz_data: Dict[str, Any]) -> Dict[str, Any]:
    """Mapeia os dados do JSON para o formato esperado pela API"""
    return {
        'categoria': quiz_data['categoria'],
        'titulo': quiz_data['titulo'],
        'descricao': quiz_data['descricao'],
        'tags': quiz_data['tags'].split(', ') if isinstance(quiz_data['tags'], str) else quiz_data['tags'],
        'quantidade_questoes': quiz_data['quantidade_questoes'],
        'nivel': LEVEL_MAPPING.get(quiz_data['nivel'], quiz_data['nivel']),
        'contexto': quiz_data.get('contexto', '')
    }

def generate_quiz(quiz_payload: Dict[str, Any], max_retries: int = 3) -> bool:
    """Envia requisição para gerar um quiz com tratamento de rate limit"""
    for attempt in range(max_retries):
        try:
            url = f"{API_BASE_URL}/quiz/generate"
            response = requests.post(url, json=quiz_payload, headers=HEADERS)
            
            if response.status_code == 201:
                data = response.json()
                print(f"✅ Quiz '{quiz_payload['titulo']}' gerado com sucesso!")
                print(f"   ID do quiz: {data.get('quizId', 'N/A')}")
                print(f"   Número de questões: {len(data.get('questions', []))}")
                return True
            elif response.status_code == 500 and "Rate limit reached" in response.text:
                # Trata rate limit da Groq API
                error_data = response.json()
                message = error_data.get('message', '')
                
                # Extrai o tempo de espera da mensagem
                wait_match = re.search(r'Please try again in (\d+\.?\d*)s', message)
                if wait_match:
                    wait_time = float(wait_match.group(1))
                    print(f"⏳ Rate limit atingido. Aguardando {wait_time:.2f}s antes de tentar novamente...")
                    print(f"   Tentativa {attempt + 1}/{max_retries} para '{quiz_payload['titulo']}'")
                    time.sleep(wait_time + 0.5)  # Adiciona 0.5s de buffer
                    continue
                else:
                    print(f"❌ Rate limit detectado mas não foi possível extrair tempo de espera")
                    print(f"   Mensagem: {message}")
                    return False
            else:
                print(f"❌ Erro ao gerar quiz '{quiz_payload['titulo']}': {response.status_code}")
                print(f"   Resposta: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Erro de conexão ao gerar quiz '{quiz_payload['titulo']}': {e}")
            if attempt < max_retries - 1:
                print(f"   Tentando novamente em 5 segundos... ({attempt + 1}/{max_retries})")
                time.sleep(5)
                continue
            return False
    
    print(f"❌ Máximo de tentativas atingido para '{quiz_payload['titulo']}'")
    return False

def main():
    # Caminho para o arquivo quiz.md
    quiz_md_path = os.path.join(os.path.dirname(__file__), 'quiz.md')
    
    # Carrega os quizzes
    quizzes = load_quizzes_from_md(quiz_md_path)
    print(f"📚 Encontrados {len(quizzes)} quizzes para gerar")
    print("💡 Rate limit automático ativado - o script aguardará automaticamente quando necessário")
    
    # Processa cada quiz
    success_count = 0
    for i, quiz_data in enumerate(quizzes, 1):
        print(f"\n🔄 Processando quiz {i}/{len(quizzes)}: {quiz_data['titulo']}")
        
        # Mapeia os dados
        quiz_payload = map_quiz_data(quiz_data)
        
        # Gera o quiz
        if generate_quiz(quiz_payload):
            success_count += 1
            # Pequeno delay entre quizzes bem-sucedidos para evitar rate limit
            if i < len(quizzes):
                print("⏳ Aguardando 2 segundos antes do próximo quiz...")
                time.sleep(2)
        else:
            print(f"   ❌ Falhou definitivamente: {quiz_data['titulo']}")
    
    print(f"\n🎉 Processo concluído! {success_count}/{len(quizzes)} quizzes gerados com sucesso.")

if __name__ == "__main__":
    main()
