import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setStats(res.data)).catch(console.error)
  }, [])

  if (!stats) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-primary-800">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={stats.total_products} icon="fa-boxes" color="bg-green-100 text-green-600" />
        <StatCard label="Low Stock Items" value={stats.low_stock_count} icon="fa-exclamation-triangle" color="bg-red-100 text-red-600" />
        <StatCard label="Today's Sales" value={stats.today_sales} icon="fa-shopping-cart" color="bg-blue-100 text-blue-600" />
        <StatCard label="Today's Revenue" value={`₱${stats.today_revenue.toFixed(2)}`} icon="fa-peso-sign" color="bg-yellow-100 text-yellow-600" />
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-primary-800">Recent Sales</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-50">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Cashier</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Method</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_sales.map(sale => (
                <tr key={sale.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{sale.id}</td>
                  <td className="p-3">{sale.user}</td>
                  <td className="p-3">₱{sale.total.toFixed(2)}</td>
                  <td className="p-3">{sale.method}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                      sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>{sale.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}>
        <i className={`fas ${icon} text-xl`}></i>
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}