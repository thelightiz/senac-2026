import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
database = os.getenv("DB_NAME")


connection= mysql.connector.connect(
    host=host,
    port=port,
    user=user,
    password=password,
    database=database
)
