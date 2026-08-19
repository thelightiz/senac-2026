from .price_service import calculate_price
from .sac_service import calculate_sac
from .cet_service import calculate_cet


def calculate_loan(loan_amount: float, number_of_installments: int,
                    amortization_type: str, interest_rate: float) -> dict:
    if amortization_type == "price":
        result = calculate_price(loan_amount, number_of_installments, interest_rate)
        installment_value = result["installment_value"]
    elif amortization_type == "sac":
        result = calculate_sac(loan_amount, number_of_installments, interest_rate)
        installment_value = result["first_installment_value"]
    else:
        raise ValueError("amortization_type deve ser 'price' ou 'sac'")

    cet = calculate_cet(loan_amount, result["total_paid"])

    return {
        "loan_amount": loan_amount,
        "number_of_installments": number_of_installments,
        "amortization_type": amortization_type,
        "installment_value": installment_value,
        "total_interest": result["total_interest"],
        "total_paid": result["total_paid"],
        "cet": cet,
        "installments": result["installments"],
    }