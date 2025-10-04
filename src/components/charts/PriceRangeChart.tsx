'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DollarSign } from 'lucide-react'
import { PriceRangeChartData } from '@/types/components/chart.types'
import { PriceRangeChartSkeleton } from '@/components/loading'

interface PriceRangeChartProps {
  data: PriceRangeChartData[]
  className?: string
  loading?: boolean
}

export default function PriceRangeChart({ data, className = '', loading = false }: PriceRangeChartProps) {
  if (loading) {
    return <PriceRangeChartSkeleton className={className} />
  }

  return (
    <div className={`bg-card border border-border/30 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Price Distribution</h3>
          <p className="text-sm text-muted-foreground">Gems by price range</p>
        </div>
        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-emerald-500" />
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="range" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
              formatter={(value, name) => [
                name === 'count' ? `${value} gems` : `$${value}`,
                name === 'count' ? 'Count' : 'Avg Price'
              ]}
            />
            <Bar 
              dataKey="count" 
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
