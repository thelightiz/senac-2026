def big_same_hour(transaction, transactions):


#    "JA:PAA".replace(":","")

    transaction_hour = transaction.hour
    other_transaction_hour = transaction.hour

    transaction_hour = transaction_hour.replace(":", "")
    other_transaction_hour = other_transaction_hour.replace(":", "")



    

    for other_transaction in transactions:
        if other_transaction.id != transaction.id and other_transaction_hour == transaction_hour and other_transaction.date == transaction.date:
            if other_transaction.amount > 1000 and transaction.amount > 1000:

                transactions.remove(transaction)
                print(f"Transaction {transaction.id} removed due to rule violation.")

                transactions.remove(other_transaction)
                print(f"Transaction {other_transaction.id} removed due to rule violation.")
                


        
    return transactions