import { useState } from 'react'

export default function GCashSimulation({ total, method, onPay, onCancel }) {
  const [step, setStep] = useState('confirm') // 'confirm' → 'processing' → 'success'
  const [generatedRef, setGeneratedRef] = useState('')
  const isGcash = method === 'gcash'

  const handleConfirm = () => {
    setStep('processing')
    // Simulate GCash processing delay
    setTimeout(() => {
      const ref = 'REF-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      setGeneratedRef(ref)
      setStep('success')
      // After showing success screen, pass reference back to POS
      setTimeout(() => {
        onPay(ref)
      }, 2000)
    }, 2000)
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
          <div className="p-8 text-center space-y-5">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-check-circle text-5xl text-green-500"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Payment Successful</h3>
            <p className="text-gray-600">Amount paid</p>
            <p className="text-3xl font-bold text-gray-900">₱{total.toFixed(2)}</p>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reference Number</p>
              <p className="font-mono font-bold text-xl text-primary-800 tracking-wider">{generatedRef}</p>
            </div>
            <p className="text-sm text-gray-400">This reference has been saved automatically.</p>
            <button
              onClick={() => onPay(generatedRef)}
              className="w-full bg-blue-600 text-white py-3 rounded-full font-bold hover:bg-blue-700 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* GCash-style header */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <div className="flex justify-between items-center mb-4">
            <button onClick={onCancel} className="text-white hover:underline text-sm">
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-lg">{isGcash ? 'GCash' : 'Card'}</span>
            </div>
            <div className="w-12"></div>
          </div>

          <p className="text-sm opacity-90">Pay to</p>
          <p className="text-lg font-semibold">Fernando's Fruits & Veggies</p>
          <p className="text-4xl font-bold mt-3">₱{total.toFixed(2)}</p>
        </div>

        {/* Payment details */}
        <div className="p-6 space-y-5">
          {/* Simulated QR code area (for GCash) */}
          {isGcash && (
            <div className="flex justify-center">
              <div className="w-40 h-40 bg-gray-100 rounded-2xl flex items-center justify-center border border-dashed border-gray-300">
                <div className="text-center text-gray-400">
                  <i className="fas fa-qrcode text-5xl"></i>
                  <p className="text-xs mt-2">QR Code</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">Amount</span>
              <span className="font-medium">₱{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Merchant</span>
              <span className="font-medium">Fernando's Fruits & Veggies</span>
            </div>
          </div>

          {step === 'confirm' && (
            <button
              onClick={handleConfirm}
              className="w-full bg-blue-600 text-white py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg"
            >
              Confirm Payment
            </button>
          )}

          {step === 'processing' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-sm text-gray-600">Processing payment…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}