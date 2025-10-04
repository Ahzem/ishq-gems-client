/**
 * Chart component types
 */

/**
 * Pie chart label render props
 * Based on Recharts PieLabelRenderProps with additional properties
 */
export interface PieChartLabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  startAngle: number
  endAngle: number
  fill: string
  payload: {
    name: string
    value: number
    [key: string]: unknown
  }
  percent: number
  value: number
  name: string
  index: number
}

/**
 * Category chart data item
 */
export interface CategoryChartData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

/**
 * Sales chart data item
 */
export interface SalesChartData {
  month: string
  sales: number
  revenue: number
}

/**
 * Views chart data item
 */
export interface ViewsChartData {
  gem: string
  views: number
}

/**
 * Price range chart data item
 */
export interface PriceRangeChartData {
  range: string
  count: number
  avgPrice: number
}

export interface PriceRangeChartProps {
    data: PriceRangeChartData[]
    className?: string
  }