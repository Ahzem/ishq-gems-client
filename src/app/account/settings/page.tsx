'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Key, Mail, Bell, Trash2 } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Spinner from '@/components/loading/Spinner'

export default function AccountSettingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Auth protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin?message=Please login to access account settings&redirect=/account/settings')
      return
    }
  }, [user, authLoading, router])

  // Loading state
  if (authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-background pt-16 sm:pt-20 px-4">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-muted-foreground mt-4 text-sm sm:text-base">Loading account settings...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-background pt-16 sm:pt-20 px-4">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-muted-foreground mt-4 text-sm sm:text-base">Redirecting...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 pt-16 sm:pt-20 pb-4 sm:pb-8 px-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-6 sm:mb-8 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Account Settings
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-4 sm:px-0">
              Manage your security, notifications, and account preferences
            </p>
          </div>

          {/* Settings Sections */}
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
            
            {/* Security Settings */}
            <div className="bg-card border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Key className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground text-sm sm:text-base">Security</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Password and authentication settings</p>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-background/50 rounded-lg border border-border/30 hover:border-red-500/30 transition-colors gap-2 sm:gap-0">
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm sm:text-base">Change Password</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Update your account password</p>
                  </div>
                  <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors self-start sm:self-auto">
                    Change
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-background/50 rounded-lg border border-border/30 hover:border-blue-500/30 transition-colors gap-2 sm:gap-0">
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm sm:text-base">Two-Factor Authentication</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg transition-colors self-start sm:self-auto">
                    Enable
                  </button>
                </div>
              </div>
            </div>

            {/* Email Settings */}
            <div className="bg-card border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground text-sm sm:text-base">Email Preferences</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Manage your email settings</p>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-background/50 rounded-lg border border-border/30 gap-2 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm sm:text-base">Email Address</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {user.isEmailVerified && (
                      <span className="px-2 py-1 text-xs bg-green-500/10 text-green-600 border border-green-500/20 rounded-full">
                        Verified
                      </span>
                    )}
                    <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      Change
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-card border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground text-sm sm:text-base">Notifications</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Control what notifications you receive</p>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/30">
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm sm:text-base">Email Notifications</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" aria-label="Enable email notifications" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/30">
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm sm:text-base">Push Notifications</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Receive push notifications in browser</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" aria-label="Enable push notifications" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Account Management */}
            <div className="bg-card border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-red-500/30 transition-colors">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground text-sm sm:text-base">Account Management</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Manage your account and data</p>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-background/50 rounded-lg border border-border/30 hover:border-red-500/30 transition-colors gap-2 sm:gap-0">
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm sm:text-base">Export Data</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Download a copy of your account data</p>
                  </div>
                  <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors self-start sm:self-auto">
                    Export
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-500/20 gap-2 sm:gap-0">
                  <div className="flex-1">
                    <p className="font-medium text-red-600 text-sm sm:text-base">Delete Account</p>
                    <p className="text-xs sm:text-sm text-red-500">Permanently delete your account and all data</p>
                  </div>
                  <button className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40 border border-red-500/20 rounded-lg transition-colors self-start sm:self-auto">
                    Delete
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  )
} 