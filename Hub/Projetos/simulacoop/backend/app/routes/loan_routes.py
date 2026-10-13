from flask import Blueprint, request, jsonify
from ..services.loan_calculation_service import calculate_loan
from ..schemas.loan_schema import validate_loan_input

loan_routes = Blueprint("loan_routes", __name__)


@loan_routes.route("/api/loans/calculate", methods=["POST"])
def calculate():
    data = request.get_json()

    if data is None:
        return jsonify({"error": "corpo da requisicao precisa ser JSON"}), 400

    errors = validate_loan_input(data)
    if errors:
        return jsonify({"errors": errors}), 400

    try:
        result = calculate_loan(
            loan_amount=data["loan_amount"],
            number_of_installments=data["number_of_installments"],
            amortization_type=data["amortization_type"],
            interest_rate=data.get("interest_rate", 2),
        )
        return jsonify(result), 200
    except Exception as error:
        return jsonify({"error": str(error)}), 500