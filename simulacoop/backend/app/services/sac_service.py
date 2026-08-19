def calculate_sac(loan_amount: float, number_of_installments: int, interest_rate: float) -> dict:
    rate = interest_rate / 100
    amortization = loan_amount / number_of_installments
    remaining_balance = loan_amount
    total_interest = 0
    total_paid = 0
    installments = []

    for number in range(1, number_of_installments + 1):
        starting_balance = remaining_balance
        interest_amount = starting_balance * rate
        payment_amount = amortization + interest_amount
        remaining_balance -= amortization

        total_interest += interest_amount
        total_paid += payment_amount

        installments.append({
            "installment_number": number,
            "starting_balance": round(starting_balance, 2),
            "interest_amount": round(interest_amount, 2),
            "amortization": round(amortization, 2),
            "payment_amount": round(payment_amount, 2),
            "remaining_balance": round(remaining_balance, 2),
        })

    return {
        "first_installment_value": round(installments[0]["payment_amount"], 2),
        "last_installment_value": round(installments[-1]["payment_amount"], 2),
        "total_interest": round(total_interest, 2),
        "total_paid": round(total_paid, 2),
        "installments": installments,
    }