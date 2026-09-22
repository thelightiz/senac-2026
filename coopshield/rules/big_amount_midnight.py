import math


def check_big_amount_midnight(transaction):

    transaction_hour = transaction.hour
    transaction_hour = transaction_hour.replace(":", ".")

    transaction_hour = float(transaction_hour)
    transaction_hour = math.trunc(transaction_hour)










    if transaction.amount > 2000 and (transaction_hour >= 0 and transaction_hour < 6):
        return True
    return False
