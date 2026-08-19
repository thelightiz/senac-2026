import flask as fl
from .routes.loan_routes import loan_routes

app = fl.Flask(__name__)
app.register_blueprint(loan_routes)

if __name__ == "__main__":
    app.run(debug=True)