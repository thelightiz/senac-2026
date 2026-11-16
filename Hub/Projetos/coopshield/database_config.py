import mysql.connector

connection = None

try:
    connection = mysql.connector.connect(
        host="REDDEVS.mysql.pythonanywhere-services.com",
        user="REDDEVS",
        password="SenhaTopzeraDoYanzera",
        database="REDDEVS$coopshield"
    )
except Exception as erro:
    print(f"Banco de dados indisponível. Usando dados locais: {erro}")
