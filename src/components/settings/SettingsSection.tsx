'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { SettingsFieldConfig } from '@/types/entities/settings'
import SettingsField from './SettingsField'
import { cn } from '@/lib/utils'

type SettingsFieldValue = string | number | boolean | string[] | File | null | undefined

interface SettingsSectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  fields: SettingsFieldConfig[]
  values: Record<string, SettingsFieldValue>
  errors: Record<string, string>
  onChange: (key: string, value: SettingsFieldValue) => void
  disabled?: boolean
  className?: string
}

export default function SettingsSection({
  title,
  description,
  icon: Icon,
  fields,
  values,
  errors,
  onChange,
  disabled = false,
  className
}: SettingsSectionProps) {
  // Group fields by group property
  const groupedFields = fields.reduce((acc, field) => {
    const group = field.group || 'default'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(field)
    return acc
  }, {} as Record<string, SettingsFieldConfig[]>)

  // Sort fields within each group by order
  Object.keys(groupedFields).forEach(group => {
    groupedFields[group].sort((a, b) => (a.order || 0) - (b.order || 0))
  })

  const renderFieldGroup = (groupName: string, groupFields: SettingsFieldConfig[]) => {
    return (
      <div key={groupName} className="space-y-4">
        {groupName !== 'default' && (
          <div className="border-b border-border/30 pb-2">
            <h4 className="text-sm font-medium text-foreground capitalize">
              {groupName.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupFields.map((field) => {
            // Check field dependency
            const shouldShow = !field.dependency || checkDependency(field.dependency, values)
            
            if (!shouldShow) return null

            return (
              <div
                key={field.key}
                className={cn(
                  field.type === 'textarea' && 'md:col-span-2',
                  field.type === 'multiselect' && 'md:col-span-2'
                )}
              >
                <SettingsField
                  config={field}
                  value={values[field.key]}
                  onChange={(value) => onChange(field.key, value)}
                  error={errors[field.key]}
                  disabled={disabled || field.disabled}
                />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="h-5 w-5 text-primary" />}
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-8">
        {Object.entries(groupedFields).map(([groupName, groupFields]) =>
          renderFieldGroup(groupName, groupFields)
        )}
      </div>
    </div>
  )
}

// Helper function to check field dependencies
function checkDependency(
  dependency: SettingsFieldConfig['dependency'], 
  values: Record<string, SettingsFieldValue>
): boolean {
  if (!dependency) return true

  const { field, value: expectedValue, operator } = dependency
  const actualValue = values[field]

  switch (operator) {
    case 'equals':
      return actualValue === expectedValue
    case 'not_equals':
      return actualValue !== expectedValue
    case 'greater_than':
      return Number(actualValue) > Number(expectedValue)
    case 'less_than':
      return Number(actualValue) < Number(expectedValue)
    default:
      return true
  }
}
