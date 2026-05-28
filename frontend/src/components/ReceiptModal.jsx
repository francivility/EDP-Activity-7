import { useEffect, useState } from 'react'
import api from '../services/api'
import logo from '../assets/logo.png'

export default function ReceiptModal({ saleId, onClose }) {
  const [receipt, setReceipt] = useState(null)

  useEffect(() => {
    api.get(`/sales/${saleId}/receipt`).then(res => setReceipt(res.data)).catch(console.error)
  }, [saleId])

  const printReceipt = () => {
    const printWindow = window.open('', '_blank')
    if (receipt) {
      const dateObj = new Date(receipt.date)
      printWindow.document.write(`
        <html>
          <head><title>Receipt #${receipt.sale_id}</title></head>
          <body style="font-family: monospace; padding: 20px;">
            <h2>${receipt.store_name}</h2>
            <p>Receipt #${receipt.sale_id}</p>
            <p>Date: ${dateObj.toLocaleDateString()}  Time: ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p>Cashier: ${receipt.cashier}</p>
            ${receipt.reference ? `<p>Reference: ${receipt.reference}</p>` : ''}
            <hr/>
            <table style="width:100%">
              <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
              <tbody>
                ${receipt.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity} ${item.unit}</td>
                    <td>₱${item.unit_price.toFixed(2)}</td>
                    <td>₱${item.subtotal.toFixed(2)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
            <hr/>
            <p><strong>Total: ₱${receipt.total_amount.toFixed(2)}</strong></p>
            <p>Payment: ${receipt.payment_method}</p>
            <p>Status: ${receipt.status}</p>
            <p>Thank you!</p>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  if (!receipt) return null

  const dateObj = new Date(receipt.date)
  const dateStr = dateObj.toLocaleDateString()
  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" className="h-12 mx-auto rounded-full mb-2" />
          <h3 className="font-bold text-primary-800">{receipt.store_name}</h3>
          <p className="text-xs text-gray-500">Receipt #{receipt.sale_id}</p>
        </div>
        <div className="text-sm space-y-1">
          <p><span className="text-gray-500">Date:</span> {dateStr}</p>
          <p><span className="text-gray-500">Time:</span> {timeStr}</p>
          <p><span className="text-gray-500">Cashier:</span> {receipt.cashier}</p>
          <p><span className="text-gray-500">Payment:</span> {receipt.payment_method}</p>
          {receipt.reference && (
            <p><span className="text-gray-500">Reference:</span> {receipt.reference}</p>
          )}
          <p><span className="text-gray-500">Status:</span> {receipt.status}</p>
        </div>
        <hr className="my-3" />
        <table className="w-full text-sm">
          <thead><tr className="border-b"><th className="text-left py-1">Item</th><th>Qty</th><th className="text-right">Price</th><th className="text-right">Subtotal</th></tr></thead>
          <tbody>
            {receipt.items.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-1">{item.name}</td>
                <td className="text-center">{item.quantity} {item.unit}</td>
                <td className="text-right">₱{item.unit_price.toFixed(2)}</td>
                <td className="text-right">₱{item.subtotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between font-bold mt-3">
          <span>Total:</span>
          <span>₱{receipt.total_amount.toFixed(2)}</span>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={printReceipt} className="flex-1 bg-primary-600 text-white py-2 rounded-full font-semibold hover:bg-primary-700">
            <i className="fas fa-print mr-2"></i>Print
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-full font-semibold hover:bg-gray-300">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}