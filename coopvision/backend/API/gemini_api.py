import json
import os
import time

from PIL import Image

try:
    from google import genai
    from google.genai.errors import APIError
except ImportError:
    genai = None
    APIError = Exception


def cpf_verification(image_path):
    if not image_path or not os.path.exists(image_path):
        return {"erro": f"Arquivo não encontrado: {image_path}"}

    try:
        imagem = Image.open(image_path)
        imagem.verify()
        imagem.close()

        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key or genai is None:
            return {
                "erro": "Chave da API Gemini não configurada. Defina a variável de ambiente GEMINI_API_KEY.",
            }

        client = genai.Client(api_key=api_key)
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

        max_tentativas = 3
        espera_inicial = 4

        infos = None
        for tentativa in range(max_tentativas):
            try:
                imagem = Image.open(image_path)
                infos = client.models.generate_content(
                    model='gemini-3.8-flash',
                    contents=[prompt, imagem],
                )
                break
            except APIError as api_err:
                if tentativa == max_tentativas - 1:
                    raise api_err
                if api_err.code in [503, 429]:
                    print(f"[Aviso] Servidor ocupado (Erro {api_err.code}). Tentativa {tentativa + 1} de {max_tentativas}. Aguardando {espera_inicial}s...")
                    time.sleep(espera_inicial)
                    espera_inicial *= 2
                else:
                    raise api_err
            except Exception as e:
                if tentativa == max_tentativas - 1:
                    raise e
                print(f"[Aviso] Conexão falhou. Tentando novamente em {espera_inicial}s...")
                time.sleep(espera_inicial)
                espera_inicial *= 2

        if infos is None:
            return {
                "Is_there_cpf": False,
                "document_data": {
                    "nome": None,
                    "numero_cpf": None,
                    "data_nascimento": None,
                },
            }

        response_data = json.loads(infos.text.strip())
        return response_data

    except FileNotFoundError:
        return {"erro": f"O arquivo '{image_path}' não foi encontrado."}
    except Exception as e:
        return {"erro": f"Falha ao processar: {str(e)}"}


if __name__ == "__main__":
    teste = cpf_verification("fotojapa.jpeg")
    print(json.dumps(teste, indent=2, ensure_ascii=False))
