from transaction.transaction import Transaction
#import rules.big_amount_midnight as bam
from rules.big_amount_midnight import check_big_amount_midnight as bam
#import rules.big_same_hour as bsh
from rules.big_same_hour import big_same_hour as bsh
import json

def read_from_json(json_data):
    transactions = []
    with open(json_data, 'r') as file:
        data = json.load(file)
        for item in data:


            transaction = Transaction(
                id=item['id'],
                date=item['date'],
                hour=item['hour'],
                amount=item['amount']
            )
            transactions.append(transaction)

    return transactions

def check_rules(transactions):
    for transaction in transactions:
        print(transaction)
 
        if bam(transaction): # A função bam verifica se a transação viola a regra de "big_amount_midnight" e a cancela.
            transactions.remove(transaction)
            print(f"Transaction {transaction.id} removed due to rule violation.")

        transactions = bsh(transaction, transactions)

    return transactions
