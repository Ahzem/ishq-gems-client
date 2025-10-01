'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Package, 
  Plus, 
  ShoppingBag, 
  User, 
  Settings,
  Users,
  Shield,
  AlertTriangle,
  Gem,
  X,
  Menu,
  BarChart3,
  ChevronDown,
  LucideIcon,
  CheckCircle,
  Star
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface MenuItem {
  label: string
  href: string
  icon: LucideIcon
  roles: ('seller' | 'admin')[]
}

interface MenuGroup {
  title: string
  icon: LucideIcon
  items: MenuItem[]
  roles: ('seller' | 'admin')[]
  defaultOpen?: boolean
}

// Standalone seller items
const sellerMenuItems: MenuItem[] = [
  { label: 'Seller Dashboard', href: '/seller', icon: Home, roles: ['seller'] },
]

// Grouped seller navigation
const sellerMenuGroups: MenuGroup[] = [
  {
    title: 'My Business',
    icon: Gem,
    roles: ['seller'],
    defaultOpen: true,
    items: [
      { label: 'Add New Gem', href: '/dashboard/add-gem', icon: Plus, roles: ['seller'] },
      { label: 'My Listings', href: '/dashboard/listings', icon: Package, roles: ['seller'] },
      { label: 'Auction Bids', href: '/seller/bids', icon: BarChart3, roles: ['seller'] },
    ]
  },
  {
    title: 'Sales & Orders',
    icon: ShoppingBag,
    roles: ['seller'],
    defaultOpen: false,
    items: [
      { label: 'My Orders', href: '/dashboard/seller-orders', icon: ShoppingBag, roles: ['seller'] },
      { label: 'Customer Reviews', href: '/seller/reviews', icon: Star, roles: ['seller'] },
    ]
  },
  {
    title: 'Account',
    icon: User,
    roles: ['seller'],
    defaultOpen: false,
    items: [
      { label: 'My Profile', href: '/dashboard/profile', icon: User, roles: ['seller'] },
      { label: 'Seller Settings', href: '/seller/settings', icon: Settings, roles: ['seller'] }
    ]
  },
]

// Standalone admin items
const adminMenuItems: MenuItem[] = [
  { label: 'Admin Dashboard', href: '/admin', icon: Home, roles: ['admin'] },
]

// Grouped admin navigation
const adminMenuGroups: MenuGroup[] = [
  {
    title: 'Platform',
    icon: Shield,
    roles: ['admin'],
    defaultOpen: true,
    items: [
      { label: 'Approve Listings', href: '/admin/approve-listings', icon: CheckCircle, roles: ['admin'] },
      { label: 'All Orders', href: '/admin/orders', icon: Package, roles: ['admin'] },
      { label: 'Bid Management', href: '/admin/bids', icon: BarChart3, roles: ['admin'] },
      { label: 'Flagged Reviews', href: '/admin/flagged-reviews', icon: AlertTriangle, roles: ['admin'] },
      { label: 'Reports', href: '/admin/reports', icon: BarChart3, roles: ['admin'] },
    ]
  },
  {
    title: 'Users',
    icon: Users,
    roles: ['admin'],
    defaultOpen: false,
    items: [
      { label: 'Manage Sellers', href: '/admin/seller', icon: Users, roles: ['admin'] },
      { label: 'Manage Buyers', href: '/admin/buyers', icon: Users, roles: ['admin'] },
      { label: 'Verifications', href: '/admin/verifications', icon: Shield, roles: ['admin'] },
    ]
  },
  {
    title: 'My Business',
    icon: Gem,
    roles: ['admin'],
    defaultOpen: false,
    items: [
      { label: 'Add New Gem', href: '/dashboard/add-gem', icon: Plus, roles: ['admin'] },
      { label: 'My Listings', href: '/dashboard/listings', icon: Package, roles: ['admin'] },
      { label: 'My Orders', href: '/dashboard/seller-orders', icon: ShoppingBag, roles: ['admin'] },
    ]
  },
  {
    title: 'Settings',
    icon: Settings,
    roles: ['admin'],
    defaultOpen: false,
    items: [
      { label: 'Platform Settings', href: '/admin/settings', icon: Settings, roles: ['admin'] },
      { label: 'My Profile', href: '/dashboard/profile', icon: User, roles: ['admin'] },
    ]
  },
]

// Homepage access for both sellers and admin
const homepageItem: MenuItem = { 
  label: 'Go to Homepage', 
  href: '/', 
  icon: Home, 
  roles: ['seller', 'admin'] 
}

