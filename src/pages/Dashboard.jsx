import React, { useEffect, useState } from 'react'
import { Users, Store, Package, DollarSign, ShoppingBag, Clock, X, TrendingUp, TrendingDown, Plus, FolderPlus, Bell, FileText, Image as ImageIcon, DownloadCloud, Activity } from 'lucide-react'
import { getDashboardStats } from '../services/adminService'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { formatCurrency } from '../utils/formatters'


const quickActions = [
  { icon: Plus, label: 'Add Product', gradient: 'from-[#4318FF] to-[#868CFF]' },
  { icon: FolderPlus, label: 'Add Category', gradient: 'from-[#FFB547] to-[#FFD18B]' },
  { icon: Bell, label: 'Notifications', gradient: 'from-[#FF5E5E] to-[#FF9B9B]' },
  { icon: FileText, label: 'Reports', gradient: 'from-[#05CD99] to-[#6DE1B8]' },
  { icon: ImageIcon, label: 'Banners', gradient: 'from-[#8A49F7] to-[#B68CFF]' },
  { icon: DownloadCloud, label: 'Export', gradient: 'from-[#00C2FF] to-[#7AE6FF]' }
]

const orderStatusColors = {
  'placed': '#FFB547',
  'confirmed': '#4318FF',
  'shipped': '#00C2FF',
  'delivered': '#05CD99',
  'cancelled': '#FF5E5E',
  'returned': '#8A49F7'
}

