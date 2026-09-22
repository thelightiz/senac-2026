import database.database as db



def menu_teste():
    print("1. Read transactions from database")
    print("2. Add transactions to database")
    input_choice = input("Enter your choice (1 or 2): ")

    if input_choice == '1':
        transactions = db.read_transactions_from_db()
        print("Transactions read from database:")
        for transaction in transactions:
            print(transaction)

    elif input_choice == '2':
        transactions = db.rs.read_from_json("json_data.json")
        transactions = db.rs.check_rules(transactions)
        db.add_transactions_to_db(transactions)
        print("Transactions added to database after rule checks.")

menu_teste()