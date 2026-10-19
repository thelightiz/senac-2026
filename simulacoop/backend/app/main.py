import os

from flask import Flask, render_template, request
from services import loan_calculation_service as lcs

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(BACKEND_DIR, "..", "..", "frontend", "src", "templates")
STATIC_DIR = os.path.join(BACKEND_DIR, "..", "..", "frontend", "src", "static")

app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)


def parse_brl(valor: str) -> float:
    """Converte '10.000,00' em 10000.00."""
    return float(valor.replace(".", "").replace(",", "."))


@app.route("/", methods=["GET", "POST"])
def inicio():
    # Requisição GET: apenas exibe a página sem resultado
    if request.method == "GET":
        return render_template("form.html", resultado=None)

    # Requisição POST: processa o formulário
    loan_amount_str = (
        request.form.get("loan_amount")
        or request.form.get("loan-amount")
        or "0"
    )
    number_of_installments = int(
        request.form.get("number_of_installments")
        or request.form.get("installments")
        or 0
    )
    interest_rate = float(
        (request.form.get("interest_rate")
         or request.form.get("interest-rate")
         or "1.5").replace(",", ".")
    )
    amortization_type = (
        request.form.get("amortization_type")
        or request.form.get("amortization-type")
        or ""
    )

    try:
        loan_amount = parse_brl(loan_amount_str)
    except ValueError:
        return render_template("form.html", resultado=None, erro="Valor inválido.")

    resultado = lcs.calculate_loan(
        loan_amount,
        number_of_installments,
        amortization_type,
        interest_rate,
    )

    return render_template("form.html", resultado=resultado)


if __name__ == "__main__":
    app.run(debug=True)