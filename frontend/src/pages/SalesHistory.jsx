import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import ReceiptModal from '../components/ReceiptModal'

export default function SalesHistory() {
  const [sales, setSales] = useState([])
  const { user } = useAuth()
  const [receiptSaleId, setReceiptSaleId] = useState(null)

  const fetchSales = async () => {
    const res = await api.get('/sales')
    setSales(res.data)
  }

  useEffect(() => { fetchSales() }, [])

  const changeStatus = async (saleId, newStatus) => {
    try {
      await api.put(`/sales/status/${saleId}`, { status: newStatus })
      fetchSales()
    } catch (err) {
      alert('Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-primary-800">Sales History</h2>
      <div className="bg-white rounded-3xl shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary-50">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Date / Time</th>
              <th className="p-4 text-left">Cashier</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Method</th>
              <th className="p-4 text-left">Status</th>
              {user.role === 'admin' && <th className="p-4 text-left">Actions</th>}
              <th className="p-4 text-left">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => {
              const dateObj = new Date(sale.sale_date)
              const dateStr = dateObj.toLocaleDateString()
              const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

              return (
                <tr key={sale.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">{sale.id}</td>
                  <td className="p-4 text-sm">
                    <div>{dateStr}</div>
                    <div className="text-xs text-gray-500">{timeStr}</div>
                  </td>
                  <td className="p-4">{sale.user}</td>
                  <td className="p-4 font-medium">₱{sale.total_amount.toFixed(2)}</td>
                  <td className="p-4">{sale.payment_method}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                      sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>{sale.status}</span>
                  </td>
                  {user.role === 'admin' && (
                    <td className="p-4">
                      <select value={sale.status} onChange={e => changeStatus(sale.id, e.target.value)}
                        className="border rounded-full px-2 py-1 text-xs">
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  )}
                  <td className="p-4">
                    <button onClick={() => setReceiptSaleId(sale.id)} className="text-primary-600 hover:underline">
                      <i className="fas fa-receipt"></i>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {receiptSaleId && (
        <ReceiptModal saleId={receiptSaleId} onClose={() => setReceiptSaleId(null)} />
      )}
    </div>
  )
}