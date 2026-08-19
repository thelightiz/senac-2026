def calculate_cet(loan_amount: float, total_paid: float) -> float:
    cet = ((total_paid - loan_amount) / loan_amount) * 100
    return round(cet, 2)