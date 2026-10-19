from flask import Flask, render_template
from Projetos.coopshield.app.app import coopshield as coopshield_routes
from Projetos.simulacoop.backend.app.main import simulacoop as simulacoop_routes
from Projetos.coopvision.backend.app import coopvision as coopvision_routes

app = Flask(__name__, template_folder='templates', static_folder='static')

app.register_blueprint(coopshield_routes)
app.register_blueprint(simulacoop_routes)
app.register_blueprint(coopvision_routes)








@app.route('/')
def home():
    return render_template('index.html')









if __name__ == '__main__':
    print("Servidor iniciado! Acesse: http://127.0.0.1:5000")
    app.run(debug=True)