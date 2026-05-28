import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Payments() {
  const [payments, setPayments] = useState([])

  useEffect(() => {
    api.get('/payments').then(res => setPayments(res.data))
  }, [])

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-primary-800">Payments</h2>
      <div className="bg-white rounded-3xl shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary-50">
            <tr>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Sale ID</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Method</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-4">{p.id}</td>
                <td className="p-4">{p.sale_id}</td>
                <td className="p-4">₱{p.amount.toFixed(2)}</td>
                <td className="p-4">{p.method}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    p.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>{p.status}</span>
                </td>
                <td className="p-4">{new Date(p.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}