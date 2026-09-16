import os

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(BACKEND_DIR, "..", "..", "frontend", "src", "templates")
STATIC_DIR = os.path.join(BACKEND_DIR, "..", "..", "frontend", "src", "static")

from flask import Flask, render_template, request
import services.loan_calculation_service as lcs

app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)


@app.route("/", methods=["GET"])
def inicio():
    return render_template("index.html")


@app.route("/form.html", methods=["POST", "GET"])
def calcular():
    if request.method == "POST":
        # Processa apenas quando o formulário é enviado
        
        # Uso do .get() evita crash de KeyError caso falte algum campo
        loan_amount_str = request.form.get("loan-amount", "0")
        number_of_installments = int(request.form.get("number_of_installments", 0))
        interest_rate = float(request.form.get("interest_rate", 0))
        amortization_type = request.form.get("amortization_type", "")

        # Trata formatação brasileira de valores (ex: "10.000,00" -> "10000.00")
        loan_amount_str = loan_amount_str.replace(".", "").replace(",", ".")
        loan_amount = float(loan_amount_str)

        resultado = lcs.calculate_loan(
            loan_amount,
            number_of_installments,
            amortization_type,
            interest_rate
        )

        return render_template("form.html", resultado=resultado)

    # Se for requisição GET, apenas exibe a página sem resultado
    return render_template("form.html", resultado=None)

if __name__ == "__main__":
    app.run(debug=True)