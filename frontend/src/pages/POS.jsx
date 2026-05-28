import { useState, useEffect, useMemo } from 'react'
import api from '../services/api'
import ReceiptModal from '../components/ReceiptModal'
import GCashSimulation from '../components/GCashSimulation'

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Whole Grains', 'Dairy', 'Poultry']
const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: 'fa-money-bill-wave', color: 'bg-green-500' },
  { id: 'gcash', label: 'GCash', icon: 'fa-mobile-alt', color: 'bg-blue-500' },
  { id: 'card', label: 'Card', icon: 'fa-credit-card', color: 'bg-purple-500' },
]

export default function POS() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')
  const [receiptSaleId, setReceiptSaleId] = useState(null)
  const [simulateData, setSimulateData] = useState(null)

  useEffect(() => {
    api.get('/products').then(res => setProducts(res.data))
    fetchCart()
  }, [])

  const fetchCart = async () => {
    const res = await api.get('/cart')
    setCart(res.data)
  }

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products
    return products.filter(p => p.category === activeCategory)
  }, [products, activeCategory])

  const addToCart = async (product) => {
    try {
      await api.post('/cart/add', { product_id: product.id, quantity: 1 })
      fetchCart()
    } catch (err) {
      alert(err.response?.data?.error || 'Error adding to cart')
    }
  }

  const incrementCartItem = async (productId, currentQty) => {
    const step = currentQty < 1 ? 0.1 : 1
    await api.put(`/cart/update/${productId}`, { quantity: currentQty + step })
    fetchCart()
  }

  const decrementCartItem = async (productId, currentQty) => {
    const step = currentQty <= 1 ? 0.1 : 1
    const newQty = Math.max(0, currentQty - step)
    if (newQty === 0) {
      await api.delete(`/cart/remove/${productId}`)
    } else {
      await api.put(`/cart/update/${productId}`, { quantity: newQty })
    }
    fetchCart()
  }

  const removeFromCart = async (productId) => {
    await api.delete(`/cart/remove/${productId}`)
    fetchCart()
  }

  const clearCart = async () => {
    await api.post('/cart/clear')
    setCart([])
  }

  const checkout = async () => {
    if (cart.length === 0) return
    setLoading(true)
    try {
      const res = await api.post('/checkout', { payment_method: paymentMethod })
      if (res.data.cash) {
        setCart([])
        api.get('/products').then(res => setProducts(res.data))
        setReceiptSaleId(res.data.sale_id)
      } else if (res.data.simulate) {
        setCart([])
        api.get('/products').then(res => setProducts(res.data))
        setSimulateData({
          saleId: res.data.sale_id,
          total: res.data.total,
          method: res.data.method
        })
      } else {
        alert('Unexpected response: ' + JSON.stringify(res.data))
      }
    } catch (err) {
      alert('Checkout failed: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  // THIS FUNCTION NOW RECEIVES AND SENDS THE REFERENCE
  const confirmSimulatedPayment = async (referenceNo) => {
    if (!simulateData) return
    try {
      await api.put(`/sales/status/${simulateData.saleId}`, {
        status: 'completed',
        reference: referenceNo      // <-- THE FIX: sends the reference
      })
      setReceiptSaleId(simulateData.saleId)
      setSimulateData(null)
    } catch (err) {
      alert('Failed to confirm payment: ' + (err.response?.data?.error || err.message))
    }
  }

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0)

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Products Section */}
      <div className="flex-1 bg-white/70 backdrop-blur rounded-3xl shadow-xl p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-primary-800 mb-4">
          <i className="fas fa-seedling mr-2"></i>Products
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                ${activeCategory === cat
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col"
              >
                <div className="h-36 bg-green-50 flex items-center justify-center relative">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <i className="fas fa-carrot text-5xl text-green-300"></i>
                  )}
                  <span className="absolute top-2 left-2 bg-white/90 text-xs px-2 py-0.5 rounded-full shadow">
                    {product.category || 'Other'}
                  </span>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-semibold text-sm">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">₱{product.price.toFixed(2)} / {product.unit}</p>
                  <p className={`text-xs mt-1 ${product.is_low_stock ? 'text-red-600' : 'text-gray-500'}`}>
                    Stock: {product.stock_quantity}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="mt-2 w-full bg-primary-100 text-primary-700 py-1.5 rounded-full text-xs font-medium hover:bg-primary-200 transition"
                  >
                    <i className="fas fa-plus mr-1"></i> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-96 bg-white/70 backdrop-blur rounded-3xl shadow-xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary-800">
            <i className="fas fa-shopping-basket mr-2"></i>Cart
          </h2>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-xs text-red-500 hover:underline">Clear all</button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 mb-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">
              <i className="fas fa-shopping-cart text-5xl mb-3"></i>
              <p>Your cart is empty</p>
              <p className="text-xs mt-1">Tap a product to add it</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product_id} className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex-1 mr-2">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">₱{item.unit_price.toFixed(2)} / unit</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-gray-100 rounded-full">
                    <button
                      onClick={() => decrementCartItem(item.product_id, item.quantity)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200"
                    >
                      <i className="fas fa-minus text-xs"></i>
                    </button>
                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => incrementCartItem(item.product_id, item.quantity)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200"
                    >
                      <i className="fas fa-plus text-xs"></i>
                    </button>
                  </div>
                  <span className="font-bold text-sm w-16 text-right">₱{item.subtotal.toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-600">
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {PAYMENT_METHODS.map(method => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                  paymentMethod === method.id
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${method.color} flex items-center justify-center text-white mb-1`}>
                  <i className={`fas ${method.icon}`}></i>
                </div>
                <span className="text-xs font-medium">{method.label}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="text-2xl font-bold text-primary-800">₱{total.toFixed(2)}</span>
          </div>

          <button
            onClick={checkout}
            disabled={cart.length === 0 || loading}
            className="w-full bg-primary-600 text-white py-3 rounded-full font-bold hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {receiptSaleId && (
        <ReceiptModal saleId={receiptSaleId} onClose={() => setReceiptSaleId(null)} />
      )}

      {/* GCash / Card Simulation Modal */}
      {simulateData && (
        <GCashSimulation
          total={simulateData.total}
          method={simulateData.method}
          onPay={confirmSimulatedPayment}
          onCancel={() => setSimulateData(null)}
        />
      )}
    </div>
  )
}