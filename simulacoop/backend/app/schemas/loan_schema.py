def validate_loan_input(data: dict) -> list:
    errors=[]

    loan_amount = data.get("loan_amount")
    number_of_installments = data.get("number_of_installments")
    amortization_type = data.get("amortization_type")

    if loan_amount is None or not isinstance(loan_amount, (int, float)) or loan_amount <= 0:
        errors.append("loan_amount precisa ser um número maior que zero")
    
    if number_of_installments is None or not isinstance(number_of_installments, int) or number_of_installments <= 0:
        errors.append("number_of_installments precisa ser um número inteiro positivo")

    if amortization_type not in["price", "sac"]:
        errors.append("amortization_type precisa ser 'price' ou 'sac'")

    return errors