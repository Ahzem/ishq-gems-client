'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { LogOut, Settings, User, ChevronDown, Home, ShoppingCart, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import S3Image from '@/components/common/S3Image'
import { NotificationSystem } from '@/components/notifications'
import MessagesIcon from '@/components/messages/MessagesIcon'

export default function DashboardHeader() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, logout } = useAuth()
  const { theme, setTheme, systemTheme } = useTheme()
  const router = useRouter()

  // Theme toggle function that cycles through light and dark only
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('light')
    } else {
      // If system theme, switch to opposite of current system preference
      setTheme(systemTheme === 'dark' ? 'light' : 'dark')
    }
  }

  // Get the effective theme (resolves system to actual theme)
  const effectiveTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileOpen) {
        const target = event.target as Element
        if (!target.closest('.profile-dropdown')) {
          setIsProfileOpen(false)
        }
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isProfileOpen])

  if (!user) return null

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-40 bg-card/80 backdrop-blur-xl border-b border-border/30 h-16">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
        {/* Page Title - will be updated by individual pages */}
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground" data-page-title>
            Dashboard
          </h1>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notifications */}
          <NotificationSystem />

          {/* Messages */}
          <MessagesIcon />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl hover:bg-secondary/50 transition-all duration-300 group relative overflow-hidden border border-border/20 hover:border-primary/30 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle theme"
            title={mounted ? `Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
            {!mounted ? (
              <div className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
            ) : (
              <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                {effectiveTheme === 'dark' ? (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-foreground group-hover:text-primary transition-colors duration-300" />
                ) : (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-foreground group-hover:text-primary transition-colors duration-300" />
                )}
              </div>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative profile-dropdown">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 sm:space-x-3 px-3 py-2 rounded-xl hover:bg-secondary/50 transition-all duration-300 group border border-border/20 hover:border-primary/30"
            >
              {user.avatar ? (
                <S3Image
                  src={user.avatar}
                  alt={user.fullName}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                  fallbackText={getUserInitials(user.fullName)}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                  {getUserInitials(user.fullName)}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {user.fullName}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.role}
                </p>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-card/95 backdrop-blur-xl border border-border/30 rounded-xl shadow-xl shadow-primary/10 py-2 z-50">
                <div className="px-4 py-3 border-b border-border/30">
                  <p className="text-sm font-medium text-foreground">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-primary font-medium capitalize mt-1">{user.role}</p>
                </div>
                
                <div className="py-2">
                  <Link
                    href={user.role === 'admin' || user.role === 'seller' ? '/dashboard/profile' : '/account/profile'}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </Link>
                  
                  <Link
                    href={user.role === 'admin' ? '/admin/cart' : user.role === 'seller' ? '/seller/cart' : '/account/cart'}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>My Cart</span>
                  </Link>
                  
                  <Link
                    href={user.role === 'admin' ? '/admin/settings' : user.role === 'seller' ? '/seller/settings' : '/account/settings'}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>

                  {/* Dashboard link based on role */}
                  <Link
                    href={user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller' : '/'}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Home className="h-4 w-4" />
                    <span>Dashboard Home</span>
                  </Link>
                </div>
                
                <div className="border-t border-border/30 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}