import os
from flask import Blueprint, request, jsonify, session
from werkzeug.utils import secure_filename
from datetime import datetime, date
from sqlalchemy import func
from models import db, User, Product, Sale, SaleItem, Payment
from utils.decorators import token_required, admin_required
from config import Config

api_bp = Blueprint('api', __name__)

UPLOAD_FOLDER = os.path.join('static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ----- Auth user info -----
@api_bp.route('/me', methods=['GET'])
@token_required
def get_me(current_user):
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'full_name': current_user.full_name,
        'role': current_user.role
    })

# ----- User Management (admin only) -----
@api_bp.route('/users', methods=['GET'])
@admin_required
def get_users(current_user):
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'full_name': u.full_name,
        'role': u.role,
        'created_at': u.created_at.isoformat()
    } for u in users])

@api_bp.route('/users', methods=['POST'])
@admin_required
def create_user(current_user):
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    user = User(
        username=data['username'],
        full_name=data['full_name'],
        role=data.get('role', 'staff')
    )
    user.set_password(data['password'])
    if data.get('security_question'):
        user.security_question = data['security_question']
        user.set_security_answer(data.get('security_answer', ''))
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created', 'user': {
        'id': user.id,
        'username': user.username,
        'full_name': user.full_name,
        'role': user.role
    }}), 201

@api_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(current_user, user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'role' in data and data['role'] in ['admin','staff']:
        user.role = data['role']
    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        user.username = data['username']
    if 'password' in data and data['password'].strip():
        user.set_password(data['password'])
    if 'security_question' in data:
        user.security_question = data['security_question']
    if 'security_answer' in data and data['security_answer'].strip():
        user.set_security_answer(data['security_answer'])
    db.session.commit()
    return jsonify({'message': 'User updated', 'user': {
        'id': user.id,
        'username': user.username,
        'full_name': user.full_name,
        'role': user.role
    }})

@api_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(current_user, user_id):
    if user_id == current_user.id:
        return jsonify({'error': 'Cannot delete yourself'}), 400
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'})

# ----- Products -----
@api_bp.route('/products', methods=['GET'])
@token_required
def get_products(current_user):
    search = request.args.get('search', '')
    category = request.args.get('category', '')
    supplier = request.args.get('supplier', '')
    low_stock = request.args.get('low_stock', '')
    query = Product.query
    if search:
        query = query.filter(Product.name.ilike(f'%{search}%'))
    if category:
        query = query.filter(Product.category == category)
    if supplier:
        query = query.filter(Product.supplier == supplier)
    if low_stock == '1':
        query = query.filter(Product.stock_quantity <= Product.low_stock_threshold)
    products = query.order_by(Product.name.asc()).all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'category': p.category,
        'price': p.price,
        'stock_quantity': p.stock_quantity,
        'unit': p.unit,
        'supplier': p.supplier,
        'expiration_date': p.expiration_date.isoformat() if p.expiration_date else None,
        'low_stock_threshold': p.low_stock_threshold,
        'image_url': p.image_url,
        'is_low_stock': p.is_low_stock
    } for p in products])

