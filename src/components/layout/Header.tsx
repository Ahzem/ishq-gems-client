'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Menu, X, Sun, Moon, Gem, User, ShoppingBag, Heart, Settings, LogOut, ChevronDown, Star, ShoppingCart } from 'lucide-react'
import { NAVIGATION_LINKS } from '@/lib/constants'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ConfirmDialog } from '@/components/alerts'
import S3Image from '@/components/common/S3Image'
import { NotificationSystem } from '@/components/notifications'
import MessagesIcon from '@/components/messages/MessagesIcon'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { theme, setTheme, systemTheme } = useTheme()
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Update scrolled state for styling
      setIsScrolled(currentScrollY > 10)
      
      // Show/hide logic with optimized thresholds
      if (currentScrollY < 10) {
        // Always show at top
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down and past threshold - hide (reduced from 100 to 80 for quicker response)
        setIsVisible(false)
        setIsMenuOpen(false) // Close mobile menu when hiding
        setIsProfileOpen(false) // Close profile menu when hiding
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show immediately
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    // Use passive listener with optimized throttling for smoother performance
    let ticking = false
    const scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', scrollHandler, { passive: true })
    return () => window.removeEventListener('scroll', scrollHandler)
  }, [lastScrollY])

  // Close dropdowns when clicking outside
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

  const navLinks = NAVIGATION_LINKS

  const authLinks = [
    { href: '/signin', label: 'Login' },
    { href: '/signup', label: 'Sign Up' },
  ]

  // Buyer profile menu items
  const buyerMenuItems = [
    { icon: User, label: 'My Profile', href: '/account/profile' },
    { icon: ShoppingBag, label: 'My Orders', href: '/account/orders' },
    { icon: Heart, label: 'Wishlist', href: '/account/wishlist' },
    { icon: Star, label: 'Become a Seller', href: '/account/become-seller' },
    { icon: Settings, label: 'Account Settings', href: '/account/settings' },
  ]

  // Seller profile menu items
  const sellerMenuItems = [
    { icon: User, label: 'My Profile', href: '/dashboard/profile' },
    { icon: ShoppingBag, label: 'My Orders', href: '/account/orders' },
    { icon: ShoppingCart, label: 'My Cart', href: '/account/cart' },
    { icon: Heart, label: 'Wishlist', href: '/account/wishlist' },
    { icon: Gem, label: 'Add New Gem', href: '/dashboard/add-gem' },
    { icon: Settings, label: 'Dashboard', href: '/seller' },
  ]

  // Admin profile menu items
  const adminMenuItems = [
    { icon: User, label: 'My Profile', href: '/dashboard/profile' },
    { icon: ShoppingBag, label: 'My Orders', href: '/account/orders' },
    { icon: ShoppingCart, label: 'My Cart', href: '/account/cart' },
    { icon: Heart, label: 'Wishlist', href: '/account/wishlist' },
    { icon: Gem, label: 'Add New Gem', href: '/dashboard/add-gem' },
    { icon: Settings, label: 'Dashboard', href: '/admin' },
  ]

  // Check if a link is active
  const isLinkActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    try {
      setShowLogoutConfirm(false)
      
      // Call the auth logout function which handles server-side token invalidation
      await logout();
      
      // Clear any additional cached data
      if (typeof window !== 'undefined') {
        // Clear session storage
        sessionStorage.clear();
        
        // Clear any cached auth data
        localStorage.removeItem('lastLoginTime');
        localStorage.removeItem('userPreferences');
        
        // Force page reload to clear any cached states
        setTimeout(() => {
          window.location.href = '/signin?message=You have been logged out successfully';
        }, 100);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to signin for security
      if (typeof window !== 'undefined') {
        window.location.href = '/signin?message=Session expired. Please login again.';
      }
    } 
  }

  const cancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out
        ${isVisible 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-full opacity-0'
        }
        ${isScrolled 
          ? 'shadow-primary/1' 
          : 'bg-background/95 backdrop-blur-md border-border border-b'
        }
      `}
    >
      {/* Curved Container */}
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        <div 
          className={`
            relative transition-all duration-300 ease-out
            ${isScrolled 
              ? 'mx-1 sm:mx-2 md:mx-4 lg:mx-6 mt-1 sm:mt-2 rounded-xl sm:rounded-2xl bg-card/90 backdrop-blur-xl border border-border/30 shadow-xl shadow-primary/10' 
              : 'mx-0 mt-0 rounded-none bg-transparent'
            }
          `}
        >
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 lg:h-20 px-3 sm:px-4 md:px-5 lg:px-6">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-1 sm:space-x-1.5 lg:space-x-2 group">
              <div className="relative">
                <Gem className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary group-hover:text-accent transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/20 blur-sm group-hover:bg-accent/30 transition-all duration-300 rounded-full"></div>
              </div>
              <span className="font-serif text-base sm:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_100%] group-hover:bg-[position:100%_0%] transition-all duration-300">
                Ishq Gems
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link, index) => {
                // Hide "Sell with Us" link for sellers and admins (they already have selling capabilities)
                if (link.href === '/sell' && isAuthenticated && (user?.role === 'seller' || user?.role === 'admin')) {
                  return null
                }
                
                const isActive = isLinkActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3 lg:px-4 py-2 transition-all duration-300 font-medium group rounded-xl text-sm lg:text-base ${
                      isActive 
                        ? 'text-primary bg-primary/5 shadow-sm' 
                        : 'text-foreground/80 hover:text-primary hover:bg-primary/5'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="relative z-10">{link.label}</span>
                    <span className={`absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 transition-all duration-300 scale-95 group-hover:scale-100 ${
                      isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}></span>
                    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-full ${
                      isActive ? 'w-8' : 'w-0 group-hover:w-6'
                    }`}></span>
                  </Link>
                )
              })}
            </nav>

            {/* Auth & Theme Toggle & Mobile Menu Button */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              {/* Notification System */}
              {isAuthenticated && (
                <div className="hidden sm:block">
                  <NotificationSystem />
                </div>
              )}

              {/* Messages */}
              {isAuthenticated && (
                <div>
                  <MessagesIcon />
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl hover:bg-secondary/50 transition-all duration-300 group border border-border/20 hover:border-primary/30 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Toggle theme"
                title={mounted ? `Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl sm:rounded-2xl"></span>
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

              {/* Authentication Section */}
              {isAuthenticated && user ? (
                user.role === 'buyer' ? (
                  // Buyer Profile Dropdown
                  <div className="relative profile-dropdown">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="hidden md:flex items-center space-x-1.5 lg:space-x-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg lg:rounded-xl hover:bg-secondary/50 transition-all duration-300 group border border-border/20 hover:border-primary/30"
                    >
                      {user.avatar ? (
                        <S3Image
                          src={user.avatar}
                          alt={user.fullName}
                          className="w-6 h-6 lg:w-8 lg:h-8 rounded-full object-cover"
                          width={32}
                          height={32}
                          fallbackText={getUserInitials(user.fullName)}
                          showFallbackIcon={true}
                        />
                      ) : (
                        <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs lg:text-sm">
                          {getUserInitials(user.fullName)}
                        </div>
                      )}
                      <span className="text-xs lg:text-sm font-medium text-foreground group-hover:text-primary transition-colors max-w-[80px] lg:max-w-[120px] truncate">
                        {user.fullName.split(' ')[0]}
                      </span>
                      <ChevronDown className={`w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-card/95 backdrop-blur-xl border border-border/30 rounded-xl shadow-xl shadow-primary/10 py-2 z-50">
                        <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-border/30">
                          <p className="text-xs sm:text-sm font-medium text-foreground truncate">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        
                        {buyerMenuItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <item.icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        ))}
                        
                        <div className="border-t border-border/30 mt-2 pt-2">
                          <button
                            onClick={() => {
                              setIsProfileOpen(false)
                              handleLogout()
                            }}
                            className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 w-full"
                          >
                            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Seller/Admin Profile Dropdown (same structure as buyer)
                  <div className="relative profile-dropdown">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="hidden md:flex items-center space-x-1.5 lg:space-x-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg lg:rounded-xl hover:bg-secondary/50 transition-all duration-300 group border border-border/20 hover:border-primary/30"
                    >
                      {user.avatar ? (
                        <S3Image
                          src={user.avatar}
                          alt={user.fullName}
                          className="w-6 h-6 lg:w-8 lg:h-8 rounded-full object-cover"
                          width={32}
                          height={32}
                          fallbackText={getUserInitials(user.fullName)}
                          showFallbackIcon={true}
                        />
                      ) : (
                        <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs lg:text-sm">
                          {getUserInitials(user.fullName)}
                        </div>
                      )}
                      <span className="text-xs lg:text-sm font-medium text-foreground group-hover:text-primary transition-colors max-w-[80px] lg:max-w-[120px] truncate">
                        {user.fullName.split(' ')[0]}
                      </span>
                      <ChevronDown className={`w-3 h-3 lg:w-4 lg:h-4 text-muted-foreground transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                      <div className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-card/95 backdrop-blur-xl border border-border/30 rounded-xl shadow-xl shadow-primary/10 py-2 z-50">
                        <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-border/30">
                          <p className="text-xs sm:text-sm font-medium text-foreground truncate">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          <p className="text-xs text-primary font-medium capitalize mt-1">{user.role}</p>
                        </div>
                        
                        {(user.role === 'seller' ? sellerMenuItems : adminMenuItems).map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all duration-200"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <item.icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        ))}
                        
                        <div className="border-t border-border/30 mt-2 pt-2">
                          <button
                            onClick={() => {
                              setIsProfileOpen(false)
                              handleLogout()
                            }}
                            className="flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 w-full"
                          >
                            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              ) : (
                // Login/Signup buttons for unauthenticated users
                <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
                  {authLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-3 lg:px-4 py-2 text-foreground/80 hover:text-primary transition-all duration-300 font-medium rounded-lg lg:rounded-xl hover:bg-primary/5 relative group text-xs lg:text-sm"
                    >
                      <span className="relative z-10">{link.label}</span>
                      <span className="absolute inset-0 rounded-lg lg:rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-300"></span>
                    </Link>
                  ))}
                </div>
              )}



              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl hover:bg-secondary/50 transition-all duration-300 group border border-border/20 hover:border-primary/30 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Toggle menu"
                title={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl sm:rounded-2xl"></span>
                <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                  {isMenuOpen ? (
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-foreground group-hover:text-primary transition-colors duration-300" />
                  ) : (
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-foreground group-hover:text-primary transition-colors duration-300" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Full-Page Mobile Navigation Overlay */}
        <div 
          className={`
            md:hidden fixed inset-0 z-50 transition-all duration-500 ease-out
            ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
          `}
        >
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-black/100 backdrop-blur-md transition-opacity duration-500 ${
              isMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Content */}
          <div 
            className={`
              absolute inset-0 bg-background backdrop-blur-xl transition-all duration-500 ease-out
              ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/30 bg-secondary/80">
              <div className="flex items-center space-x-2">
                <Gem className="h-6 w-6 text-primary" />
                <span className="font-serif text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Ishq Gems
                </span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-secondary/50 transition-all duration-300 group"
                aria-label="Close menu"
              >
                <X className="h-6 w-6 text-foreground group-hover:text-primary transition-colors duration-300" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex flex-col h-[calc(100vh-80px)] overflow-y-auto">
              {/* User Info Section */}
              {isAuthenticated && user && (
                <div className="p-6 border-b border-border/30 bg-secondary/80">
                  <div className="flex items-center space-x-3">
                    {user.avatar ? (
                      <S3Image
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                        width={48}
                        height={48}
                        fallbackText={getUserInitials(user.fullName)}
                        showFallbackIcon={true}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-lg">
                        {getUserInitials(user.fullName)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-semibold text-foreground truncate">
                        {user.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                      {(user.role === 'seller' || user.role === 'admin') && (
                        <span className="inline-block mt-1 px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full capitalize">
                          {user.role}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Main Navigation */}
              <div className="flex-1 p-6 bg-background">
                <nav className="space-y-2">
                  {/* Navigation Links */}
                  <div className="space-y-1">
              {navLinks.map((link, index) => {
                // Hide "Sell with Us" link for sellers and admins (they already have selling capabilities)
                if (link.href === '/sell' && isAuthenticated && (user?.role === 'seller' || user?.role === 'admin')) {
                  return null
                }
                
                const isActive = isLinkActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                          className={`
                            flex items-center justify-between py-4 px-4 rounded-2xl font-medium text-lg transition-all duration-300 group relative overflow-hidden
                            ${isActive 
                              ? 'text-primary bg-primary/10 shadow-sm' 
                              : 'text-foreground hover:text-primary hover:bg-primary/5'
                            }
                          `}
                    onClick={() => setIsMenuOpen(false)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="relative z-10">{link.label}</span>
                          <span className={`
                            absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 transition-all duration-500 
                            ${isActive ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'}
                          `}></span>
                          <span className="text-primary/30 group-hover:text-primary/60 transition-colors duration-300">
                            →
                          </span>
                  </Link>
                )
              })}
                  </div>
              
                  {/* Auth Section */}
                  <div className="pt-6 mt-6 border-t border-border/30">
                {isAuthenticated && user ? (
                  user.role === 'buyer' ? (
                        // Buyer menu items
                        <div className="space-y-1">
                          <h3 className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            My Account
                          </h3>
                      {buyerMenuItems.map((item, index) => (
                        <Link
                          key={item.href}
                          href={item.href}
                              className="flex items-center space-x-4 py-4 px-4 text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 font-medium rounded-2xl group relative overflow-hidden text-base"
                          onClick={() => setIsMenuOpen(false)}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                              <item.icon className="w-5 h-5 flex-shrink-0" />
                              <span className="flex-1 relative z-10">{item.label}</span>
                              <span className="absolute inset-0 bg-primary/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
                              <span className="text-primary/30 group-hover:text-primary/60 transition-colors duration-300">
                                →
                              </span>
                        </Link>
                      ))}
                        </div>
                      ) : (
                        // Seller/Admin menu items (same structure as buyer)
                        <div className="space-y-1">
                          <h3 className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            My Account
                          </h3>
                      {(user.role === 'seller' ? sellerMenuItems : adminMenuItems).map((item, index) => (
                        <Link
                          key={item.href}
                          href={item.href}
                              className="flex items-center space-x-4 py-4 px-4 text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 font-medium rounded-2xl group relative overflow-hidden text-base"
                          onClick={() => setIsMenuOpen(false)}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                              <item.icon className="w-5 h-5 flex-shrink-0" />
                              <span className="flex-1 relative z-10">{item.label}</span>
                              <span className="absolute inset-0 bg-primary/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
                              <span className="text-primary/30 group-hover:text-primary/60 transition-colors duration-300">
                                →
                              </span>
                        </Link>
                      ))}
                        </div>
                  )
                ) : (
                  // Login/Signup for unauthenticated users
                      <div className="space-y-1">
                        <h3 className="px-4 py-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                          Account
                        </h3>
                        {authLinks.map((link, index) => (
                    <Link
                      key={link.href}
                      href={link.href}
                            className="flex items-center justify-between py-4 px-4 text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 font-medium rounded-2xl group relative overflow-hidden text-lg"
                      onClick={() => setIsMenuOpen(false)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="relative z-10">{link.label}</span>
                            <span className="absolute inset-0 bg-primary/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
                            <span className="text-primary/30 group-hover:text-primary/60 transition-colors duration-300">
                              →
                            </span>
                    </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </nav>
              </div>

              {/* Bottom Section */}
              <div className="p-6 border-t border-border/30 bg-secondary/80">
                {/* Notifications & Messages for authenticated users */}
                {isAuthenticated && (
                  <div className="flex items-center justify-center space-x-6 mb-4">
                    <div className="flex flex-col items-center">
                      <NotificationSystem />
                      <span className="text-xs text-muted-foreground mt-1">Notifications</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <MessagesIcon />
                      <span className="text-xs text-muted-foreground mt-1">Messages</span>
                    </div>
                  </div>
                )}

                {/* Logout Button for authenticated users */}
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleLogout()
                    }}
                    className="w-full flex items-center justify-center space-x-3 py-4 px-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300 font-semibold rounded-2xl group relative overflow-hidden text-base border border-red-200 dark:border-red-800"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span className="relative z-10">Sign Out</span>
                    <span className="absolute inset-0 bg-red-50 dark:bg-red-950/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></span>
                  </button>
                )}

                {/* Theme Toggle */}
                <div className="mt-4 pt-4 border-t border-border/30">
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center space-x-3 py-4 px-4 hover:bg-secondary/50 transition-all duration-300 font-medium rounded-2xl group relative overflow-hidden text-base border border-border/30"
                    aria-label="Toggle theme"
                    title={mounted ? `Switch to ${effectiveTheme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl"></span>
                    {!mounted ? (
                      <div className="w-5 h-5 relative z-10" />
                    ) : (
                      <>
                        <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                          {effectiveTheme === 'dark' ? (
                            <Sun className="w-5 h-5 text-foreground group-hover:text-primary transition-colors duration-300" />
                          ) : (
                            <Moon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors duration-300" />
                          )}
                        </div>
                        <span className="relative z-10">
                          {effectiveTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curved Bottom Edge */}
      <div 
        className={`
          absolute bottom-0 left-0 right-0 h-3 sm:h-4 transition-all duration-300 ease-out
          ${isScrolled 
            ? 'opacity-30 bg-gradient-to-b from-transparent to-background/10' 
            : 'opacity-60 bg-gradient-to-b from-transparent to-background/20'
          }
        `}
      >
        <svg 
          className="w-full h-full" 
          viewBox="0 0 1200 24" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,0 C300,24 900,24 1200,0 L1200,24 L0,24 Z" 
            className={`
              transition-all duration-300 ease-out
              ${isScrolled 
                ? 'fill-current text-background/10' 
                : 'fill-current text-background/20'
              }
            `}
          />
        </svg>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to login again to access your account."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="warning"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </header>
  )
} 