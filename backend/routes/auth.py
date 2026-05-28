from flask import Blueprint, request, jsonify
from models import db, User
from utils.decorators import token_required
import jwt, datetime
from config import Config

auth_bp = Blueprint('auth', __name__)

def create_token(user_id):
    payload = {
        'sub': user_id,
        'iat': datetime.datetime.utcnow(),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')

@auth_bp.route('/signup', methods=['POST'])
def signup():
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
    return jsonify({'message': 'Account created successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    token = create_token(user.id)
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'full_name': user.full_name,
            'security_question_set': bool(user.security_question)
        }
    })

# ----- Forgot Password (new flow) -----

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password_step1():
    """Receive username, return security question if exists."""
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if not user.security_question:
        return jsonify({'error': 'No security question set. Contact admin.'}), 400
    return jsonify({
        'message': 'Security question found',
        'question': user.security_question
    })

@auth_bp.route('/forgot-password/verify-answer', methods=['POST'])
def forgot_password_step2():
    """Check the answer. If correct, return a temporary reset token (valid 5 minutes)."""
    data = request.get_json()
    user = User.query.filter_by(username=data.get('username')).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if not user.check_security_answer(data.get('answer', '')):
        return jsonify({'error': 'Incorrect answer'}), 401

    # Create a short-lived token (5 minutes) containing the user ID
    payload = {
        'sub': user.id,
        'iat': datetime.datetime.utcnow(),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=5),
        'type': 'reset'
    }
    reset_token = jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')
    return jsonify({'message': 'Answer verified', 'reset_token': reset_token})

@auth_bp.route('/forgot-password/reset', methods=['POST'])
def forgot_password_step3():
    """Use the temporary reset token to set a new password."""
    data = request.get_json()
    try:
        payload = jwt.decode(data['reset_token'], Config.SECRET_KEY, algorithms=['HS256'])
        if payload.get('type') != 'reset':
            raise ValueError('Invalid token type')
        user = User.query.get(payload['sub'])
        if not user:
            raise ValueError('User not found')
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Reset token has expired. Please start again.'}), 401
    except Exception:
        return jsonify({'error': 'Invalid reset token.'}), 401

    new_password = data.get('new_password')
    if not new_password or len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    user.set_password(new_password)
    db.session.commit()
    return jsonify({'message': 'Password reset successfully. Please login.'})

# ----- Change Password (logged in) -----
@auth_bp.route('/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    data = request.get_json()
    if not current_user.check_password(data.get('current_password', '')):
        return jsonify({'error': 'Current password is incorrect'}), 401
    current_user.set_password(data['new_password'])
    db.session.commit()
    return jsonify({'message': 'Password updated successfully'})

# ----- Set / Update Security Question (logged in) -----
@auth_bp.route('/set-security', methods=['PUT'])
@token_required
def set_security(current_user):
    data = request.get_json()
    if data.get('question'):
        current_user.security_question = data['question']
    if data.get('answer'):
        current_user.set_security_answer(data['answer'])
    db.session.commit()
    return jsonify({'message': 'Security question updated'})