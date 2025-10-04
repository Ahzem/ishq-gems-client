'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Eye } from 'lucide-react'
import { ViewsChartData } from '@/types/components/chart.types'
import { ViewsChartSkeleton } from '@/components/loading'

interface ViewsChartProps {
  data: ViewsChartData[]
  className?: string
  loading?: boolean
}

export default function ViewsChart({ data, className = '', loading = false }: ViewsChartProps) {
  if (loading) {
    return <ViewsChartSkeleton className={className} />
  }

  return (
    <div className={`bg-card border border-border/30 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top Performing Gems</h3>
          <p className="text-sm text-muted-foreground">Views by gemstone</p>
        </div>
        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
          <Eye className="w-5 h-5 text-purple-500" />
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="gem" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
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
            />
            <Bar 
              dataKey="views" 
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