@api_bp.route('/products', methods=['POST'])
@admin_required
def add_product(current_user):
    data = request.form
    image_url = None
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            image_url = f'/static/uploads/{filename}'

    try:
        product = Product(
            name=data['name'],
            category=data.get('category') or None,
            price=float(data['price']),
            stock_quantity=float(data['stock_quantity']),
            unit=data.get('unit', 'kg'),
            supplier=data.get('supplier') or None,
            expiration_date=datetime.strptime(data['expiration_date'], '%Y-%m-%d') if data.get('expiration_date') else None,
            low_stock_threshold=int(data.get('low_stock_threshold', 10)),
            image_url=image_url
        )
        db.session.add(product)
        db.session.commit()
        return jsonify({'success': True, 'product': {'id': product.id, 'name': product.name}}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@api_bp.route('/products/<int:id>', methods=['PUT'])
@admin_required
def update_product(current_user, id):
    product = Product.query.get_or_404(id)
    data = request.form
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            product.image_url = f'/static/uploads/{filename}'
    product.name = data.get('name', product.name)
    product.category = data.get('category', product.category)
    product.price = float(data.get('price', product.price))
    product.stock_quantity = float(data.get('stock_quantity', product.stock_quantity))
    product.unit = data.get('unit', product.unit)
    product.supplier = data.get('supplier', product.supplier)
    if data.get('expiration_date'):
        product.expiration_date = datetime.strptime(data['expiration_date'], '%Y-%m-%d')
    else:
        product.expiration_date = None
    product.low_stock_threshold = int(data.get('low_stock_threshold', product.low_stock_threshold))
    db.session.commit()
    return jsonify({'success': True})

@api_bp.route('/products/<int:id>', methods=['DELETE'])
@admin_required
def delete_product(current_user, id):
    product = Product.query.get_or_404(id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({'success': True})

# ----- Categories & Suppliers -----
@api_bp.route('/categories', methods=['GET'])
@token_required
def get_categories(current_user):
    cats = db.session.query(Product.category).filter(Product.category != None).distinct().all()
    return jsonify([c[0] for c in cats])

@api_bp.route('/suppliers', methods=['GET'])
@token_required
def get_suppliers(current_user):
    sups = db.session.query(Product.supplier).filter(Product.supplier != None).distinct().all()
    return jsonify([s[0] for s in sups])

# ----- Cart -----
@api_bp.route('/cart', methods=['GET'])
@token_required
def get_cart(current_user):
    cart = session.get('cart', [])
    return jsonify(cart)

@api_bp.route('/cart/add', methods=['POST'])
@token_required
def add_to_cart(current_user):
    data = request.get_json()
    product_id = data['product_id']
    quantity = float(data['quantity'])
    product = Product.query.get_or_404(product_id)
    if product.stock_quantity < quantity:
        return jsonify({'error': 'Not enough stock'}), 400
    cart = session.get('cart', [])
    for item in cart:
        if item['product_id'] == product_id:
            item['quantity'] += quantity
            item['subtotal'] = round(item['quantity'] * item['unit_price'], 2)
            break
    else:
        cart.append({
            'product_id': product_id,
            'name': product.name,
            'quantity': quantity,
            'unit_price': product.price,
            'subtotal': round(quantity * product.price, 2)
        })
    session['cart'] = cart
    return jsonify({'success': True, 'cart': cart})

@api_bp.route('/cart/update/<int:product_id>', methods=['PUT'])
@token_required
def update_cart_item(current_user, product_id):
    data = request.get_json()
    new_quantity = float(data['quantity'])
    if new_quantity <= 0:
        cart = session.get('cart', [])
        session['cart'] = [item for item in cart if item['product_id'] != product_id]
        return jsonify({'success': True, 'cart': session['cart']})
    product = Product.query.get_or_404(product_id)
    cart = session.get('cart', [])
    for item in cart:
        if item['product_id'] == product_id:
            item['quantity'] = new_quantity
            item['subtotal'] = round(new_quantity * item['unit_price'], 2)
            session['cart'] = cart
            return jsonify({'success': True, 'cart': cart})
    cart.append({
        'product_id': product_id,
        'name': product.name,
        'quantity': new_quantity,
        'unit_price': product.price,
        'subtotal': round(new_quantity * product.price, 2)
    })
    session['cart'] = cart
    return jsonify({'success': True, 'cart': cart})

@api_bp.route('/cart/remove/<int:product_id>', methods=['DELETE'])
@token_required
def remove_from_cart(current_user, product_id):
    cart = session.get('cart', [])
    session['cart'] = [item for item in cart if item['product_id'] != product_id]
    return jsonify({'success': True})

@api_bp.route('/cart/clear', methods=['POST'])
@token_required
def clear_cart(current_user):
    session.pop('cart', None)
    return jsonify({'success': True})

# ----- Checkout -----
@api_bp.route('/checkout', methods=['POST'])
@token_required
def checkout(current_user):
    cart = session.get('cart', [])
    if not cart:
        return jsonify({'error': 'Cart is empty'}), 400
    data = request.get_json()
    payment_method = data['payment_method']
    total = round(sum(item['subtotal'] for item in cart), 2)

    sale = Sale(
        user_id=current_user.id,
        total_amount=total,
        payment_method=payment_method,
        status='pending'
    )
    db.session.add(sale)
    db.session.flush()

    for item in cart:
        product = Product.query.get(item['product_id'])
        if product.stock_quantity < item['quantity']:
            db.session.rollback()
            return jsonify({'error': f'Not enough stock for {product.name}'}), 400
        product.stock_quantity -= item['quantity']
        si = SaleItem(
            sale_id=sale.id,
            product_id=product.id,
            quantity=item['quantity'],
            unit_price=item['unit_price'],
            subtotal=item['subtotal']
        )
        db.session.add(si)

    db.session.commit()
    session.pop('cart', None)

    if payment_method == 'cash':
        sale.status = 'completed'
        payment = Payment(sale_id=sale.id, amount=total, method='cash', status='paid')
        db.session.add(payment)
        db.session.commit()
        return jsonify({'success': True, 'sale_id': sale.id, 'cash': True})
    else:
        payment = Payment(
            sale_id=sale.id,
            amount=total,
            method=payment_method,
            status='pending'
        )
        db.session.add(payment)
        db.session.commit()
        return jsonify({
            'success': True,
            'sale_id': sale.id,
            'simulate': True,
            'total': total,
            'method': payment_method
        })

# ----- Sales -----
@api_bp.route('/sales', methods=['GET'])
@token_required
def get_sales(current_user):
    sales = Sale.query.order_by(Sale.sale_date.desc()).all()
    return jsonify([{
        'id': s.id,
        'user': s.user.full_name,
        'total_amount': s.total_amount,
        'payment_method': s.payment_method,
        'status': s.status,
        'sale_date': s.sale_date.isoformat()
    } for s in sales])

@api_bp.route('/sales/status/<int:sale_id>', methods=['PUT'])
@token_required
def update_sale_status(current_user, sale_id):
    sale = Sale.query.get_or_404(sale_id)
    if current_user.role != 'admin' and current_user.id != sale.user_id:
        return jsonify({'error': 'You cannot modify this sale'}), 403
    data = request.get_json()
    new_status = data['status']
    if new_status not in ['pending', 'completed', 'cancelled']:
        return jsonify({'error': 'Invalid status'}), 400
    sale.status = new_status
    if new_status == 'completed':
        payment = Payment.query.filter_by(sale_id=sale.id).first()
        if payment:
            payment.status = 'paid'
            if 'reference' in data and data['reference']:
                payment.paymongo_payment_id = data['reference']   # <-- THIS SAVES THE REFERENCE
    elif new_status == 'cancelled':
        for item in sale.items:
            item.product.stock_quantity += item.quantity
    db.session.commit()
    return jsonify({'success': True})

# ----- Receipt (includes reference) -----
@api_bp.route('/sales/<int:sale_id>/receipt', methods=['GET'])
@token_required
def get_sale_receipt(current_user, sale_id):
    sale = Sale.query.get_or_404(sale_id)
    items = [{
        'name': item.product.name,
        'quantity': item.quantity,
        'unit_price': item.unit_price,
        'subtotal': item.subtotal,
        'unit': item.product.unit
    } for item in sale.items]

    reference = None
    payment = Payment.query.filter_by(sale_id=sale.id).first()
    if payment and payment.paymongo_payment_id:
        reference = payment.paymongo_payment_id   # <-- THIS RETURNS THE REFERENCE

    return jsonify({
        'sale_id': sale.id,
        'date': sale.sale_date.isoformat(),
        'cashier': sale.user.full_name,
        'total_amount': sale.total_amount,
        'payment_method': sale.payment_method,
        'status': sale.status,
        'items': items,
        'store_name': Config.STORE_NAME,
        'reference': reference   # <-- INCLUDED IN JSON
    })

# ----- Payments -----
@api_bp.route('/payments', methods=['GET'])
@token_required
def get_payments(current_user):
    payments = Payment.query.order_by(Payment.created_at.desc()).all()
    return jsonify([{
        'id': p.id,
        'sale_id': p.sale_id,
        'amount': p.amount,
        'method': p.method,
        'status': p.status,
        'created_at': p.created_at.isoformat(),
        'paymongo_payment_id': p.paymongo_payment_id
    } for p in payments])

# ----- Dashboard stats -----
@api_bp.route('/dashboard/stats', methods=['GET'])
@token_required
def dashboard_stats(current_user):
    total_products = Product.query.count()
    low_stock = Product.query.filter(Product.stock_quantity <= Product.low_stock_threshold).count()
    today = date.today()
    today_sales = Sale.query.filter(func.date(Sale.sale_date) == today).count()
    today_revenue = db.session.query(func.sum(Sale.total_amount)).filter(
        func.date(Sale.sale_date) == today,
        Sale.status == 'completed'
    ).scalar() or 0.0
    recent = Sale.query.order_by(Sale.sale_date.desc()).limit(5).all()
    return jsonify({
        'total_products': total_products,
        'low_stock_count': low_stock,
        'today_sales': today_sales,
        'today_revenue': round(today_revenue, 2),
        'recent_sales': [{
            'id': s.id,
            'user': s.user.full_name,
            'total': s.total_amount,
            'method': s.payment_method,
            'status': s.status,
            'date': s.sale_date.isoformat()
        } for s in recent]
    })