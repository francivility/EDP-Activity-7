import { useAuth } from '../context/AuthContext'

export default function Reports() {
  const { token } = useAuth()

  const downloadReport = async (type, params = '') => {
    try {
      const query = params ? `?${params}` : ''
      const response = await fetch(`/reports/export/${type}${query}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(`HTTP ${response.status}: ${text}`)
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}_report.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Download failed: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-primary-800">Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sales Report */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Sales Report</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input type="date" id="startDate" className="w-full border border-gray-300 rounded-full px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">End Date</label>
              <input type="date" id="endDate" className="w-full border border-gray-300 rounded-full px-3 py-2 text-sm" />
            </div>
            <button
              onClick={() => {
                const start = document.getElementById('startDate').value
                const end = document.getElementById('endDate').value
                downloadReport('sales', `start=${start}&end=${end}`)
              }}
              className="w-full bg-primary-600 text-white py-2 rounded-full font-medium hover:bg-primary-700"
            >
              <i className="fas fa-download mr-2"></i>Download Excel
            </button>
          </div>
        </div>

        {/* Inventory Report */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Inventory Report</h3>
          <button
            onClick={() => downloadReport('inventory')}
            className="w-full bg-primary-600 text-white py-2 rounded-full font-medium hover:bg-primary-700"
          >
            <i className="fas fa-download mr-2"></i>Download Excel
          </button>
        </div>

        {/* Payments Report */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Payments Report</h3>
          <button
            onClick={() => downloadReport('payments')}
            className="w-full bg-primary-600 text-white py-2 rounded-full font-medium hover:bg-primary-700"
          >
            <i className="fas fa-download mr-2"></i>Download Excel
          </button>
        </div>
      </div>
    </div>
  )
}