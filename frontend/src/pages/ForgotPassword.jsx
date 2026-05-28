import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()

  const handleUsername = async (e) => {
    e.preventDefault(); setError('')
    try {
      const res = await fetch('/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setQuestion(data.question); setStep(2)
    } catch (err) { setError(err.message) }
  }

  const handleAnswer = async (e) => {
    e.preventDefault(); setError('')
    try {
      const res = await fetch('/auth/forgot-password/verify-answer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, answer })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResetToken(data.reset_token); setStep(3)
    } catch (err) { setError(err.message) }
  }

  const handlePassword = async (e) => {
    e.preventDefault(); setError('')
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    try {
      const res = await fetch('/auth/forgot-password/reset', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset_token: resetToken, new_password: newPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessage('Password reset successful!')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) { setError(err.message) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8"
         style={{ backgroundColor: '#6A784D', fontFamily: "'Libre Baskerville', serif" }}>
      <div className="w-full max-w-sm">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          {step === 1 ? 'Reset Password' : step === 2 ? 'Security Check' : 'New Password'}
        </h2>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-xl text-sm">{error}</div>}
        {message && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-xl text-sm">{message}</div>}

        {/* Step 1 – Username */}
        {step === 1 && (
          <form onSubmit={handleUsername} className="space-y-5">
            <div>
              <label className="block text-white font-medium mb-2">Username</label>
              <input type="text" required className="w-full px-4 py-3 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                style={{ backgroundColor: '#E1E7D3', color: '#2D2D2D' }} placeholder="Enter your username"
                value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <button type="submit" className="w-full py-3 rounded-full font-bold shadow-lg"
              style={{ backgroundColor: '#3E4D25', color: 'white' }}>Continue</button>
            <p className="text-center text-white/80 text-sm">
              <Link to="/login" className="text-white hover:underline font-medium">Back to Login</Link>
            </p>
          </form>
        )}

        {/* Step 2 – Security Question */}
        {step === 2 && (
          <form onSubmit={handleAnswer} className="space-y-5">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-white">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                  <i className="fas fa-lock text-xl"></i>
                </div>
                <h3 className="font-bold text-lg">Verify Your Identity</h3>
              </div>
              <p className="text-sm opacity-90 mb-2">Answer the security question you set earlier:</p>
              <div className="bg-white/20 rounded-xl p-4 font-medium text-lg">
                <i className="fas fa-question-circle mr-2"></i>{question}
              </div>
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Your Answer</label>
              <input type="text" required className="w-full px-4 py-3 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                style={{ backgroundColor: '#E1E7D3', color: '#2D2D2D' }} placeholder="Enter your answer"
                value={answer} onChange={e => setAnswer(e.target.value)} />
            </div>
            <button type="submit" className="w-full py-3 rounded-full font-bold shadow-lg"
              style={{ backgroundColor: '#3E4D25', color: 'white' }}>Verify Answer</button>
            <p className="text-center text-white/80 text-sm">
              <Link to="/login" className="text-white hover:underline font-medium">Back to Login</Link>
            </p>
          </form>
        )}

        {/* Step 3 – New Password with 👁️ toggles */}
        {step === 3 && (
          <form onSubmit={handlePassword} className="space-y-5">
            <div>
              <label className="block text-white font-medium mb-2">New Password</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                  style={{ backgroundColor: '#E1E7D3', color: '#2D2D2D' }} placeholder="At least 6 characters"
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <button type="button" className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-gray-800"
                  onClick={() => setShowNew(!showNew)} tabIndex={-1}>
                  <i className={`fas ${showNew ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Confirm New Password</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
                  style={{ backgroundColor: '#E1E7D3', color: '#2D2D2D' }} placeholder="Re-enter password"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                <button type="button" className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-gray-800"
                  onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                  <i className={`fas ${showConfirm ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <button type="submit" className="w-full py-3 rounded-full font-bold shadow-lg"
              style={{ backgroundColor: '#3E4D25', color: 'white' }}>Reset Password</button>
            <p className="text-center text-white/80 text-sm">
              <Link to="/login" className="text-white hover:underline font-medium">Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}