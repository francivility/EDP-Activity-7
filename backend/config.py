import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-123')
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:@localhost/vegetable_store'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    PAYMONGO_SECRET_KEY = os.getenv('PAYMONGO_SECRET_KEY', 'sk_test_...')
    STORE_NAME = "Fernando's Fruits & Veggies"