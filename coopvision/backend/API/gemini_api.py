import os
import json
import time  
from PIL import Image
from google import genai 
from google.genai.errors import APIError  

# Chave API 
client = genai.Client(api_key="ChaveAPI")


def cpf_verification(image_path):

    
    # Descobre a pasta onde este arquivo .py está salvo
    diretorio_atual = os.path.dirname(os.path.abspath(__file__))

    
    # Cria o caminho absoluto para a imagem
    caminho_absoluto = os.path.join(diretorio_atual, image_path)
    
    try:
        # Lê a imagem usando PIL com o caminho correto
        imagem = Image.open(caminho_absoluto)
        
        # promt da analise da imagem 
        prompt = """
        Analise esta imagem e responda estritamente no formato JSON abaixo:
        {
          "Is_there_cpf": true/false,
          "document_data": {
            "nome": "Nome completo ou null",
            "numero_cpf": "000.000.000-00 ou null",
            "data_nascimento": "DD/MM/AAAA ou null"
          }
        }
        Certifique-se de que a resposta seja apenas o JSON válido, sem blocos de código markdown (como ```json) ou textos adicionais.
        """
        
        max_tentativas = 3  # Número máximo de tentativas 
        espera_inicial = 4  # Começa esperando 4 segundos
        
        for tentativa in range(max_tentativas):
            try:
                # Envia as informações 
                Infos = client.models.generate_content(
                    model='gemini-3.6-flash',  # Ajustado para a versão padrão de produção
                    contents=[prompt, imagem]
                )
                
                # Se funcionar, quebra o loop de repetição e segue o código
                break
                
            except APIError as api_err:
                # Se for a última tentativa, repassa o erro para o bloco principal
                if tentativa == max_tentativas - 1:
                    raise api_err
                
                # Se for erro 503 (servidor instável) ou 429 (limite de requisições)
                if api_err.code in [503, 429]:
                    print(f"[Aviso] Servidor ocupado (Erro {api_err.code}). Tentativa {tentativa + 1} de {max_tentativas}. Aguardando {espera_inicial}s...")
                    time.sleep(espera_inicial)
                    espera_inicial *= 2  # Dobra o tempo para a próxima tentativa (4s -> 8s)
                else:
                    raise api_err  # Se for outro tipo de erro de API, não adianta esperar
                    
            except Exception as e:
                if tentativa == max_tentativas - 1:
                    raise e
                print(f"[Aviso] Conexão falhou. Tentando novamente em {espera_inicial}s...")
                time.sleep(espera_inicial)
                espera_inicial *= 2

        # Converte o texto retornado para um dicionário Python
        response_data = json.loads(Infos.text.strip())
        return response_data
    
    except FileNotFoundError:
        return {"erro": f"O arquivo '{image_path}' não foi encontrado na pasta do projeto. Verifique se ele está em: {caminho_absoluto}"}
    except Exception as e:
        return {"erro": f"Falha ao processar: {str(e)}"}

# Testando o bglh
teste = cpf_verification("fotojapa.jpeg")
print(json.dumps(teste, indent=2, ensure_ascii=False))
