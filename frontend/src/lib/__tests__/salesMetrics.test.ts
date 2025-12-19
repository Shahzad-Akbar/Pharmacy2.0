import assert from 'assert'
import {
  getLastWeekDailySales,
  getPreviousWeekDailySales,
  getLastMonthWeeklySales,
  getMonthOverMonthComparison,
  getMonthlySales,
  filterOrdersByCategory,
  Order
} from '../salesMetrics'

function makeOrder(total: number, createdAt: string, category?: string): Order {
  return {
    _id: Math.random().toString(36).slice(2),
    total,
    createdAt,
    items: [{ product: { _id: 'p', name: 'Item', price: total, category }, quantity: 1, price: total }]
  }
}

// Basic sanity tests for metrics functions
const now = new Date()
const todayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString()
const orders: Order[] = [
  makeOrder(100, todayStr, 'General'),
  makeOrder(200, yesterday, 'OTC'),
]

// Last week daily sales should have length 7
assert.strictEqual(getLastWeekDailySales(orders).length, 7)
assert.strictEqual(getPreviousWeekDailySales(orders).length, 7)

// Category filter
assert.strictEqual(filterOrdersByCategory(orders, ['General']).length, 1)
assert.strictEqual(filterOrdersByCategory(orders, ['OTC']).length, 1)
assert.strictEqual(filterOrdersByCategory(orders, ['Unknown']).length, 0)

// Monthly sales should return 12 points by default
assert.strictEqual(getMonthlySales(orders).length, 12)

// Month over month comparison should have numeric fields
const mom = getMonthOverMonthComparison(orders)
assert.ok(typeof mom.lastMonthTotal === 'number')
assert.ok(typeof mom.prevMonthTotal === 'number')
assert.ok(typeof mom.delta === 'number')
assert.ok(typeof mom.pct === 'number')

// Last month weekly sales returns an array
assert.ok(Array.isArray(getLastMonthWeeklySales(orders)))

console.log('salesMetrics tests passed')

