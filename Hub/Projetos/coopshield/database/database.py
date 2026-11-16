import json
from datetime import datetime
from pathlib import Path

from Projetos.coopshield.database_config import connection


BASE_DIR = Path(__file__).resolve().parents[1]
JSON_FILE = BASE_DIR / 'json_data.json'


def _read_local_transactions():
    try:
        with open(JSON_FILE, 'r', encoding='utf-8') as arquivo:
            dados = json.load(arquivo)
    except FileNotFoundError:
        return []

    transacoes = []
    for item in dados:
        transacoes.append({
            'id': item['id'],
            'date': datetime.strptime(item['date'], '%Y-%m-%d').date(),
            'hour': item['hour'],
            'amount': float(item['amount'])
        })

    return transacoes


def read_transactions_from_db():
    if connection is None:
        return _read_local_transactions()

    try:
        query = "SELECT id, date, hour, amount FROM `transaction`"

        cursor = connection.cursor(dictionary=True)
        cursor.execute(query)
        transactions = cursor.fetchall()
        cursor.close()
        return transactions
    except Exception:
        return _read_local_transactions()


def add_transactions_to_db(transactions):
    if connection is None:
        return

    for transaction in transactions:

        query = """
        INSERT INTO `transaction`
        (id, date, hour, amount)
        VALUES (%s, %s, %s, %s)
        """

        cursor = connection.cursor()

        cursor.execute(
            query,
            (
                transaction.id,
                transaction.date,
                transaction.hour,
                transaction.amount
            )
        )

        connection.commit()

        cursor.close()