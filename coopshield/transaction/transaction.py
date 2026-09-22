class Transaction:
    def __init__(self, id, date, hour, amount):
        self.id = id
        self.date = date
        self.hour = hour
        self.amount = amount

    def __str__(self):
        return f"Transaction(id={self.id}, date={self.date}, hour={self.hour}, amount={self.amount})"

    

        
