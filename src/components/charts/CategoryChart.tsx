'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Gem } from 'lucide-react'
import { CategoryChartData } from '@/types/components/chart.types'

interface CategoryChartProps {
  data: CategoryChartData[]
  className?: string
}

interface PieChartLabel {
  name?: string
  percent?: number
  value?: number
}


export default function CategoryChart({ data, className = '' }: CategoryChartProps) {
  return (
    <div className={`bg-card border border-border/30 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Gem Categories</h3>
          <p className="text-sm text-muted-foreground">Distribution by type</p>
        </div>
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Gem className="w-5 h-5 text-primary" />
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: PieChartLabel) => `${props.name || ''} ${((props.percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
