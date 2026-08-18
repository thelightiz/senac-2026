import flask as fl
from routes.views import *


app = fl.Flask(__name__)




if __name__ == "__main__":
    app.run(debug=True)