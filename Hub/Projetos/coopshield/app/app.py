from flask import Flask, render_template, jsonify, request
from Projetos.coopshield.database.database import read_transactions_from_db
from datetime import timedelta

app = Flask(
    __name__,
    template_folder="../frontend/templates",
    static_folder="../frontend/static"
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/filtrar', methods=['POST'])
def filtrar_dados():
    dados = request.get_json() or {}
    periodo = dados.get('periodo', 'Últimos 7 dias')

    try:
        transactions = read_transactions_from_db()

        if len(transactions) == 0:
            return jsonify({
                "analises": 0,
                "deteccoes": 0,
                "grafico": [],
                "labels": [],
                "tipos": {
                    "altas_minuto": 0,
                    "altas_madrugada": 0,
                    "outros": 0
                }
            })

        maior_data = max(x['date'] for x in transactions)

        if periodo == 'Hoje':
            data_inicial = maior_data
        else:
            data_inicial = maior_data - timedelta(days=6)

        transacoes = []

        for transaction in transactions:
            if data_inicial <= transaction['date'] <= maior_data:
                transacoes.append(transaction)

        analises = len(transacoes)

        deteccoes_madrugada = []

        for transaction in transacoes:
            hora = str(transaction['hour'])
            hora = int(hora.split(':')[0])

            if transaction['amount'] > 2000 and 0 <= hora < 6:
                deteccoes_madrugada.append(transaction)

        deteccoes_minuto = []

        for transaction in transacoes:
            for outra in transacoes:
                if transaction['id'] == outra['id']:
                    continue

                mesma_data = transaction['date'] == outra['date']

                hora1 = str(transaction['hour'])
                hora2 = str(outra['hour'])

                hora1 = hora1.split(':')[0] + ':' + hora1.split(':')[1]
                hora2 = hora2.split(':')[0] + ':' + hora2.split(':')[1]

                mesma_hora = hora1 == hora2

                if mesma_data and mesma_hora:
                    if transaction['amount'] > 1000 and outra['amount'] > 1000:
                        if transaction['id'] not in [x['id'] for x in deteccoes_minuto]:
                            deteccoes_minuto.append(transaction)

        quantidade_minuto = len(deteccoes_minuto)
        quantidade_madrugada = len(deteccoes_madrugada)

        deteccoes = quantidade_minuto + quantidade_madrugada

        if deteccoes > 0:
            percentual_minuto = round(
                quantidade_minuto / deteccoes * 100
            )

            percentual_madrugada = round(
                quantidade_madrugada / deteccoes * 100
            )
        else:
            percentual_minuto = 0
            percentual_madrugada = 0

        percentual_outros = 100 - percentual_minuto - percentual_madrugada

        grafico = []
        labels = []

        dia = data_inicial

        while dia <= maior_data:
            quantidade = 0

            for transaction in transacoes:
                if transaction['date'] == dia:
                    quantidade += 1

            grafico.append(quantidade)
            labels.append(dia.strftime('%d/%m'))

            dia += timedelta(days=1)

        return jsonify({
            "analises": analises,
            "deteccoes": deteccoes,
            "grafico": grafico,
            "labels": labels,
            "tipos": {
                "altas_minuto": percentual_minuto,
                "altas_madrugada": percentual_madrugada,
                "outros": percentual_outros
            }
        })

    except Exception as erro:
        print("ERRO:", erro)

        return jsonify({
            "erro": "Erro ao buscar os dados"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)