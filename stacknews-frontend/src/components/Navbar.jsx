import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-border bg-surface/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white font-display font-bold text-sm">
            SN
          </span>
          <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-brand-400 transition-colors">
            StackNews
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-display font-medium transition-colors ${
              isActive('/')
                ? 'text-brand-400 bg-brand-500/10'
                : 'text-gray-400 hover:text-gray-100 hover:bg-surface-hover'
            }`}
          >
            Stories
          </Link>

          {user && (
            <Link
              to="/bookmarks"
              className={`px-3 py-1.5 rounded-lg text-sm font-display font-medium transition-colors ${
                isActive('/bookmarks')
                  ? 'text-brand-400 bg-brand-500/10'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-surface-hover'
              }`}
            >
              Bookmarks
            </Link>
          )}

          <div className="w-px h-4 bg-surface-border mx-2" />

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-body hidden sm:block">
                {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="btn-ghost text-sm px-3 py-1.5"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm px-4 py-1.5">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm px-3 py-1.5">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