export default function DashboardSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const { user } = useAuth()
  const pathname = usePathname()

  // Initialize open groups based on user role and defaultOpen
  useEffect(() => {
    if (user?.role === 'admin') {
      const initialOpenState: Record<string, boolean> = {}
      adminMenuGroups.forEach(group => {
        initialOpenState[group.title] = group.defaultOpen ?? false
      })
      setOpenGroups(initialOpenState)
    } else if (user?.role === 'seller') {
      const initialOpenState: Record<string, boolean> = {}
      sellerMenuGroups.forEach(group => {
        initialOpenState[group.title] = group.defaultOpen ?? false
      })
      setOpenGroups(initialOpenState)
    }
  }, [user?.role])

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  if (!user) return null

  const isActiveLink = (href: string) => {
    if (href === '/seller' || href === '/admin' || href === '/') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle]
    }))
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="flex items-center space-x-3 p-6 border-b border-border/30">
        <div className="relative">
          <Gem className="h-8 w-8 text-primary" />
          <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full"></div>
        </div>
        <div>
          <h1 className="font-serif text-xl font-bold text-foreground">Ishq Gems</h1>
          <p className="text-xs text-muted-foreground capitalize">
            {user.role} Dashboard
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {user.role === 'admin' ? (
          <>
            {/* Standalone admin items */}
            {adminMenuItems.map((item) => {
              const isActive = isActiveLink(item.href)
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-accent/10 text-accent border border-accent/20 shadow-sm' 
                      : 'text-foreground/70 hover:text-accent hover:bg-accent/5 border border-transparent'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 transition-all duration-200 ${isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-accent'}`} />
                  <span className="font-medium">{item.label}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-3 w-2 h-2 bg-accent rounded-full"></div>
                  )}
                </Link>
              )
            })}
            
            {/* Grouped admin items */}
            {adminMenuGroups.map((group) => {
            const isOpen = openGroups[group.title] ?? false
            const Icon = group.icon
            return (
              <div key={group.title} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group hover:bg-accent/5 border border-transparent hover:border-accent/20"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-accent" />
                    <span className="font-medium text-foreground/70 group-hover:text-accent">{group.title}</span>
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                {isOpen && (
                  <div className="ml-4 space-y-1">
                    {group.items.map((item) => {
                      const isActive = isActiveLink(item.href)
                      const Icon = item.icon
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`
                            flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 group relative
                            ${isActive 
                              ? 'bg-accent/10 text-accent border border-accent/20 shadow-sm' 
                              : 'text-foreground/60 hover:text-accent hover:bg-accent/5 border border-transparent'
                            }
                          `}
                        >
                          <Icon className={`h-4 w-4 transition-all duration-200 ${isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-accent'}`} />
                          <span className="text-sm font-medium">{item.label}</span>
                          
                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute right-3 w-1.5 h-1.5 bg-accent rounded-full"></div>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
          </>
        ) : (
          <>
            {/* Standalone seller items */}
            {sellerMenuItems.map((item) => {
              const isActive = isActiveLink(item.href)
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
                      : 'text-foreground/70 hover:text-primary hover:bg-primary/5 border border-transparent'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 transition-all duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                  <span className="font-medium">{item.label}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-3 w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </Link>
              )
            })}
            
            {/* Grouped seller items */}
            {sellerMenuGroups.map((group) => {
              const isOpen = openGroups[group.title] ?? false
              const Icon = group.icon
              return (
                <div key={group.title} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group hover:bg-primary/5 border border-transparent hover:border-primary/20"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                      <span className="font-medium text-foreground/70 group-hover:text-primary">{group.title}</span>
                    </div>
                    <ChevronDown 
                      className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  {isOpen && (
                    <div className="ml-4 space-y-1">
                      {group.items.map((item) => {
                        const isActive = isActiveLink(item.href)
                        const Icon = item.icon
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`
                              flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 group relative
                              ${isActive 
                                ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
                                : 'text-foreground/60 hover:text-primary hover:bg-primary/5 border border-transparent'
                              }
                            `}
                          >
                            <Icon className={`h-4 w-4 transition-all duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                            <span className="text-sm font-medium">{item.label}</span>
                            
                            {/* Active indicator */}
                            {isActive && (
                              <div className="absolute right-3 w-1.5 h-1.5 bg-primary rounded-full"></div>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </nav>

      {/* Homepage Button - Fixed at bottom */}
      <div className="p-4 border-t border-border/30">
        {(() => {
          const isActive = isActiveLink(homepageItem.href)
          const Icon = homepageItem.icon
          
          return (
            <Link
              href={homepageItem.href}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                ${isActive 
                  ? user?.role === 'admin' 
                    ? 'bg-accent/10 text-accent border border-accent/20 shadow-sm'
                    : 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                  : user?.role === 'admin'
                    ? 'text-foreground/70 hover:text-accent hover:bg-accent/5 border border-transparent'
                    : 'text-foreground/70 hover:text-primary hover:bg-primary/5 border border-transparent'
                }
              `}
            >
              <Icon className={`h-5 w-5 transition-all duration-200 ${
                isActive 
                  ? user?.role === 'admin' ? 'text-accent' : 'text-primary'
                  : user?.role === 'admin' 
                    ? 'text-muted-foreground group-hover:text-accent'
                    : 'text-muted-foreground group-hover:text-primary'
              }`} />
              <span className="font-medium">{homepageItem.label}</span>
              
              {/* Active indicator */}
              {isActive && (
                <div className={`absolute right-3 w-2 h-2 rounded-full ${
                  user?.role === 'admin' ? 'bg-accent' : 'bg-primary'
                }`}></div>
              )}
            </Link>
          )
        })()}
      </div>

    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        title="Menu"
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border/30 rounded-xl shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r border-border/30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          
          {/* Sidebar */}
          <aside className="w-64 bg-card border-r border-border/30 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                title="Close"
                onClick={() => setIsMobileOpen(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}