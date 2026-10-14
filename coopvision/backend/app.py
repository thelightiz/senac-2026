import flask as fl
from API.gemini_api import cpf_verification


app = fl.Flask(__name__, template_folder='templates', static_folder='static')


@app.route('/')
def index():
    return fl.render_template('index.html')


@app.route('/ler-imagem', methods=['POST'])
def ler_imagem():
    imagem = fl.request.files.get('imagem')

    if imagem is None or imagem.filename == '':
        return fl.jsonify({'erro': 'Nenhuma imagem foi enviada.'}), 400

    resultado = cpf_verification(imagem.read())

    if 'erro' in resultado:
        return fl.jsonify(resultado), 400

    return fl.jsonify(resultado)


if __name__ == '__main__':
    app.run(debug=True)