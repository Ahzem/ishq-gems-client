'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Button variants mapping to your design system
const buttonVariants = {
  // Base styles
  base: "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
  
  // Size variants
  size: {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl", 
    lg: "px-8 py-4 text-lg rounded-xl",
    xl: "px-10 py-5 text-xl rounded-2xl",
  },
  
  // Variant styles matching your design patterns
  variant: {
    // Primary gradient button (most common in your app)
    primary: "bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-accent hover:to-primary hover:shadow-xl hover:shadow-primary/30 focus:ring-primary/50 transform hover:scale-[1.02] active:scale-[0.98]",
    
    // Reverse gradient
    primaryReverse: "bg-gradient-to-r from-accent to-primary text-primary-foreground hover:from-primary hover:to-accent hover:shadow-xl hover:shadow-accent/30 focus:ring-accent/50 transform hover:scale-[1.02] active:scale-[0.98]",
    
    // Secondary button
    secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 hover:border-primary/30 focus:ring-secondary/50",
    
    // Outline button
    outline: "border border-border text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/30 focus:ring-primary/50",
    
    // Ghost button  
    ghost: "text-foreground hover:bg-secondary/50 hover:text-primary focus:ring-primary/50",
    
    // Danger button
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/50",
    
    // Success button
    success: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500/50",
    
    // Icon button (circular)
    icon: "w-10 h-10 p-0 rounded-full",
  },
  
  // Shape variants
  shape: {
    default: "",
    rounded: "rounded-full",
    square: "rounded-none",
  }
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant
  size?: keyof typeof buttonVariants.size
  shape?: keyof typeof buttonVariants.shape
  href?: string
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      shape = 'default',
      href,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // Loading spinner component
    const LoadingSpinner = () => (
      <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
    )

    // Build button classes
    const buttonClasses = cn(
      buttonVariants.base,
      buttonVariants.size[size],
      buttonVariants.variant[variant],
      buttonVariants.shape[shape],
      // Special handling for rounded primary buttons (common pattern in your app)
      shape === 'rounded' && variant === 'primary' && "shadow-lg hover:shadow-2xl",
      className
    )

    // Content with icons and loading state
    const content = loading ? (
      <>
        <LoadingSpinner />
        {loadingText || 'Loading...'}
      </>
    ) : (
      <>
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        <span className={cn(
          // Add transform animations for icons in gradient buttons
          variant === 'primary' && rightIcon && "group-hover:translate-x-0.5 transition-transform duration-300"
        )}>
          {children}
        </span>
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </>
    )

    // If href is provided, render as Link
    if (href) {
      return (
        <Link 
          href={href}
          className={cn(buttonClasses, "group")}
        >
          {content}
        </Link>
      )
    }

    // Default button element
    return (
      <button
        className={cn(buttonClasses, "group")}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    )
  }
)

Button.displayName = 'Button'

// Export button variants for external use
export { buttonVariants }
export default Button