const StatsCard = ({ title, value, trend, trendUp, icon: Icon, gradient }) => (
  <div className="card group cursor-pointer relative overflow-hidden">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-linear-to-br ${gradient} opacity-10 group-hover:scale-150 transition-transform duration-500`} />
    <div className="flex justify-between items-center mb-4">
      <div className={`w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center`}>
        <Icon size={24} className="text-primary dark:text-accent group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div className="flex items-center space-x-1">
        <span className={`text-sm font-bold ${trendUp ? 'text-green-500' : trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
        {trend > 0 ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
      </div>
    </div>
    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h4>
    <h2 className="text-3xl font-extrabold text-[#2B3674] dark:text-white tracking-tight">{value}</h2>
  </div>
)

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [orderStatusData, setOrderStatusData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats()
        setStats(data.stats)
        
        // Process daily revenue data
        if (data.dailyRevenueData) {
          setRevenueData(data.dailyRevenueData)
        }

        // Process order status breakdown
        if (data.stats.orderStatusBreakdown) {
          const statusData = Object.entries(data.stats.orderStatusBreakdown).map(([status, count]) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: count,
            color: orderStatusColors[status] || '#A3AED0'
          }))
          setOrderStatusData(statusData)
        }
      } catch (error) {
        console.error('Unable to load dashboard stats', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const totalUsers = stats?.totalUsers ?? 0
  const totalSellers = stats?.totalSellers ?? 0
  const totalProducts = stats?.totalProducts ?? 0
  const totalRevenue = stats?.totalRevenue ?? 0
  const pendingOrders = stats?.pendingOrders ?? 0
  const pendingSellerRequests = stats?.pendingSellerRequests ?? 0
  const pendingProducts = stats?.pendingProducts ?? 0
  const usersTrend = stats?.usersTrend ?? 0
  const sellersTrend = stats?.sellersTrend ?? 0
  const productsTrend = stats?.productsTrend ?? 0
  const revenueTrend = stats?.revenueTrend ?? 0

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2B3674] dark:text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Here is the latest data for your platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Revenue" value={formatCurrency(totalRevenue)} trend={revenueTrend} trendUp={revenueTrend >= 0} icon={DollarSign} gradient="from-green-400 to-green-600" />
        <StatsCard title="Total Sellers" value={totalSellers.toLocaleString()} trend={sellersTrend} trendUp={sellersTrend >= 0} icon={Store} gradient="from-purple-400 to-purple-600" />
        <StatsCard title="Total Users" value={totalUsers.toLocaleString()} trend={usersTrend} trendUp={usersTrend >= 0} icon={Users} gradient="from-blue-400 to-blue-600" />
        <StatsCard title="Total Products" value={totalProducts.toLocaleString()} trend={productsTrend} trendUp={productsTrend >= 0} icon={Package} gradient="from-orange-400 to-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#2B3674] dark:text-white">Revenue Overview - Last 7 Days</h3>
            <button className="bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-bold text-primary dark:text-accent transition-colors">
              {revenueData.length > 0 ? `${revenueData[0]?.date} to ${revenueData[revenueData.length - 1]?.date}` : 'This Week'}
            </button>
          </div>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4318FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4318FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(163, 174, 208, 0.2)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 12, fontWeight: 500 }} dx={-10} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111C44', borderRadius: '16px', border: 'none', color: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }} 
                  itemStyle={{ color: '#00C2FF' }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4318FF" strokeWidth={4} fill="url(#colorRevenue)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Daily Revenue</p>
                <p className="text-2xl font-bold text-[#2B3674] dark:text-white mt-2">
                  {formatCurrency(revenueData.length > 0 ? revenueData.reduce((sum, item) => sum + item.revenue, 0) / revenueData.length : 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total This Period</p>
                <p className="text-2xl font-bold text-[#2B3674] dark:text-white mt-2">
                  {formatCurrency(revenueData.reduce((sum, item) => sum + item.revenue, 0))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Peak Day</p>
                <p className="text-2xl font-bold text-[#2B3674] dark:text-white mt-2">
                  {revenueData.length > 0 ? Math.max(...revenueData.map(item => item.revenue)).toLocaleString() : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold text-[#2B3674] dark:text-white mb-6">Order Status Distribution</h3>
          
          {orderStatusData.length > 0 ? (
            <>
              <div className="h-[200px] w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {orderStatusData.map((status, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{status.name}</span>
                    </div>
                    <span className="text-sm font-bold text-[#2B3674] dark:text-white">{status.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No order data available</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-xl font-bold text-[#2B3674] dark:text-white mb-6">Action Items</h3>
          
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Clock className="text-white" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending Sellers</p>
                <p className="text-2xl font-extrabold text-[#2B3674] dark:text-white leading-none mt-1">{pendingSellerRequests}</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <ShoppingBag className="text-white" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending Orders</p>
                <p className="text-2xl font-extrabold text-[#2B3674] dark:text-white leading-none mt-1">{pendingOrders}</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                <X className="text-white" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending Products</p>
                <p className="text-2xl font-extrabold text-[#2B3674] dark:text-white leading-none mt-1">{pendingProducts}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h3 className="text-xl font-bold text-[#2B3674] dark:text-white mb-6">Revenue Analytics</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-500/10 dark:to-green-500/5 rounded-2xl">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Current Month Trend</p>
              <div className="flex items-center space-x-2">
                {revenueTrend >= 0 ? (
                  <>
                    <TrendingUp className="text-green-500" size={20} />
                    <span className="text-2xl font-bold text-green-600">+{revenueTrend}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="text-red-500" size={20} />
                    <span className="text-2xl font-bold text-red-600">{revenueTrend}%</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">vs previous month</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-500/10 dark:to-blue-500/5 rounded-2xl">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Growth Comparison</p>
              <div className="space-y-2 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-300">Users: +{usersTrend}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-300">Sellers: +{sellersTrend}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-300">Products: {productsTrend}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold text-[#2B3674] dark:text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon
            return (
              <button key={idx} className="group relative bg-gray-50 dark:bg-white/5 p-4 rounded-2xl flex flex-col items-center justify-center hover:-translate-y-2 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="text-white" size={26} strokeWidth={2.5} />
                </div>
                <span className="text-sm font-bold text-[#2B3674] dark:text-white">{action.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
