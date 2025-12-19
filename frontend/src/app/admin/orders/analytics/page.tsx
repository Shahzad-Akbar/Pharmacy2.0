'use client'
import { useEffect, useMemo, useState, } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Download, BarChart3, LineChart, Filter, Calendar, ArrowUpRight, ArrowDownRight, ArrowLeft } from 'lucide-react'

interface OrderItem {
  product: {
    _id: string
    name: string
    price: number
    category?: string
  } | null
  quantity: number
  price: number
  prescriptionRequired: boolean
}

interface Order {
  _id: string
  user: {
    _id: string
    email: string
  }
  items: OrderItem[]
  total: number
  status: 'pending' | 'processing' | 'in-transit' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  paymentMethod: 'COD' | 'card' | 'bank-transfer' | 'QR'
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
  }
  createdAt: string
  deliveryCharge: number
  tracking?: string
  notes?: string
}

type SortKey = 'date' | 'amount' | 'status'
type SortDir = 'asc' | 'desc'

export default function OrdersAnalyticsPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [weekSortKey, setWeekSortKey] = useState<SortKey>('date')
  const [weekSortDir, setWeekSortDir] = useState<SortDir>('desc')

  const [monthSortKey, setMonthSortKey] = useState<SortKey>('date')
  const [monthSortDir, setMonthSortDir] = useState<SortDir>('desc')
  const [monthCategory, setMonthCategory] = useState<string>('all')

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    return `${now.getFullYear()}-${m}`
  })

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        const token = localStorage.getItem('token')
        const response = await axios.get('/api/orders/admin/all', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        setOrders(response.data)
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError('Failed to fetch orders')
        toast.error('Failed to fetch orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const lastNDays = (days: number) => {
    const now = new Date()
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  }

  const weeklyOrders = useMemo(() => {
    const from = lastNDays(7)
    return orders.filter(o => new Date(o.createdAt) >= from)
  }, [orders])

  const monthlyOrders = useMemo(() => {
    const from = lastNDays(30)
    return orders.filter(o => new Date(o.createdAt) >= from)
  }, [orders])

  const allCategories = useMemo(() => {
    const set = new Set<string>()
    monthlyOrders.forEach(o => {
      o.items.forEach(i => {
        const cat = i.product?.category
        if (cat) set.add(cat)
      })
    })
    return Array.from(set).sort()
  }, [monthlyOrders])

  const sortOrders = (data: Order[], key: SortKey, dir: SortDir) => {
    const sorted = [...data].sort((a, b) => {
      switch (key) {
        case 'date':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'amount':
          return a.total - b.total
        case 'status':
          return a.status.localeCompare(b.status)
      }
    })
    return dir === 'asc' ? sorted : sorted.reverse()
  }

  const filteredMonthlyOrders = useMemo(() => {
    if (monthCategory === 'all') return monthlyOrders
    return monthlyOrders.filter(o =>
      o.items.some(i => i.product?.category === monthCategory)
    )
  }, [monthlyOrders, monthCategory])

  const weeklySorted = useMemo(
    () => sortOrders(weeklyOrders, weekSortKey, weekSortDir),
    [weeklyOrders, weekSortKey, weekSortDir]
  )

  const monthlySorted = useMemo(
    () => sortOrders(filteredMonthlyOrders, monthSortKey, monthSortDir),
    [filteredMonthlyOrders, monthSortKey, monthSortDir]
  )

  const summarize = (data: Order[]) => {
    const count = data.length
    const total = data.reduce((sum, o) => sum + (o.total || 0), 0)
    const aov = count ? total / count : 0
    return { count, aov }
  }

  const weeklySummary = useMemo(() => summarize(weeklyOrders), [weeklyOrders])
  const monthlySummary = useMemo(() => summarize(monthlyOrders), [monthlyOrders])

  const previousMonthlyOrders = useMemo(() => {
    const now = new Date()
    const fromPrev = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
    const toPrev = lastNDays(30)
    return orders.filter(o => {
      const d = new Date(o.createdAt)
      return d >= fromPrev && d < toPrev
    })
  }, [orders])

  const previousMonthlySummary = useMemo(() => summarize(previousMonthlyOrders), [previousMonthlyOrders])

  const getDelta = (current: number, previous: number) => {
    const diff = current - previous
    const pct = previous ? (diff / previous) * 100 : current ? 100 : 0
    return { diff, pct }
  }

  const monthlyDeltaCount = getDelta(monthlySummary.count, previousMonthlySummary.count)
  const monthlyDeltaAov = getDelta(monthlySummary.aov, previousMonthlySummary.aov)

  const exportCSV = (rows: Array<Record<string, any>>, filename: string) => {
    const keys = Object.keys(rows[0] || {})
    const escapeCSV = (val: any) => {
      const s = String(val ?? '')
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
      }
      return s
    }
    const header = keys.join(',')
    const body = rows.map(r => keys.map(k => escapeCSV(r[k])).join(',')).join('\n')
    const csv = `${header}\n${body}`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportSectionPDF = (sectionId: string, title: string) => {
    const node = document.getElementById(sectionId)
    if (!node) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; color: #111827; }
            h1 { font-size: 20px; margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${node.innerHTML}
        </body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  const formatOrderRow = (o: Order) => ({
    id: o._id,
    customer: o.shippingAddress?.name,
    date: new Date(o.createdAt).toLocaleDateString(),
    amount: o.total,
    status: o.status
  })

  const selectedYearMonth = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number)
    return { year: y, month: m }
  }, [selectedMonth])

  const monthlyBreakdown = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>()
    orders.forEach(o => {
      const d = new Date(o.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const curr = map.get(key) || { count: 0, total: 0 }
      map.set(key, { count: curr.count + 1, total: curr.total + (o.total || 0) })
    })
    const arr = Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
    return arr
  }, [orders])

  const selectedMonthDaily = useMemo(() => {
    const daysInMonth = (year: number, monthIndex1to12: number) =>
      new Date(year, monthIndex1to12, 0).getDate()
    const { year, month } = selectedYearMonth
    const days = daysInMonth(year, month)
    const daily = Array.from({ length: days }, (_, i) => ({ day: i + 1, count: 0, total: 0 }))
    orders.forEach(o => {
      const d = new Date(o.createdAt)
      if (d.getFullYear() === year && d.getMonth() + 1 === month) {
        const idx = d.getDate() - 1
        daily[idx].count += 1
        daily[idx].total += o.total || 0
      }
    })
    return daily
  }, [orders, selectedYearMonth])

  const yoyComparison = useMemo(() => {
    const { year, month } = selectedYearMonth
    const current = orders.filter(o => {
      const d = new Date(o.createdAt)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })
    const previous = orders.filter(o => {
      const d = new Date(o.createdAt)
      return d.getFullYear() === year - 1 && d.getMonth() + 1 === month
    })
    const currSum = summarize(current)
    const prevSum = summarize(previous)
    return {
      count: getDelta(currSum.count, prevSum.count),
      aov: getDelta(currSum.aov, prevSum.aov),
      revenue: getDelta(current.reduce((s, o) => s + (o.total || 0), 0), previous.reduce((s, o) => s + (o.total || 0), 0))
    }
  }, [orders, selectedYearMonth])

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen bg-blue-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-blue-100 min-h-screen">
        <div className="bg-white border rounded-lg p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-blue-100 min-h-screen text-black">
      <button
                onClick={() => router.push('/admin/dashboard')}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded hover:shadow"
              >
                <ArrowLeft size={18} />
                <span>Back to Dashboard</span>
              </button>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-red-800 flex items-center gap-2">
          Orders Analytics
        </h1>
        <p className="text-gray-600">Insightful breakdowns of weekly, monthly, and trend data</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <Tabs defaultValue="last-week">
          <TabsList className="mb-4">
            <TabsTrigger value="last-week">Last Week</TabsTrigger>
            <TabsTrigger value="last-month">Last Month</TabsTrigger>
            <TabsTrigger value="monthly-analysis">Monthly Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="last-week">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <div className="flex flex-wrap gap-2 mb-3 items-center">
                  <label className="text-sm text-gray-600">Sort by</label>
                  <select
                    className="border rounded px-3 py-2 text-sm"
                    value={weekSortKey}
                    onChange={(e) => setWeekSortKey(e.target.value as SortKey)}
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="status">Status</option>
                  </select>
                  <select
                    className="border rounded px-3 py-2 text-sm"
                    value={weekSortDir}
                    onChange={(e) => setWeekSortDir(e.target.value as SortDir)}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                  <button
                    onClick={() => exportCSV(weeklySorted.map(formatOrderRow), 'last-week-orders.csv')}
                    className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    title="Export CSV"
                  >
                    <Download size={16} />
                    Export CSV
                  </button>
                  <button
                    onClick={() => exportSectionPDF('week-table', 'Last Week Orders')}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                    title="Export PDF"
                  >
                    <Download size={16} />
                    Export PDF
                  </button>
                </div>

                <div id="week-table" className="overflow-x-auto border rounded">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2">Order ID</th>
                        <th className="text-left p-2">Customer</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-right p-2">Amount</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weeklySorted.map(o => (
                        <tr key={o._id} className="border-t">
                          <td className="p-2">{o._id}</td>
                          <td className="p-2">{o.shippingAddress?.name}</td>
                          <td className="p-2">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="p-2 text-right">₹{o.total}</td>
                          <td className="p-2">{o.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-50 rounded p-4">
                <h3 className="font-semibold mb-2 text-gray-800">Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Orders</span>
                    <span className="font-semibold">{weeklySummary.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Order Value</span>
                    <span className="font-semibold">₹{weeklySummary.aov.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="last-month">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <div className="flex flex-wrap gap-2 mb-3 items-center">
                  <Filter size={18} className="text-gray-600" />
                  <select
                    className="border rounded px-3 py-2 text-sm"
                    value={monthCategory}
                    onChange={(e) => setMonthCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    {allCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <label className="text-sm text-gray-600 ml-2">Sort by</label>
                  <select
                    className="border rounded px-3 py-2 text-sm"
                    value={monthSortKey}
                    onChange={(e) => setMonthSortKey(e.target.value as SortKey)}
                  >
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                    <option value="status">Status</option>
                  </select>
                  <select
                    className="border rounded px-3 py-2 text-sm"
                    value={monthSortDir}
                    onChange={(e) => setMonthSortDir(e.target.value as SortDir)}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>

                  <button
                    onClick={() => exportCSV(monthlySorted.map(formatOrderRow), 'last-month-orders.csv')}
                    className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    title="Export CSV"
                  >
                    <Download size={16} />
                    Export CSV
                  </button>
                  <button
                    onClick={() => exportSectionPDF('month-table', 'Last Month Orders')}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                    title="Export PDF"
                  >
                    <Download size={16} />
                    Export PDF
                  </button>
                </div>

                <div id="month-table" className="overflow-x-auto border rounded">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2">Order ID</th>
                        <th className="text-left p-2">Customer</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-right p-2">Amount</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlySorted.map(o => (
                        <tr key={o._id} className="border-t">
                          <td className="p-2">{o._id}</td>
                          <td className="p-2">{o.shippingAddress?.name}</td>
                          <td className="p-2">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="p-2 text-right">₹{o.total}</td>
                          <td className="p-2">{o.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded p-4">
                  <h3 className="font-semibold mb-2 text-gray-800">Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Orders</span>
                      <span className="font-semibold">{monthlySummary.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Order Value</span>
                      <span className="font-semibold">₹{monthlySummary.aov.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-4">
                  <h3 className="font-semibold mb-2 text-gray-800">Vs Previous Month</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Orders</span>
                      <span className={`inline-flex items-center gap-1 font-semibold ${monthlyDeltaCount.diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {monthlyDeltaCount.diff >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {monthlyDeltaCount.diff} ({monthlyDeltaCount.pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Avg Order Value</span>
                      <span className={`inline-flex items-center gap-1 font-semibold ${monthlyDeltaAov.diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {monthlyDeltaAov.diff >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        ₹{monthlyDeltaAov.diff.toFixed(2)} ({monthlyDeltaAov.pct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monthly-analysis">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Calendar size={18} className="text-gray-600" />
                <input
                  type="month"
                  className="border rounded px-3 py-2 text-sm"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                />
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => exportCSV(monthlyBreakdown.map(([key, v]) => ({ month: key, orders: v.count, revenue: v.total })), 'monthly-breakdown.csv')}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    title="Export CSV"
                  >
                    <Download size={16} />
                    Export CSV
                  </button>
                  <button
                    onClick={() => exportSectionPDF('analysis-graphs', 'Monthly Order Analysis')}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                    title="Export PDF"
                  >
                    <Download size={16} />
                    Export PDF
                  </button>
                </div>
              </div>

              <div id="analysis-graphs" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-800">Monthly Orders (last 12 months)</h3>
                  </div>
                  <div className="h-48 flex items-end gap-2">
                    {monthlyBreakdown.map(([key, v]) => {
                      const max = Math.max(...monthlyBreakdown.map(([, mv]) => mv.count), 1)
                      const height = (v.count / max) * 100
                      return (
                        <div key={key} className="flex-1">
                          <div className="bg-blue-500 w-full" style={{ height: `${height}%` }} />
                          <div className="text-xs mt-1 text-gray-600 text-center">{key.slice(5)}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-white border rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <LineChart size={18} className="text-green-600" />
                    <h3 className="font-semibold text-gray-800">Daily Orders ({selectedMonth})</h3>
                  </div>
                  <div className="h-48 relative">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                      {(() => {
                        const max = Math.max(...selectedMonthDaily.map(d => d.count), 1)
                        const pts = selectedMonthDaily.map((d, i) => {
                          const x = (i / Math.max(selectedMonthDaily.length - 1, 1)) * 100
                          const y = 100 - (d.count / max) * 100
                          return `${x},${y}`
                        }).join(' ')
                        return (
                          <>
                            <polyline points={pts} fill="none" stroke="#10b981" strokeWidth="1.5" />
                          </>
                        )
                      })()}
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded p-4">
                <h3 className="font-semibold mb-2 text-gray-800">Year-over-Year Comparison</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-between p-3 bg-white border rounded">
                    <span>Orders</span>
                    <span className={`inline-flex items-center gap-1 font-semibold ${yoyComparison.count.diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {yoyComparison.count.diff >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      {yoyComparison.count.diff} ({yoyComparison.count.pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white border rounded">
                    <span>Revenue</span>
                    <span className={`inline-flex items-center gap-1 font-semibold ${yoyComparison.revenue.diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {yoyComparison.revenue.diff >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      ₹{yoyComparison.revenue.diff.toFixed(2)} ({yoyComparison.revenue.pct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white border rounded">
                    <span>Avg Order Value</span>
                    <span className={`inline-flex items-center gap-1 font-semibold ${yoyComparison.aov.diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {yoyComparison.aov.diff >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      ₹{yoyComparison.aov.diff.toFixed(2)} ({yoyComparison.aov.pct.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
