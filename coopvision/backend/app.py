import flask as fl
from API.gemini_api import cpf_verification


app = fl.Flask(__name__)


@app.route('/')
def index():
    return fl.render_template('index.html')


@app.route('/ler-imagem', methods=['POST'])
def ler_imagem():
    imagem = fl.request.files.get('imagem')

    return fl.jsonify({
        'mensagem': 'Imagem recebida!'
    })





if __name__ == '__main__':

    app.run(debug=True)