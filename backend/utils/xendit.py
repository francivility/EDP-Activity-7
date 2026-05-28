import requests
import base64
from config import Config

def create_invoice(total_amount, payment_method):
    """
    Create a Xendit invoice for the given amount (PHP) and payment method.
    Returns the full response dict.
    """
    key = Config.XENDIT_SECRET_KEY
    encoded = base64.b64encode(f"{key}:".encode()).decode()
    headers = {
        "Authorization": f"Basic {encoded}",
        "Content-Type": "application/json"
    }

    # Map our frontend methods to Xendit payment method codes
    method_map = {
        'gcash': 'GCASH',
        'card': 'CREDIT_CARD'
    }
    xendit_method = method_map.get(payment_method, payment_method.upper())

    # Unique external ID
    import time
    external_id = f"sale-{int(time.time())}-{payment_method}"

    payload = {
        "external_id": external_id,
        "amount": float(total_amount),          # already in PHP, e.g. 50.00
        "currency": "PHP",
        "payment_methods": [xendit_method]
    }

    try:
        resp = requests.post(
            "https://api.xendit.co/v2/invoices",
            json=payload,
            headers=headers
        )
        resp_data = resp.json()
        print("Xendit response:", resp_data)
        return resp_data
    except Exception as e:
        print("Xendit request failed:", str(e))
        return {'error': str(e)}