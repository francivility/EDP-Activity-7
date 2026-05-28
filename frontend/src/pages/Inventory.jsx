import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

const CATEGORIES = ['Vegetables', 'Fruits', 'Whole Grains', 'Dairy', 'Poultry']
const UNITS = ['pcs', 'kg', 'g', 'L', 'mL', 'packs', 'bottles', 'trays', 'dozens']

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterSupplier, setFilterSupplier] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  // Image preview states
  const [addImagePreview, setAddImagePreview] = useState(null)
  const [addImageFile, setAddImageFile] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState(null)
  const [editImageFile, setEditImageFile] = useState(null)

  const addFileInputRef = useRef(null)
  const editFileInputRef = useRef(null)

  const fetchProducts = async () => {
    const params = {}
    if (search) params.search = search
    if (filterCategory) params.category = filterCategory
    if (filterSupplier) params.supplier = filterSupplier
    if (lowStockOnly) params.low_stock = '1'
    const res = await api.get('/products', { params })
    setProducts(res.data)
  }

  useEffect(() => {
    fetchProducts()
    api.get('/suppliers').then(res => setSuppliers(res.data))
  }, [search, filterCategory, filterSupplier, lowStockOnly])

  // --- Image handlers (unchanged) ---
  const handleAddImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAddImageFile(file)
      setAddImagePreview(URL.createObjectURL(file))
    } else {
      setAddImageFile(null)
      setAddImagePreview(null)
    }
  }

  const handleEditImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditImageFile(file)
      setEditImagePreview(URL.createObjectURL(file))
    } else {
      setEditImageFile(null)
      setEditImagePreview(null)
    }
  }

  const removeAddImage = () => {
    setAddImageFile(null)
    setAddImagePreview(null)
    if (addFileInputRef.current) addFileInputRef.current.value = ''
  }

  const removeEditImage = () => {
    setEditImageFile(null)
    setEditImagePreview(null)
    if (editFileInputRef.current) editFileInputRef.current.value = ''
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    if (addImageFile) {
      formData.set('image', addImageFile)
    } else {
      formData.delete('image')
    }
    try {
      await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setShowAddModal(false)
      setAddImagePreview(null)
      setAddImageFile(null)
      fetchProducts()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add product')
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    if (editImageFile) {
      formData.set('image', editImageFile)
    } else {
      formData.delete('image')
    }
    try {
      await api.put(`/products/${editProduct.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setEditProduct(null)
      setEditImagePreview(null)
      setEditImageFile(null)
      fetchProducts()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update product')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await api.delete(`/products/${id}`)
    fetchProducts()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-primary-800">Inventory</h2>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="bg-white rounded-full p-1 shadow flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full transition ${viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:text-gray-600'}`}
              title="Grid view"
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full transition ${viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'text-gray-400 hover:text-gray-600'}`}
              title="List view"
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-primary-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-primary-700 transition shadow-md">
            <i className="fas fa-plus mr-2"></i> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur rounded-2xl shadow p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-500 mb-1">Search</label>
          <input type="text" placeholder="Product name..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none" />
        </div>
        <div className="w-40">
          <label className="block text-xs text-gray-500 mb-1">Category</label>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-full px-3 py-2 text-sm">
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="w-40">
          <label className="block text-xs text-gray-500 mb-1">Supplier</label>
          <select value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)}
            className="w-full border border-gray-300 rounded-full px-3 py-2 text-sm">
            <option value="">All Suppliers</option>
            {suppliers.map(sup => <option key={sup} value={sup}>{sup}</option>)}
          </select>
        </div>
        <label className="flex items-center text-sm cursor-pointer">
          <input type="checkbox" checked={lowStockOnly} onChange={e => setLowStockOnly(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:ring-primary-500" />
          <span className="ml-2">Low stock only</span>
        </label>
        <button onClick={() => { setSearch(''); setFilterCategory(''); setFilterSupplier(''); setLowStockOnly(false); }}
          className="text-sm text-gray-500 hover:underline py-2">Clear</button>
      </div>

      {/* Product display: Grid or List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition">
              <div className="h-48 bg-green-50 flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <i className="fas fa-carrot text-6xl text-green-300"></i>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  {product.is_low_stock && (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">Low Stock</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{product.category || 'Uncategorized'}</p>
                <div className="mt-auto pt-3 flex justify-between items-end">
                  <div>
                    <p className="text-primary-700 font-bold text-xl">₱{product.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{product.stock_quantity} {product.unit}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => setEditProduct(product)} className="text-blue-600 hover:text-blue-800"><i className="fas fa-edit"></i></button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800"><i className="fas fa-trash-alt"></i></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-50">
              <tr>
                <th className="p-4 text-left text-sm font-medium">Image</th>
                <th className="p-4 text-left text-sm font-medium">Name</th>
                <th className="p-4 text-left text-sm font-medium">Category</th>
                <th className="p-4 text-left text-sm font-medium">Price</th>
                <th className="p-4 text-left text-sm font-medium">Stock</th>
                <th className="p-4 text-left text-sm font-medium">Unit</th>
                <th className="p-4 text-left text-sm font-medium">Supplier</th>
                <th className="p-4 text-left text-sm font-medium">Expiration</th>
                <th className="p-4 text-left text-sm font-medium">Status</th>
                <th className="p-4 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-10 w-10 object-cover rounded-full" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <i className="fas fa-carrot text-green-500"></i>
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4 text-sm">{product.category || '—'}</td>
                  <td className="p-4 text-sm">₱{product.price.toFixed(2)}</td>
                  <td className="p-4 text-sm">{product.stock_quantity}</td>
                  <td className="p-4 text-sm">{product.unit}</td>
                  <td className="p-4 text-sm">{product.supplier || '—'}</td>
                  <td className="p-4 text-sm">{product.expiration_date || '—'}</td>
                  <td className="p-4">
                    {product.is_low_stock ? (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Low Stock</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">In Stock</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button onClick={() => setEditProduct(product)} className="text-blue-600 hover:text-blue-800"><i className="fas fa-edit"></i></button>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800"><i className="fas fa-trash-alt"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal (unchanged) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-6 text-primary-800">Add New Product</h3>
            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input name="name" required placeholder="e.g., Organic Tomato"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-primary-400 outline-none text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select name="category" required defaultValue="" className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none">
                  <option value="" disabled>Select category</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱) *</label>
                  <input name="price" type="number" step="0.01" required placeholder="0.00"
                    className="w-full border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-primary-400 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                  <input name="stock_quantity" type="number" step="0.01" required placeholder="0"
                    className="w-full border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-primary-400 outline-none text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                <select name="unit" required defaultValue="kg" className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input name="supplier" placeholder="e.g., Local Farm" list="sup-list"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none" />
                <datalist id="sup-list">{suppliers.map(s => <option key={s} value={s} />)}</datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (optional)</label>
                <input name="expiration_date" type="date"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert Threshold</label>
                <input name="low_stock_threshold" type="number" defaultValue="10" placeholder="10"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image (optional)</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  ref={addFileInputRef}
                  onChange={handleAddImageChange}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {addImagePreview && (
                  <div className="mt-2 relative inline-block">
                    <img src={addImagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-xl border" />
                    <button type="button" onClick={removeAddImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-primary-600 text-white py-2.5 rounded-full font-semibold hover:bg-primary-700 transition shadow-md">
                  Save Product
                </button>
                <button type="button" onClick={() => { setShowAddModal(false); setAddImagePreview(null); setAddImageFile(null); }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2.5 rounded-full font-semibold hover:bg-gray-300 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal (unchanged) */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-6 text-primary-800">Edit Product</h3>
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input name="name" defaultValue={editProduct.name} required
                  className="w-full border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-primary-400 outline-none text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select name="category" required defaultValue={editProduct.category || ''}
                  className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none">
                  <option value="" disabled>Select category</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱) *</label>
                  <input name="price" type="number" step="0.01" defaultValue={editProduct.price} required
                    className="w-full border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-primary-400 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                  <input name="stock_quantity" type="number" step="0.01" defaultValue={editProduct.stock_quantity} required
                    className="w-full border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-primary-400 outline-none text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                <select name="unit" required defaultValue={editProduct.unit || 'kg'}
                  className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none">
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input name="supplier" defaultValue={editProduct.supplier || ''} list="sup-list"
                  className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none" />
                <datalist id="sup-list">{suppliers.map(s => <option key={s} value={s} />)}</datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (optional)</label>
                <input name="expiration_date" type="date" defaultValue={editProduct.expiration_date || ''}
                  className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert Threshold</label>
                <input name="low_stock_threshold" type="number" defaultValue={editProduct.low_stock_threshold}
                  className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary-400 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image (optional)</label>
                {editImagePreview ? (
                  <div className="relative inline-block mr-2 mb-2">
                    <img src={editImagePreview} alt="New preview" className="h-24 w-24 object-cover rounded-xl border" />
                    <button type="button" onClick={removeEditImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ) : editProduct.image_url ? (
                  <div className="relative inline-block mr-2 mb-2">
                    <img src={editProduct.image_url} alt="Current" className="h-24 w-24 object-cover rounded-xl border" />
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mb-2">No image currently</p>
                )}
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  ref={editFileInputRef}
                  onChange={handleEditImageChange}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                <p className="text-xs text-gray-400 mt-1">Select a new image to replace the current one, or leave blank to keep it unchanged.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-primary-600 text-white py-2.5 rounded-full font-semibold hover:bg-primary-700 transition shadow-md">
                  Update Product
                </button>
                <button type="button" onClick={() => { setEditProduct(null); setEditImagePreview(null); setEditImageFile(null); }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2.5 rounded-full font-semibold hover:bg-gray-300 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}