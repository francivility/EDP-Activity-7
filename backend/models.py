from flask_sqlalchemy import SQLAlchemy
import bcrypt
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('admin','staff'), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    security_question = db.Column(db.String(255))
    security_answer = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.now)   # local time

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def set_security_answer(self, answer):
        self.security_answer = bcrypt.hashpw(answer.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_security_answer(self, answer):
        if not self.security_answer:
            return False
        return bcrypt.checkpw(answer.encode('utf-8'), self.security_answer.encode('utf-8'))

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50))
    price = db.Column(db.Float, nullable=False)
    stock_quantity = db.Column(db.Float, nullable=False, default=0)
    unit = db.Column(db.String(20), default='kg')
    supplier = db.Column(db.String(100))
    expiration_date = db.Column(db.Date)
    low_stock_threshold = db.Column(db.Integer, default=10)
    image_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    @property
    def is_low_stock(self):
        return self.stock_quantity <= self.low_stock_threshold

class Sale(db.Model):
    __tablename__ = 'sales'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.Enum('cash','gcash','card'), nullable=False)
    payment_reference = db.Column(db.String(100))
    status = db.Column(db.Enum('pending','completed','cancelled'), default='completed')
    sale_date = db.Column(db.DateTime, default=datetime.now)    # local time – this fixes the clock
    items = db.relationship('SaleItem', backref='sale', lazy=True)
    user = db.relationship('User', backref='sales')

class SaleItem(db.Model):
    __tablename__ = 'sale_items'
    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    product = db.relationship('Product')

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    method = db.Column(db.Enum('cash','gcash','card'), nullable=False)
    paymongo_payment_id = db.Column(db.String(100))
    status = db.Column(db.Enum('pending','paid','failed'), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.now)    # local time
    sale = db.relationship('Sale', backref='payments')