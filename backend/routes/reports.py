from flask import Blueprint, request, send_file
from utils.excel_writer import create_sales_excel, create_inventory_excel, create_payments_excel
from utils.decorators import token_required
import io

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/export/sales')
@token_required
def export_sales(current_user):
    start = request.args.get('start')
    end = request.args.get('end')
    output = io.BytesIO()
    create_sales_excel(output, start, end)
    output.seek(0)
    return send_file(output, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                     as_attachment=True, download_name='sales_report.xlsx')

@reports_bp.route('/export/inventory')
@token_required
def export_inventory(current_user):
    output = io.BytesIO()
    create_inventory_excel(output)
    output.seek(0)
    return send_file(output, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                     as_attachment=True, download_name='inventory_report.xlsx')

@reports_bp.route('/export/payments')
@token_required
def export_payments(current_user):
    output = io.BytesIO()
    create_payments_excel(output)
    output.seek(0)
    return send_file(output, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                     as_attachment=True, download_name='payments_report.xlsx')