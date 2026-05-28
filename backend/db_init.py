import pymysql
from config import Config

uri = Config.SQLALCHEMY_DATABASE_URI
_, rest = uri.split('://')
user_pass, host_db = rest.split('@')
if ':' in user_pass:
    user, pwd = user_pass.split(':')
else:
    user, pwd = user_pass, ''
host, db_name = host_db.split('/')

conn = pymysql.connect(host=host, user=user, password=pwd)
cursor = conn.cursor()
cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci")
conn.close()
print(f"Database '{db_name}' ensured.")