'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchableSelectProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
  allowCustomValue?: boolean
  maxHeight?: string
  searchPlaceholder?: string
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  allowCustomValue = false,
  maxHeight = "max-h-60",
  searchPlaceholder = "Search options..."
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOptions, setFilteredOptions] = useState(options)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filter options based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options)
    } else {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOptions(filtered)
    }
  }, [searchTerm, options])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredOptions.length === 1) {
      handleSelect(filteredOptions[0])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  const displayValue = value || placeholder
  const hasValue = Boolean(value)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-3 text-left border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background/95 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 cursor-pointer flex items-center justify-between",
          disabled && "opacity-50 cursor-not-allowed",
          !hasValue && "text-muted-foreground",
          className
        )}
      >
        <span className="truncate flex-1">{displayValue}</span>
        <div className="flex items-center gap-2 ml-2">
          {hasValue && !disabled && (
            <X
              className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200",
              isOpen && "transform rotate-180"
            )}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg">
          {/* Search Input - Only show for long lists */}
          {options.length > 10 && (
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary z-10" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className={cn("overflow-y-auto", maxHeight)}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors cursor-pointer border-b border-border last:border-b-0",
                    value === option && "bg-primary/10 text-primary font-medium"
                  )}
                >
                  {option}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                {allowCustomValue ? (
                  <button
                    type="button"
                    onClick={() => handleSelect(searchTerm)}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Use &quot;{searchTerm}&quot;
                  </button>
                ) : (
                  "No options found"
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
