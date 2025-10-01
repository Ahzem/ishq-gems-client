'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Info, AlertCircle } from 'lucide-react'
import { SettingsFieldConfig } from '@/types/entities/settings'
import { cn } from '@/lib/utils'

type SettingsFieldValue = string | number | boolean | string[] | File | null | undefined

interface SettingsFieldProps {
  config: SettingsFieldConfig
  value: SettingsFieldValue
  onChange: (value: SettingsFieldValue) => void
  error?: string
  disabled?: boolean
  className?: string
}

export default function SettingsField({
  config,
  value,
  onChange,
  error,
  disabled = false,
  className
}: SettingsFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const {
    key,
    label,
    type,
    required = false,
    placeholder,
    description,
    options = [],
    validation
  } = config

  const baseInputClasses = cn(
    'w-full px-3 py-2 border rounded-lg bg-background transition-colors duration-200',
    'focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none',
    error 
      ? 'border-destructive focus:ring-destructive/20 focus:border-destructive' 
      : 'border-border hover:border-border/80',
    disabled && 'opacity-50 cursor-not-allowed bg-muted',
    className
  )

  const renderField = () => {
    switch (type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <input
            id={key}
            type={type}
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={baseInputClasses}
            {...(validation?.min && { minLength: validation.min })}
            {...(validation?.max && { maxLength: validation.max })}
            {...(validation?.pattern && { pattern: validation.pattern })}
          />
        )

      case 'number':
        return (
          <input
            id={key}
            type="number"
            value={typeof value === 'number' ? value : ''}
            onChange={(e) => onChange(Number(e.target.value))}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={baseInputClasses}
            {...(validation?.min !== undefined && { min: validation.min })}
            {...(validation?.max !== undefined && { max: validation.max })}
          />
        )

      case 'password':
        return (
          <div className="relative">
            <input
              id={key}
              type={showPassword ? 'text' : 'password'}
              value={String(value || '')}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              className={cn(baseInputClasses, 'pr-10')}
              {...(validation?.min && { minLength: validation.min })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={disabled}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        )

      case 'textarea':
        return (
          <textarea
            id={key}
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={4}
            className={baseInputClasses}
            {...(validation?.min && { minLength: validation.min })}
            {...(validation?.max && { maxLength: validation.max })}
          />
        )

      case 'select':
        return (
          <select
            id={key}
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            required={required}
            className={baseInputClasses}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(String(option.value))}
                  onChange={(e) => {
                    const currentValue = Array.isArray(value) ? value : []
                    if (e.target.checked) {
                      onChange([...currentValue, String(option.value)])
                    } else {
                      onChange(currentValue.filter((v) => v !== String(option.value)))
                    }
                  }}
                  disabled={disabled}
                  className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
                />
                <span className="text-sm text-foreground">{option.label}</span>
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <label className="flex items-center space-x-3">
            <input
              id={key}
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
            />
            <span className="text-sm text-foreground">{label}</span>
          </label>
        )

      case 'toggle':
        return (
          <button
            type="button"
            onClick={() => onChange(!value)}
            disabled={disabled}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20',
              value ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
                value ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={key}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled}
                  className="w-4 h-4 text-primary focus:ring-primary border-border"
                />
                <span className="text-sm text-foreground">{option.label}</span>
              </label>
            ))}
          </div>
        )

      case 'color':
        return (
          <div className="flex items-center space-x-3">
            <input
              id={key}
              type="color"
              value={String(value || '#000000')}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="w-12 h-10 border border-border rounded cursor-pointer disabled:cursor-not-allowed"
            />
            <input
              type="text"
              value={String(value || '')}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              disabled={disabled}
              className={cn(baseInputClasses, 'flex-1')}
            />
          </div>
        )

      case 'file':
        return (
          <input
            id={key}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                onChange(file)
              }
            }}
            disabled={disabled}
            className={cn(
              'w-full px-3 py-2 border border-border rounded-lg bg-background',
              'file:mr-3 file:py-1 file:px-3 file:rounded file:border-0',
              'file:text-sm file:bg-primary file:text-primary-foreground',
              'hover:file:bg-primary/90 cursor-pointer',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
        )

      default:
        return null
    }
  }

  // Don't render label for checkbox and toggle types as they handle their own labels
  const showLabel = type !== 'checkbox' && type !== 'toggle'

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex items-center space-x-2">
          <label
            htmlFor={key}
            className={cn(
              'block text-sm font-medium transition-colors duration-200',
              error ? 'text-destructive' : 'text-foreground',
              isFocused && 'text-primary'
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
          {description && (
            <div className="group relative">
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-6 w-64 p-2 bg-popover border border-border rounded-lg shadow-lg text-xs text-popover-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
                {description}
              </div>
            </div>
          )}
        </div>
      )}

      {renderField()}

      {error && (
        <div className="flex items-center space-x-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {description && (type === 'checkbox' || type === 'toggle') && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
