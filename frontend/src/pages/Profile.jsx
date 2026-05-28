import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [securityQuestion, setSecurityQuestion] = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      const res = await fetch('/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessage('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSetSecurity = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      const res = await fetch('/auth/set-security', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ question: securityQuestion, answer: securityAnswer })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessage('Security question updated')
      setSecurityAnswer('')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-primary-800">My Profile</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Account Details</h3>
          <div className="space-y-2">
            <p><span className="text-gray-500">Username:</span> {user?.username}</p>
            <p><span className="text-gray-500">Full Name:</span> {user?.full_name}</p>
            <p><span className="text-gray-500">Role:</span> {user?.role}</p>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input type="password" required className="w-full border border-gray-300 rounded-xl p-2"
                value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input type="password" required className="w-full border border-gray-300 rounded-xl p-2"
                value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input type="password" required className="w-full border border-gray-300 rounded-xl p-2"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {message && <div className="text-green-600 text-sm">{message}</div>}
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-full font-medium hover:bg-primary-700">Update Password</button>
          </form>
        </div>

        {/* Security Question */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Security Question</h3>
          <form onSubmit={handleSetSecurity} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Question</label>
              <input type="text" className="w-full border border-gray-300 rounded-xl p-2"
                value={securityQuestion} onChange={e => setSecurityQuestion(e.target.value)}
                placeholder="e.g., What is your pet's name?" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Answer</label>
              <input type="text" className="w-full border border-gray-300 rounded-xl p-2"
                value={securityAnswer} onChange={e => setSecurityAnswer(e.target.value)} />
            </div>
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-full font-medium hover:bg-primary-700">Save Security Question</button>
          </form>
        </div>
      </div>
    </div>
  )
}