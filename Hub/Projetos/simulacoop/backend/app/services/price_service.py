def calculate_price(loan_amount: float, number_of_installments: int, interest_rate: float) -> dict:
    rate = interest_rate / 100
    if rate == 0:
        installment_value = loan_amount / number_of_installments
    else:
        factor=(1 + rate) ** number_of_installments
        installment_value = loan_amount * (rate * factor) / (factor - 1)

    remaining_balance = loan_amount
    total_interest = 0
    total_paid = 0
    installments = []

    for number in range(1, number_of_installments + 1):
        starting_balance = remaining_balance
        interest_amount= starting_balance * rate
        amortization = installment_value - interest_amount
        remaining_balance -= amortization

        if number == number_of_installments:
            amortization = starting_balance
            payment_amount = starting_balance + interest_amount
            remaining_balance = 0
        else:
            payment_amount = installment_value

        total_interest += interest_amount
        total_paid += payment_amount

        installments.append({
            "installment_number": number,
            "starting_balance": round(starting_balance, 2),
            "interest_amount": round(interest_amount, 2),
            "amortization": round(amortization, 2),
            "payment_amount": round(payment_amount, 2),
            "remaining_balance": round(remaining_balance, 2)
        })

    return {
        "installment_value": round(installment_value, 2),
        "total_interest": round(total_interest, 2),
        "total_paid": round(total_paid, 2),
        "installments": installments,
    }