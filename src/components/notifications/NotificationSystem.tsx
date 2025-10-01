'use client'

import { useState, useEffect } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { NotificationSystemProps } from '@/types'
import NotificationBell from './NotificationBell'
import NotificationDropdown from './NotificationDropdown'
import NotificationModal from './NotificationModal'

export default function NotificationSystem({ className }: NotificationSystemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  // Close notifications when switching between mobile/desktop
  useEffect(() => {
    setIsOpen(false)
  }, [isMobile])

  return (
    <div className={`relative ${className}`}>
      {/* Bell Icon */}
      <NotificationBell 
        onClick={handleToggle}
        className="relative"
      />

      {/* Desktop: Dropdown */}
      {!isMobile && (
        <NotificationDropdown 
          isOpen={isOpen}
          onClose={handleClose}
        />
      )}

      {/* Mobile: Full-screen Modal */}
      {isMobile && (
        <NotificationModal 
          isOpen={isOpen}
          onClose={handleClose}
        />
      )}
    </div>
  )
} 