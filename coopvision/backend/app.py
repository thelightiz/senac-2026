import os
from werkzeug.utils import secure_filename
import flask as fl
from API.gemini_api import cpf_verification


app = fl.Flask(__name__, template_folder='templates', static_folder='static')
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


@app.route('/')
def index():
    return fl.render_template('index.html')


@app.route('/ler-imagem', methods=['POST'])
def ler_imagem():
    imagem = fl.request.files.get('imagem')

    if imagem is None or imagem.filename == '':
        return fl.jsonify({'erro': 'Nenhuma imagem foi enviada.'}), 400

    nome_arquivo = secure_filename(imagem.filename)
    caminho_arquivo = os.path.join(app.config['UPLOAD_FOLDER'], nome_arquivo)
    imagem.save(caminho_arquivo)

    resultado = cpf_verification(caminho_arquivo)

    if 'erro' in resultado:
        return fl.jsonify(resultado), 400

    return fl.jsonify(resultado)


if __name__ == '__main__':
    app.run(debug=True)