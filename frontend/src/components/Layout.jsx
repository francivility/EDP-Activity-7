import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import logo from '../assets/logo.png'

const sidebarLinks = [
  { to: '/dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
  { to: '/inventory', icon: 'fa-boxes', label: 'Inventory' },
  { to: '/pos', icon: 'fa-cash-register', label: 'Point of Sale' },
  { to: '/sales', icon: 'fa-history', label: 'Sales History' },
  { to: '/payments', icon: 'fa-credit-card', label: 'Payments' },
  { to: '/reports', icon: 'fa-chart-bar', label: 'Reports' },
  { to: '/profile', icon: 'fa-user-circle', label: 'Profile' },
  { to: '/users', icon: 'fa-users', label: 'Users', adminOnly: true },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    setShowLogoutModal(false)
    logout()
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white/70 backdrop-blur-xl border-r border-white/50 shadow-2xl rounded-r-[3rem] p-6 flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="h-20 mx-auto rounded-full shadow-lg" />
          <h1 className="text-xl font-bold mt-2 text-primary-800">Fernando's Fruits & Veggies</h1>
        </div>
        <nav className="flex-1 space-y-1">
          {sidebarLinks.map(link => {
            if (link.adminOnly && user?.role !== 'admin') return null;
            return (
              <NavLink key={link.to} to={link.to} onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center px-4 py-3 rounded-2xl text-sm font-medium transition-all ${isActive ? 'bg-primary-100 text-primary-800 shadow-inner' : 'text-gray-600 hover:bg-primary-50 hover:translate-x-1'}`}>
                <i className={`fas ${link.icon} w-6 text-primary-600`}></i>
                <span className="ml-3">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium"><i className="fas fa-user-circle mr-2"></i>{user?.full_name}</span>
            <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full capitalize">{user?.role}</span>
          </div>
          <button onClick={() => setShowLogoutModal(true)} className="w-full mt-3 flex items-center px-4 py-2 rounded-full text-red-600 hover:bg-red-50 transition">
            <i className="fas fa-sign-out-alt mr-2"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden bg-white/80 backdrop-blur p-4 flex items-center rounded-b-3xl shadow">
          <button onClick={() => setSidebarOpen(true)} className="text-primary-800 text-2xl mr-3"><i className="fas fa-bars"></i></button>
          <h2 className="text-xl font-bold">Fernando's Fruits & Veggies</h2>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
            <div className="text-5xl mb-4">👋</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Logout</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2.5 rounded-full font-semibold hover:bg-gray-300 transition"
              >
                No, stay
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-full font-semibold hover:bg-red-600 transition shadow-md"
              >
                Yes, logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}