from database_config import connection
import rules.rules as rs

def read_transactions_from_db():
    query = "SELECT id, date, hour, amount FROM transaction"
    cursor = connection.cursor(dictionary=True)
    cursor.execute(query)
    transactions = cursor.fetchall()
    cursor.close()
    return transactions

def add_transactions_to_db(transactions):

    for transaction in transactions:

        query = "INSERT INTO transaction (id, date, hour, amount) VALUES (%s, %s, %s, %s)"
        cursor = connection.cursor()
        cursor.execute(query, (transaction.id, transaction.date, transaction.hour, transaction.amount))
        connection.commit()
        cursor.close()


cursor = connection.cursor(dictionary=True)




