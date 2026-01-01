'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Car, Calendar, MapPin, Settings, RefreshCw, Send, Menu, X, FileText, Users, AlertTriangle, Clock, ChevronDown, ChevronRight } from 'lucide-react'
import { BsBell, BsPersonCircle, BsGear, BsBoxArrowRight } from 'react-icons/bs'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-toastify'
import { fetchWithAuth } from '@/lib/fetch-with-auth'
import { getUser } from '@/lib/auth-token'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const [currentUser, setCurrentUser] = useState(getUser())
  const [showTempPasswordBanner, setShowTempPasswordBanner] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState('')
  const [logsDropdownOpen, setLogsDropdownOpen] = useState(false)

  useEffect(() => {
    const usr = getUser()
    setCurrentUser(usr)

    // Check if user has temp password
    if (usr?.hasTempPassword && usr?.tempPasswordExpiresAt) {
      setShowTempPasswordBanner(true)

      // Update countdown every second
      const interval = setInterval(() => {
        const expiryTime = new Date(usr.tempPasswordExpiresAt!).getTime()
        const now = new Date().getTime()
        const diff = expiryTime - now

        if (diff <= 0) {
          setTimeRemaining('EXPIRED')
          clearInterval(interval)
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((diff % (1000 * 60)) / 1000)
          setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetchWithAuth('/api/sync/wialon', { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        toast.success(data.message)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        toast.error('Sync failed: ' + data.error)
      }
    } catch (error) {
      toast.error('Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const navItems = [
    { href: '/dashboard', label: 'Bookings', icon: Calendar },
    { href: '/dashboard/vehicles', label: 'Vehicles', icon: Car },
    { href: '/dashboard/holidaytaxis', label: 'HolidayTaxis', icon: Send },
    { href: '/dashboard/map', label: 'Live Map', icon: MapPin },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ]

  const logsDropdownItems = [
    { href: '/dashboard/logs', label: 'Submission Logs' },
    { href: '/dashboard/audit-logs', label: 'Audit Logs', adminOnly: true },
  ]

  const isActive = (href: string) => {
    // For the dashboard home, we need an exact match to avoid highlighting on all sub-routes
    if (href === '/dashboard') {
      return pathname === href;
    }
    // For other routes, check if the current path starts with the href
    return pathname.startsWith(href);
  }

  const isLogsActive = logsDropdownItems.some(item => isActive(item.href))

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 fixed left-0 top-0 bottom-0 flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 pointer-events-none"></div>

        {/* Branding */}
        <div className="relative p-6 border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-50"></div>
                <div className="relative p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                  <Car className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">
                  Taxi Integration
                </h1>
                <p className="text-xs text-slate-400 font-medium">Management System</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 px-3 py-4 overflow-y-auto">
          <div className="mb-2 px-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Main Menu</p>
          </div>
          <ul className="space-y-0.5">
            {/* Regular Navigation Items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 no-underline ${
                      active
                        ? 'text-blue-400'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className={`relative p-2 rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-blue-500/20'
                        : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                      <Icon className="h-5 w-5 flex-shrink-0" />
                    </div>
                    <span className={`relative text-sm font-medium ${active ? 'font-bold' : ''}`}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}

            {/* Logs Dropdown */}
            <li>
              <button
                onClick={() => setLogsDropdownOpen(!logsDropdownOpen)}
                className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 w-full ${
                  isLogsActive
                    ? 'text-blue-400'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className={`relative p-2 rounded-lg transition-all duration-200 ${
                  isLogsActive
                    ? 'bg-blue-500/20'
                    : 'bg-white/5 group-hover:bg-white/10'
                }`}>
                  <FileText className="h-5 w-5 flex-shrink-0" />
                </div>
                <span className={`relative text-sm font-medium flex-1 text-left ${isLogsActive ? 'font-bold' : ''}`}>
                  Logs
                </span>
                {logsDropdownOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {/* Logs Submenu */}
              {logsDropdownOpen && (
                <ul className="mt-1 ml-4 space-y-0.5">
                  {logsDropdownItems
                    .filter((item) => {
                      if (item.adminOnly && !currentUser?.isAdmin) {
                        return false;
                      }
                      return true;
                    })
                    .map((item) => {
                      const active = isActive(item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-200 no-underline ${
                              active
                                ? 'text-blue-400 bg-blue-500/10'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                            <span className={`relative text-sm ${active ? 'font-semibold' : ''}`}>
                              {item.label}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              )}
            </li>

            {/* Admin-Only: Users */}
            {currentUser?.isAdmin && (
              <li>
                <Link
                  href="/dashboard/users"
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 no-underline ${
                    isActive('/dashboard/users')
                      ? 'text-blue-400'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className={`relative p-2 rounded-lg transition-all duration-200 ${
                    isActive('/dashboard/users')
                      ? 'bg-blue-500/20'
                      : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                    <Users className="h-5 w-5 flex-shrink-0" />
                  </div>
                  <span className={`relative text-sm font-medium ${isActive('/dashboard/users') ? 'font-bold' : ''}`}>
                    Users
                  </span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* Sync Button */}
        <div className="relative p-4 border-t border-white/10 backdrop-blur-sm">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="relative w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <RefreshCw className={`relative h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            <span className="relative">{syncing ? 'Syncing...' : 'Sync Wialon'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 w-full min-w-0">
        {/* Top Header */}
        <header className="relative bg-white/80 backdrop-blur-xl border-b border-gray-200/40 shadow-sm w-full">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30 pointer-events-none"></div>

          <div className="relative px-4 sm:px-6 py-3.5">
            <div className="flex items-center justify-between gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden relative p-2.5 text-slate-600 hover:text-slate-900 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-md group"
              >
                <Menu className="h-5 w-5 transition-transform group-hover:scale-110" />
              </button>

              {/* Right side items */}
              <div className="flex items-center gap-2 ml-auto">
                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Logout"
                >
                  <BsBoxArrowRight className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>

                {/* Divider */}
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-1"></div>

                {/* Notifications */}
                <button
                  className="relative p-2.5 text-slate-600 hover:text-slate-900 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-lg group"
                  aria-label="Notifications"
                >
                  <div className="relative">
                    <BsBell className="h-5 w-5 transition-all duration-200 group-hover:scale-110 group-hover:-rotate-12" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-br from-red-500 to-red-600 items-center justify-center">
                        <span className="text-white text-[9px] font-bold">3</span>
                      </span>
                    </span>
                  </div>
                </button>

                {/* Divider */}
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-1"></div>

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-white hover:shadow-lg">
                    {/* User Info */}
                    <div className="text-right hidden sm:block leading-none space-y-0">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-none mb-0">{user?.name || 'User'}</p>
                      <p className="text-[11px] text-slate-500 leading-none mt-0">{user?.email || 'user@email.com'}</p>
                    </div>

                    {/* Avatar with enhanced styling */}
                    <div className="relative">
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-all duration-300"></div>

                      {/* Rotating ring */}
                      <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>

                      {/* Avatar */}
                      <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white group-hover:scale-105 transition-all duration-200">
                        <span className="relative z-10">
                          {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </span>
                      </div>

                      {/* Online status indicator */}
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-br from-green-400 to-green-500 rounded-full ring-2 ring-white shadow-md">
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                      </div>
                    </div>
                  </button>

                  {/* Dropdown menu */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden z-50">
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</div>
                      <Link
                        href="/dashboard/profile"
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-150 no-underline"
                      >
                        <BsPersonCircle className="h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-150 no-underline"
                      >
                        <BsGear className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                      <div className="my-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150"
                      >
                        <BsBoxArrowRight className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Temporary Password Warning Banner */}
        {showTempPasswordBanner && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
            <div className="px-4 sm:px-6 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold">Temporary Password Active</h3>
                    <p className="text-xs text-white/90 mt-0.5">
                      You must change your password within <strong className="font-bold">{timeRemaining}</strong> or your account will be locked
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push('/dashboard/profile')}
                    className="px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-semibold text-sm shadow-lg flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">Change Password Now</span>
                    <span className="sm:hidden">Change Now</span>
                  </button>
                  <button
                    onClick={() => setShowTempPasswordBanner(false)}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Dismiss"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="p-4 sm:p-6 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
