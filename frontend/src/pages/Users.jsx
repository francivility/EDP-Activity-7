import { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Users() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState({
    username: '',
    full_name: '',
    password: '',
    role: 'staff',
    security_question: '',
    security_answer: ''
  })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch (err) {
      setError('Failed to load users')
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      await api.post('/users', form)
      setMessage('User created successfully')
      setShowAdd(false)
      resetForm()
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user')
    }
  }

  const openEdit = (user) => {
    setEditUser(user)
    setForm({
      username: user.username,
      full_name: user.full_name,
      password: '',            // leave blank to keep current password
      role: user.role,
      security_question: user.security_question || '',
      security_answer: ''      // leave blank to keep current answer
    })
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const payload = {
        username: form.username,
        full_name: form.full_name,
        role: form.role,
        security_question: form.security_question,
        security_answer: form.security_answer
      }
      // Only include password if a new one was typed
      if (form.password.trim()) {
        payload.password = form.password
      }
      await api.put(`/users/${editUser.id}`, payload)
      setMessage('User updated successfully')
      setEditUser(null)
      resetForm()
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user')
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await api.delete(`/users/${userId}`)
      fetchUsers()
      setMessage('User deleted')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user')
    }
  }

  const resetForm = () => {
    setForm({
      username: '',
      full_name: '',
      password: '',
      role: 'staff',
      security_question: '',
      security_answer: ''
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary-800">User Management</h2>
        <button onClick={() => setShowAdd(true)} className="bg-primary-600 text-white px-4 py-2 rounded-full font-medium hover:bg-primary-700">
          <i className="fas fa-plus mr-2"></i>Add User
        </button>
      </div>

      {message && <div className="p-3 bg-green-100 text-green-800 rounded-xl">{message}</div>}
      {error && <div className="p-3 bg-red-100 text-red-800 rounded-xl">{error}</div>}

      {/* Add User Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Add New User</h3>
            <UserForm form={form} setForm={setForm} onSubmit={handleAdd} onCancel={() => { setShowAdd(false); resetForm(); }} submitLabel="Create" />
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit User: {editUser.username}</h3>
            <UserForm form={form} setForm={setForm} onSubmit={handleEdit} onCancel={() => { setEditUser(null); resetForm(); }} submitLabel="Update" />
          </div>
        </div>
      )}

      {/* User Table */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary-50">
            <tr>
              <th className="p-4 text-left">Username</th>
              <th className="p-4 text-left">Full Name</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Created</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-4">{u.username}</td>
                <td className="p-4">{u.full_name}</td>
                <td className="p-4"><span className="capitalize px-2 py-0.5 rounded-full text-xs bg-primary-100 text-primary-800">{u.role}</span></td>
                <td className="p-4 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => openEdit(u)} className="text-blue-600 hover:underline">
                    <i className="fas fa-edit"></i>
                  </button>
                  {u.id !== currentUser?.id && (
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Reusable form for both Add and Edit
function UserForm({ form, setForm, onSubmit, onCancel, submitLabel }) {
  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input type="text" required className="w-full border border-gray-300 rounded-xl p-2"
          value={form.full_name} onChange={e => update('full_name', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <input type="text" required className="w-full border border-gray-300 rounded-xl p-2"
          value={form.username} onChange={e => update('username', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Password {submitLabel === 'Update' ? '(leave blank to keep current)' : ''}
        </label>
        <input type="password" className="w-full border border-gray-300 rounded-xl p-2"
          value={form.password} onChange={e => update('password', e.target.value)}
          placeholder={submitLabel === 'Update' ? 'Unchanged if empty' : 'Required'} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select className="w-full border border-gray-300 rounded-xl p-2"
          value={form.role} onChange={e => update('role', e.target.value)}>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Security Question</label>
        <input type="text" className="w-full border border-gray-300 rounded-xl p-2"
          value={form.security_question} onChange={e => update('security_question', e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Security Answer</label>
        <input type="text" className="w-full border border-gray-300 rounded-xl p-2"
          value={form.security_answer} onChange={e => update('security_answer', e.target.value)} />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 bg-primary-600 text-white py-2 rounded-full font-semibold hover:bg-primary-700">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-full font-semibold hover:bg-gray-300">
          Cancel
        </button>
      </div>
    </form>
  )
}