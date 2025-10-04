'use client'

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { SalesChartData } from '@/types/components/chart.types'
import { SalesChartSkeleton } from '@/components/loading'

interface SalesChartProps {
  data: SalesChartData[]
  className?: string
  loading?: boolean
}

export default function SalesChart({ data, className = '', loading = false }: SalesChartProps) {
  if (loading) {
    return <SalesChartSkeleton className={className} />
  }

  return (
    <div className={`bg-card border border-border/30 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Sales Performance</h3>
          <p className="text-sm text-muted-foreground">Monthly sales and revenue trends</p>
        </div>
        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
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
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#salesGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#revenueGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-muted-foreground">Sales Count</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-muted-foreground">Revenue ($)</span>
        </div>
      </div>
    </div>
  )
}
