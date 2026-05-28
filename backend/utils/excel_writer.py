import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.drawing.image import Image
from datetime import datetime, timedelta
from models import db, Sale, Product, Payment
from config import Config
from sqlalchemy import func
import os

# Try importing matplotlib – if it fails, charts will be skipped
try:
    from openpyxl.chart import BarChart, PieChart, Reference
    _MATPLOTLIB_AVAILABLE = True
except ImportError:
    _MATPLOTLIB_AVAILABLE = False

def add_header(ws, title):
    logo_path = os.path.join('static', 'logo.png')
    if os.path.exists(logo_path):
        try:
            img = Image(logo_path)
            img.width = 80
            img.height = 80
            ws.add_image(img, 'A1')
        except:
            pass
    ws.merge_cells('B1:G2')
    cell = ws['B1']
    cell.value = f"{Config.STORE_NAME}\n{title}"
    cell.font = Font(size=16, bold=True)
    cell.alignment = Alignment(horizontal='center', vertical='center')
    ws.merge_cells('B3:G3')
    ws['B3'] = f"Date Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    ws['B3'].font = Font(italic=True)
    ws.merge_cells('B4:G4')
    ws['B4'] = "Prepared by: ______________________   Reviewed by: ______________________"

def style_table(ws, headers, start_row, data):
    header_fill = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid")
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=start_row, column=col_idx, value=header)
        cell.font = Font(bold=True)
        cell.fill = header_fill
    for row_idx, row_data in enumerate(data, start_row+1):
        for col_idx, value in enumerate(row_data, 1):
            ws.cell(row=row_idx, column=col_idx, value=value)
    for col_idx in range(1, len(headers)+1):
        max_len = 0
        for row in ws.iter_rows(min_col=col_idx, max_col=col_idx, min_row=start_row, max_row=start_row+len(data)):
            for cell in row:
                if cell.value:
                    max_len = max(max_len, len(str(cell.value)))
        ws.column_dimensions[openpyxl.utils.get_column_letter(col_idx)].width = max_len + 2

def create_sales_excel(stream, start_date=None, end_date=None):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Sales Report"
    add_header(ws, "Sales Report")

    query = Sale.query
    if start_date:
        query = query.filter(Sale.sale_date >= datetime.strptime(start_date, '%Y-%m-%d'))
    if end_date:
        query = query.filter(Sale.sale_date <= datetime.strptime(end_date, '%Y-%m-%d') + timedelta(days=1))
    sales = query.order_by(Sale.sale_date.desc()).all()
    headers = ['Sale ID', 'Date', 'Cashier', 'Total', 'Payment Method', 'Status']
    data = [(s.id, s.sale_date.strftime('%Y-%m-%d %H:%M'), s.user.full_name,
             f"₱{s.total_amount:.2f}", s.payment_method, s.status) for s in sales]
    style_table(ws, headers, 6, data)

    if _MATPLOTLIB_AVAILABLE:
        ws2 = wb.create_sheet("Charts")
        daily_sales = db.session.query(
            func.date(Sale.sale_date).label('date'),
            func.sum(Sale.total_amount).label('total')
        ).filter(Sale.status == 'completed').group_by(func.date(Sale.sale_date)).all()
        if daily_sales:
            ws2.append(['Date', 'Total Sales'])
            for d in daily_sales:
                ws2.append([d.date.strftime('%Y-%m-%d'), d.total])
            chart = BarChart()
            chart.title = "Daily Sales"
            chart.x_axis.title = "Date"
            chart.y_axis.title = "Amount (PHP)"
            data_ref = Reference(ws2, min_col=2, min_row=1, max_row=len(daily_sales)+1)
            cats_ref = Reference(ws2, min_col=1, min_row=2, max_row=len(daily_sales)+1)
            chart.add_data(data_ref, titles_from_data=True)
            chart.set_categories(cats_ref)
            ws2.add_chart(chart, "E2")
    wb.save(stream)

def create_inventory_excel(stream):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Inventory Report"
    add_header(ws, "Inventory Report")
    products = Product.query.all()
    headers = ['ID', 'Name', 'Category', 'Price', 'Stock', 'Unit', 'Supplier', 'Expiration', 'Low Stock Alert']
    data = [(p.id, p.name, p.category, f"₱{p.price:.2f}", p.stock_quantity, p.unit,
             p.supplier, p.expiration_date.strftime('%Y-%m-%d') if p.expiration_date else '',
             'YES' if p.is_low_stock else 'NO') for p in products]
    style_table(ws, headers, 6, data)

    if _MATPLOTLIB_AVAILABLE:
        ws2 = wb.create_sheet("Charts")
        if products:
            ws2.append(['Product', 'Stock Quantity'])
            for p in products:
                ws2.append([p.name, p.stock_quantity])
            chart = BarChart()
            chart.title = "Stock Levels"
            chart.x_axis.title = "Product"
            chart.y_axis.title = "Quantity"
            data_ref = Reference(ws2, min_col=2, min_row=1, max_row=len(products)+1)
            cats_ref = Reference(ws2, min_col=1, min_row=2, max_row=len(products)+1)
            chart.add_data(data_ref, titles_from_data=True)
            chart.set_categories(cats_ref)
            ws2.add_chart(chart, "E2")
    wb.save(stream)

def create_payments_excel(stream):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Payments Report"
    add_header(ws, "Payments Report")
    payments = Payment.query.order_by(Payment.created_at.desc()).all()
    headers = ['ID', 'Sale ID', 'Amount', 'Method', 'Status', 'PayMongo ID', 'Date']
    data = [(p.id, p.sale_id, f"₱{p.amount:.2f}", p.method, p.status,
             p.paymongo_payment_id, p.created_at.strftime('%Y-%m-%d %H:%M')) for p in payments]
    style_table(ws, headers, 6, data)

    if _MATPLOTLIB_AVAILABLE:
        ws2 = wb.create_sheet("Charts")
        method_counts = db.session.query(Payment.method, func.count(Payment.id)).group_by(Payment.method).all()
        if method_counts:
            ws2.append(['Method', 'Count'])
            for method, count in method_counts:
                ws2.append([method, count])
            pie = PieChart()
            pie.title = "Payment Methods"
            data_ref = Reference(ws2, min_col=2, min_row=1, max_row=len(method_counts)+1)
            cats_ref = Reference(ws2, min_col=1, min_row=2, max_row=len(method_counts)+1)
            pie.add_data(data_ref, titles_from_data=True)
            pie.set_categories(cats_ref)
            ws2.add_chart(pie, "E2")
    wb.save(stream)