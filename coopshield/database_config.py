import mysql.connector
import os
from dotenv import load_dotenv

host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
database = os.getenv("DB_NAME")




connection= mysql.connector.connect(
    host="127.0.0.1",
    port=3306,
    user="root",
    password="",
    database="testes"
)
