export interface OrderItem {
  product: { _id: string; name: string; price: number; category?: string } | null
  quantity: number
  price: number
}

export interface Order {
  _id: string
  items: OrderItem[]
  total: number
  createdAt: string
}

export type DailyPoint = { date: string; total: number }
export type WeeklyPoint = { weekLabel: string; total: number }
export type MonthlyPoint = { monthLabel: string; total: number }

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function formatDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeekStart(date: Date) {
  const d = new Date(date)
  const day = d.getDay() // 0 = Sun
  d.setDate(d.getDate() - day)
  return startOfDay(d)
}

export function filterOrdersByCategory(orders: Order[], categories: string[] | undefined) {
  if (!categories || categories.length === 0) return orders
  const set = new Set(categories.map((c) => c.toLowerCase()))
  return orders.filter((o) =>
    o.items.some((it) => (it.product?.category ? set.has(it.product.category.toLowerCase()) : false))
  )
}

export function getLastWeekDailySales(orders: Order[]): DailyPoint[] {
  const today = startOfDay(new Date())
  const start = new Date(today)
  start.setDate(today.getDate() - 7)
  const days: DailyPoint[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    const label = formatDate(day)
    const total = orders
      .filter((o) => {
        const d = startOfDay(new Date(o.createdAt))
        return d.getTime() === day.getTime()
      })
      .reduce((sum, o) => sum + (o.total || 0), 0)
    days.push({ date: label, total })
  }
  return days
}

export function getPreviousWeekDailySales(orders: Order[]): DailyPoint[] {
  const today = startOfDay(new Date())
  const start = new Date(today)
  start.setDate(today.getDate() - 14)
  const days: DailyPoint[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    const label = formatDate(day)
    const total = orders
      .filter((o) => {
        const d = startOfDay(new Date(o.createdAt))
        return d.getTime() === day.getTime()
      })
      .reduce((sum, o) => sum + (o.total || 0), 0)
    days.push({ date: label, total })
  }
  return days
}

export function getLastMonthWeeklySales(orders: Order[]): WeeklyPoint[] {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const nextMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const filtered = orders.filter((o) => {
    const d = new Date(o.createdAt)
    return d >= lastMonth && d < nextMonth
  })

  // group by week
  const map = new Map<string, number>()
  for (const o of filtered) {
    const ws = getWeekStart(new Date(o.createdAt))
    const key = formatDate(ws)
    map.set(key, (map.get(key) || 0) + (o.total || 0))
  }

  const points: WeeklyPoint[] = Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([k, v], idx) => ({ weekLabel: `Week ${idx + 1}`, total: v }))
  return points
}

export function getMonthOverMonthComparison(orders: Order[]) {
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const twoMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 2, 1)

  const lastMonthTotal = orders
    .filter((o) => {
      const d = new Date(o.createdAt)
      return d >= lastMonthStart && d < thisMonthStart
    })
    .reduce((sum, o) => sum + (o.total || 0), 0)

  const prevMonthTotal = orders
    .filter((o) => {
      const d = new Date(o.createdAt)
      return d >= twoMonthsAgoStart && d < lastMonthStart
    })
    .reduce((sum, o) => sum + (o.total || 0), 0)

  const delta = lastMonthTotal - prevMonthTotal
  const pct = prevMonthTotal ? (delta / prevMonthTotal) * 100 : 100
  return { lastMonthTotal, prevMonthTotal, delta, pct }
}

export function getMonthlySales(orders: Order[], monthsBack = 12): MonthlyPoint[] {
  const now = new Date()
  const points: MonthlyPoint[] = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const total = orders
      .filter((o) => {
        const d = new Date(o.createdAt)
        return d >= start && d < end
      })
      .reduce((sum, o) => sum + (o.total || 0), 0)
    const monthLabel = `${start.toLocaleString('default', { month: 'short' })} ${start.getFullYear()}`
    points.push({ monthLabel, total })
  }
  return points
}

