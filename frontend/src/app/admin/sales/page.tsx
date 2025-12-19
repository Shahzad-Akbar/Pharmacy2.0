'use client'
import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import * as Tabs from '@radix-ui/react-tabs'
import { ArrowLeft, BarChart3, LineChart, Filter as FilterIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  Order,
  filterOrdersByCategory,
  getLastWeekDailySales,
  getPreviousWeekDailySales,
  getLastMonthWeeklySales,
  getMonthOverMonthComparison,
  getMonthlySales
} from '@/lib/salesMetrics'

export default function SalesAnalyticsPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  useEffect(() => {
    fetchOrdersWithCache()
  }, [])

  const fetchOrdersWithCache = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const cacheKey = 'admin_orders_cache'
      const cacheTTL = 5 * 60 * 1000 // 5 minutes
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const { ts, data } = JSON.parse(cached)
        if (Date.now() - ts < cacheTTL) {
          setOrders(data)
          setLoading(false)
          return
        }
      }

      const response = await axios.get('/api/orders/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      })
      localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: response.data }))
      setOrders(response.data)
      setError('')
    } catch (err) {
      console.error('Failed to fetch orders', err)
      setError('Failed to fetch sales data')
      toast.error('Failed to fetch sales data')
    } finally {
      setLoading(false)
    }
  }

  const categoriesFromOrders = useMemo(() => {
    const set = new Set<string>()
    for (const o of orders) {
      for (const it of o.items) {
        if (it.product?.category) set.add(it.product.category)
      }
    }
    return Array.from(set).sort()
  }, [orders])

  const filteredOrders = useMemo(() => {
    let data = filterOrdersByCategory(orders, selectedCategories)
    if (selectedMonth) {
      const [yearStr, monthStr] = selectedMonth.split('-')
      const year = Number(yearStr)
      const month = Number(monthStr) - 1
      const start = new Date(year, month, 1)
      const end = new Date(year, month + 1, 1)
      data = data.filter((o) => {
        const d = new Date(o.createdAt)
        return d >= start && d < end
      })
    }
    return data
  }, [orders, selectedCategories, selectedMonth])

  const lastWeek = useMemo(() => getLastWeekDailySales(filteredOrders), [filteredOrders])
  const prevWeek = useMemo(() => getPreviousWeekDailySales(filteredOrders), [filteredOrders])
  const lastMonthWeeks = useMemo(() => getLastMonthWeeklySales(filteredOrders), [filteredOrders])
  const mom = useMemo(() => getMonthOverMonthComparison(filteredOrders), [filteredOrders])
  const monthly = useMemo(() => getMonthlySales(filteredOrders, 12), [filteredOrders])

  const ChartBar = ({ data, labelKey, valueKey }: { data: any[]; labelKey: string; valueKey: string }) => {
    const max = Math.max(1, ...data.map((d) => d[valueKey] as number))
    return (
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-28 text-xs text-gray-600">{d[labelKey]}</span>
            <div className="h-3 bg-blue-100 rounded w-full">
              <div
                className="h-3 bg-blue-600 rounded"
                style={{ width: `${((d[valueKey] as number) / max) * 100}%` }}
              />
            </div>
            <span className="w-16 text-right text-xs text-gray-700">₹{d[valueKey]}</span>
          </div>
        ))}
      </div>
    )
  }

  const ChartLine = ({ dataA, dataB }: { dataA: { label: string; value: number }[]; dataB?: { label: string; value: number }[] }) => {
    const width = 600
    const height = 180
    const padding = 24
    const max = Math.max(1, ...dataA.map((d) => d.value), ...(dataB ? dataB.map((d) => d.value) : [0]))
    const stepX = (width - padding * 2) / Math.max(1, dataA.length - 1)
    const scaleY = (val: number) => height - padding - (val / max) * (height - padding * 2)
    const toPath = (data: { label: string; value: number }[], color: string) => {
      return data
        .map((d, i) => `${i === 0 ? 'M' : 'L'} ${padding + i * stepX} ${scaleY(d.value)}`)
        .join(' ')
    }
    const labels = dataA.map((d) => d.label)
    return (
      <svg width={width} height={height} className="bg-white rounded border">
        <path d={toPath(dataA, '#2563eb')} stroke="#2563eb" fill="none" strokeWidth={2} />
        {dataB && <path d={toPath(dataB, '#10b981')} stroke="#10b981" fill="none" strokeWidth={2} />}
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" />
        {/* Labels */}
        {labels.map((l, i) => (
          <text key={i} x={padding + i * stepX} y={height - padding + 14} fontSize={10} textAnchor="middle" fill="#6b7280">
            {l}
          </text>
        ))}
      </svg>
    )
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading sales...</div>
  }

  return (
    <div className="p-6 bg-blue-100 min-h-screen text-black">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded hover:shadow"
        >
          <ArrowLeft size={18} />
          <span>Back to Dashboard</span>
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Sales Analytics</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categoriesFromOrders.length === 0 && (
                <span className="text-xs text-gray-500">No categories found in orders</span>
              )}
              {categoriesFromOrders.map((cat) => {
                const active = selectedCategories.includes(cat)
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategories((prev) =>
                        active ? prev.filter((c) => c !== cat) : [...prev, cat]
                      )
                    }}
                    className={`text-xs px-3 py-1 rounded border ${
                      active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <button
              onClick={() => {
                setSelectedMonth('')
                setSelectedCategories([])
              }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded"
            >
              <FilterIcon size={16} /> Reset Filters
            </button>
          </div>
        </div>
      </div>

      <Tabs.Root defaultValue="week" className="bg-white rounded p-4">
        <Tabs.List className="flex gap-2 border-b mb-4">
          <Tabs.Trigger value="week" className="px-3 py-2 text-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600">Last Week</Tabs.Trigger>
          <Tabs.Trigger value="month" className="px-3 py-2 text-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600">Last Month</Tabs.Trigger>
          <Tabs.Trigger value="analysis" className="px-3 py-2 text-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600">Monthly Analysis</Tabs.Trigger>
        </Tabs.List>

        {/* Last Week Sales */}
        <Tabs.Content value="week" className="space-y-4">
          <div className="flex items-center gap-2">
            <LineChart className="text-blue-600" size={18} />
            <h2 className="text-lg font-semibold">Daily Breakdown (Last 7 Days)</h2>
          </div>
          <ChartLine
            dataA={lastWeek.map((d) => ({ label: d.date.slice(5), value: d.total }))}
            dataB={prevWeek.map((d) => ({ label: d.date.slice(5), value: d.total }))}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded border">
              <h3 className="font-medium mb-2">Last Week</h3>
              <ChartBar data={lastWeek} labelKey="date" valueKey="total" />
            </div>
            <div className="p-4 rounded border">
              <h3 className="font-medium mb-2">Previous Week</h3>
              <ChartBar data={prevWeek} labelKey="date" valueKey="total" />
            </div>
          </div>
        </Tabs.Content>

        {/* Last Month Sales */}
        <Tabs.Content value="month" className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={18} />
            <h2 className="text-lg font-semibold">Weekly Totals (Last Month)</h2>
          </div>
          <div className="p-4 rounded border">
            <ChartBar data={lastMonthWeeks} labelKey="weekLabel" valueKey="total" />
          </div>
          <div className="p-4 rounded border">
            <h3 className="font-medium mb-2">Month-over-Month</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-blue-50 rounded">
                <div className="text-gray-600">Last Month Total</div>
                <div className="font-semibold">₹{mom.lastMonthTotal}</div>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <div className="text-gray-600">Previous Month Total</div>
                <div className="font-semibold">₹{mom.prevMonthTotal}</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded">
                <div className="text-gray-600">Delta</div>
                <div className="font-semibold">₹{mom.delta}</div>
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <div className="text-gray-600">Change %</div>
                <div className="font-semibold">{mom.pct.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </Tabs.Content>

        {/* Monthly Sales Analysis */}
        <Tabs.Content value="analysis" className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={18} />
            <h2 className="text-lg font-semibold">Month-by-Month Overview</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded border">
              <ChartBar data={monthly} labelKey="monthLabel" valueKey="total" />
            </div>
            <div className="p-4 rounded border overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="py-2 pr-4">Month</th>
                    <th className="py-2">Sales (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((m) => (
                    <tr key={m.monthLabel} className="border-t">
                      <td className="py-2 pr-4">{m.monthLabel}</td>
                      <td className="py-2">{m.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      {error && (
        <div className="mt-4 text-sm text-red-600">{error}</div>
      )}
    </div>
  )
}

