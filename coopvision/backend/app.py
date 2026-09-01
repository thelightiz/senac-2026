import flask as fl
from API.gemini_api import cpf_verification


app = fl.Flask(__name__)


@app.route('/')


def index():
    return fl.Render_template('index.html')



if __name__ == '__main__':

    app.run(debug=True)