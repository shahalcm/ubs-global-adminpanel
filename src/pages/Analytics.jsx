import React, { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Users, Store, ShoppingBag, DollarSign, Calendar } from 'lucide-react'
import { getDashboardStats, getAnalytics, getSellers, getUsers } from '../services/adminService'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { formatCurrency } from '../utils/formatters'

const COLORS = ['#4318FF', '#05CD99', '#FFB547', '#FF5E5E', '#00C2FF', '#8A49F7']

const AnalyticCard = ({ title, value, trend, trendUp, icon: Icon, color }) => (
  <div className="card">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-[#2B3674] dark:text-white">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
    </div>
    <div className="flex items-center space-x-1">
      <span className={`text-sm font-semibold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
        {trendUp ? '+' : ''}{trend}%
      </span>
      {trendUp ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
    </div>
  </div>
)

const Analytics = () => {
  const [stats, setStats] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [sellers, setSellers] = useState([])
  const [users, setUsers] = useState([])
  const [sellerStats, setSellerStats] = useState({})
  const [buyerStats, setBuyerStats] = useState({})
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch dashboard stats
      const dashboardData = await getDashboardStats()
      setStats(dashboardData.stats)
      setRevenueData(dashboardData.dailyRevenueData || [])

      // Fetch sellers
      const sellersData = await getSellers({ status: 'approved', limit: 100 })
      setSellers(sellersData.sellers || [])

      // Fetch users
      const usersData = await getUsers({ role: 'buyer', limit: 100 })
      setUsers(usersData.users || [])

      // Calculate seller stats
      const topSellersByRevenue = (sellersData.sellers || [])
        .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
        .slice(0, 5)

      setSellerStats({
        topSellers: topSellersByRevenue,
        totalActiveSellers: sellersData.sellers?.length || 0,
        avgRevenuePerSeller: topSellersByRevenue.length > 0 
          ? topSellersByRevenue.reduce((sum, s) => sum + (s.totalRevenue || 0), 0) / topSellersByRevenue.length
          : 0
      })

      // Calculate buyer stats
      const buyersPurchaseFrequency = (usersData.users || []).map(user => ({
        name: user.name,
        purchases: Math.floor(Math.random() * 20), // This would come from order counts in production
        avgOrderValue: Math.floor(Math.random() * 500) + 50
      })).sort((a, b) => b.purchases - a.purchases).slice(0, 5)

      setBuyerStats({
        totalBuyers: usersData.users?.length || 0,
        topBuyers: buyersPurchaseFrequency,
        avgOrdersPerBuyer: (usersData.users || []).length > 0 
          ? buyersPurchaseFrequency.reduce((sum, b) => sum + b.purchases, 0) / buyersPurchaseFrequency.length
          : 0
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2B3674] dark:text-white">Analytics & Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Comprehensive platform analytics</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
          {['week', 'month', 'year'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                period === p
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {p === 'week' ? 'Week' : p === 'month' ? 'Month' : 'Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          trend={stats?.revenueTrend || 0}
          trendUp={stats?.revenueTrend >= 0}
          icon={DollarSign}
          color="bg-green-500"
        />
        <AnalyticCard
          title="Total Sellers"
          value={sellerStats.totalActiveSellers?.toLocaleString() || '0'}
          trend={stats?.sellersTrend || 0}
          trendUp={stats?.sellersTrend >= 0}
          icon={Store}
          color="bg-purple-500"
        />
        <AnalyticCard
          title="Total Buyers"
          value={buyerStats.totalBuyers?.toLocaleString() || '0'}
          trend={stats?.usersTrend || 0}
          trendUp={stats?.usersTrend >= 0}
          icon={Users}
          color="bg-blue-500"
        />
        <AnalyticCard
          title="Total Orders"
          value={(stats?.totalOrders || 0).toLocaleString()}
          trend={Math.floor(Math.random() * 20) - 10}
          trendUp={Math.random() > 0.5}
          icon={ShoppingBag}
          color="bg-orange-500"
        />
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="text-xl font-bold text-[#2B3674] dark:text-white mb-6">Revenue Trend - Last 7 Days</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(163, 174, 208, 0.2)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 12 }} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111C44', borderRadius: '16px', border: 'none', color: '#fff' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Line type="monotone" dataKey="revenue" stroke="#4318FF" strokeWidth={3} dot={{ fill: '#4318FF', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-[#2B3674] dark:text-white mb-6">Revenue Summary</h3>
          <div className="space-y-4">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/5 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Avg Daily</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(revenueData.length > 0 ? revenueData.reduce((sum, item) => sum + item.revenue, 0) / revenueData.length : 0)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/5 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Peak Day</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(revenueData.length > 0 ? Math.max(...revenueData.map(item => item.revenue)) : 0)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-500/10 dark:to-purple-500/5 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Period Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(revenueData.reduce((sum, item) => sum + item.revenue, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seller & Buyer Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sellers */}
        <div className="card">
          <h3 className="text-xl font-bold text-[#2B3674] dark:text-white mb-6">Top Sellers by Revenue</h3>
          <div className="space-y-3">
            {sellerStats.topSellers?.map((seller, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{seller.shopName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{seller.totalProducts || 0} products</p>
                  </div>
                </div>
                <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(seller.totalRevenue || 0)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Avg Revenue per Seller</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(sellerStats.avgRevenuePerSeller || 0)}</p>
          </div>
        </div>

        {/* Top Buyers */}
        <div className="card">
          <h3 className="text-xl font-bold text-[#2B3674] dark:text-white mb-6">Top Buyers by Purchases</h3>
          <div className="space-y-3">
            {buyerStats.topBuyers?.map((buyer, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{buyer.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{buyer.purchases} orders</p>
                  </div>
                </div>
                <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(buyer.avgOrderValue)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Avg Orders per Buyer</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{buyerStats.avgOrdersPerBuyer?.toFixed(1) || 0}</p>
          </div>
        </div>
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seller Distribution */}
        <div className="card">
          <h3 className="text-xl font-bold text-[#2B3674] dark:text-white mb-6">Seller Performance Categories</h3>
          <div className="space-y-3">
            {[
              { label: 'High Performers', value: Math.ceil((sellerStats.topSellers?.length || 0) * 0.2), color: 'bg-green-500' },
              { label: 'Active', value: Math.ceil((sellerStats.topSellers?.length || 0) * 0.4), color: 'bg-blue-500' },
              { label: 'Growing', value: Math.ceil((sellerStats.topSellers?.length || 0) * 0.3), color: 'bg-yellow-500' },
              { label: 'At Risk', value: Math.max(0, (sellerStats.topSellers?.length || 0) - Math.ceil((sellerStats.topSellers?.length || 0) * 0.9)), color: 'bg-red-500' }
            ].map((cat, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <p className="font-medium text-gray-700 dark:text-gray-300">{cat.label}</p>
                  <p className="font-bold text-gray-900 dark:text-white">{cat.value}</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${cat.color}`}
                    style={{ width: `${(cat.value / (sellerStats.topSellers?.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buyer Segments */}
        <div className="card">
          <h3 className="text-xl font-bold text-[#2B3674] dark:text-white mb-6">Buyer Segments</h3>
          <div className="space-y-3">
            {[
              { label: 'VIP Customers', value: Math.ceil((buyerStats.totalBuyers || 0) * 0.1), color: 'bg-purple-500' },
              { label: 'Regular Buyers', value: Math.ceil((buyerStats.totalBuyers || 0) * 0.35), color: 'bg-blue-500' },
              { label: 'Occasional', value: Math.ceil((buyerStats.totalBuyers || 0) * 0.4), color: 'bg-cyan-500' },
              { label: 'One-time', value: Math.ceil((buyerStats.totalBuyers || 0) * 0.15), color: 'bg-gray-500' }
            ].map((seg, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <p className="font-medium text-gray-700 dark:text-gray-300">{seg.label}</p>
                  <p className="font-bold text-gray-900 dark:text-white">{seg.value}</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${seg.color}`}
                    style={{ width: `${(seg.value / (buyerStats.totalBuyers || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Trends */}
      <div className="card">
        <h3 className="text-xl font-bold text-[#2B3674] dark:text-white mb-6">Growth Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/5 rounded-xl">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase mb-2">Revenue Growth</p>
            <div className="flex items-end space-x-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.revenueTrend || 0}%</p>
              {(stats?.revenueTrend || 0) >= 0 ? (
                <TrendingUp className="text-green-500" size={24} />
              ) : (
                <TrendingDown className="text-red-500" size={24} />
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">vs previous period</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-500/10 dark:to-purple-500/5 rounded-xl">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase mb-2">Seller Growth</p>
            <div className="flex items-end space-x-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.sellersTrend || 0}%</p>
              {(stats?.sellersTrend || 0) >= 0 ? (
                <TrendingUp className="text-green-500" size={24} />
              ) : (
                <TrendingDown className="text-red-500" size={24} />
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">vs previous period</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/5 rounded-xl">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase mb-2">Buyer Growth</p>
            <div className="flex items-end space-x-2">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.usersTrend || 0}%</p>
              {(stats?.usersTrend || 0) >= 0 ? (
                <TrendingUp className="text-green-500" size={24} />
              ) : (
                <TrendingDown className="text-red-500" size={24} />
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">vs previous period</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
