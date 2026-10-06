from flask import Flask, render_template, jsonify, request
import os

# Inicialização padrão do Flask que procura automaticamente as pastas 'templates' e 'static'
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/filtrar', methods=['POST'])
def filtrar_dados():
    dados = request.get_json() or {}
    periodo = dados.get('periodo', 'Últimos 7 dias')
    
    if periodo == 'Hoje':
        dados_atualizados = {
            "analises": 25,
            "deteccoes": 4,
            "grafico": [0, 1, 2, 1.5, 3],
            "tipos": {"altas_minuto": 90, "altas_madrugada": 40, "outros": 10}
        }
    else:
        dados_atualizados = {
            "analises": 180,
            "deteccoes": 40,
            "grafico": [0, 3.6, 1.8, 4.3, 2.6], 
            "tipos": {"altas_minuto": 88, "altas_madrugada": 60, "outros": 20}
        }
    return jsonify(dados_atualizados)

if __name__ == '__main__':
    # Roda na porta 5000 padrão de forma limpa
    app.run(debug=True, port=5000)