from flask import Flask, render_template, request
import Projetos.simulacoop.backend.app as simulacoop_app
import Projetos.coopvision.backend.app as coopvision_app
import Projetos.coopshield.app.app as coopshield_app
from Projetos.simulacoop.backend.app.main import STATIC_DIR, TEMPLATE_DIR

app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)


@app.route("/", methods=["GET"])
def inicio():
    return render_template("index.html")



if __name__ == "__main__":
    app.run(debug=True)