import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STORE_LINES = ["FERNANDO'S", "FRUITS and", "VEGGIES"]

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const [displayedLines, setDisplayedLines] = useState(["", "", ""])
  const timerRef = useRef(null)

  useEffect(() => {
    let line = 0, char = 0

    const typeNext = () => {
      if (line >= STORE_LINES.length) return

      if (char < STORE_LINES[line].length) {
        setDisplayedLines(prev => {
          const updated = [...prev]
          updated[line] = STORE_LINES[line].slice(0, char + 1)
          return updated
        })
        char++
        timerRef.current = setTimeout(typeNext, 80)
      } else {
        line++
        char = 0
        if (line < STORE_LINES.length) {
          timerRef.current = setTimeout(typeNext, 400)
        }
      }
    }

    timerRef.current = setTimeout(typeNext, 300)
    return () => clearTimeout(timerRef.current)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      login(data.user, data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "'Libre Baskerville', serif" }}>
      {/* Left – full image + typing text */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/bg.jpg"
          alt="Vegetables background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative w-full flex flex-col justify-center items-start p-12 z-10">
          <h1 className="text-5xl xl:text-6xl font-bold text-white text-left tracking-wide leading-tight">
            {displayedLines.map((line, idx) => (
              <span key={idx}>
                {line}
                {idx < STORE_LINES.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="text-xl text-white/80 mt-4">Vegetable Store Management</p>
        </div>
      </div>

      {/* Right – login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8"
           style={{ backgroundColor: '#6A784D' }}>
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Fernando's Fruits & Veggies</h2>
            <p className="text-white/80 text-sm mt-1">Let's Get Picking</p>
          </div>

          <h2 className="hidden lg:block text-3xl font-bold text-white mb-8 text-center">Let's Get Picking</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-xl text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white font-medium mb-2">Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                style={{ backgroundColor: '#E1E7D3', color: '#2D2D2D' }}
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:border-white"
                  style={{ backgroundColor: '#E1E7D3', color: '#2D2D2D' }}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-gray-800"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-full font-bold transition shadow-lg"
              style={{ backgroundColor: '#3E4D25', color: 'white' }}
            >
              Login
            </button>
            <p className="text-center text-white/80 text-sm">
              <Link to="/forgot-password" className="text-white hover:underline font-medium">
                Forgot your password?
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}