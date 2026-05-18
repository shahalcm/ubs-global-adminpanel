import React, { useEffect, useState } from 'react'
import { Users, Store, Package, DollarSign, ShoppingBag, Clock, X, TrendingUp, TrendingDown, Plus, FolderPlus, Bell, FileText, Image as ImageIcon, DownloadCloud, Activity } from 'lucide-react'
import { getDashboardStats } from '../services/adminService'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { formatCurrency } from '../utils/formatters'
import logo from "../../public/logo.png";

const quickActions = [
  { icon: Plus, label: 'Add Product', gradient: 'from-[#4318FF] to-[#868CFF]' },
  { icon: FolderPlus, label: 'Add Category', gradient: 'from-[#FFB547] to-[#FFD18B]' },
  { icon: Bell, label: 'Notifications', gradient: 'from-[#FF5E5E] to-[#FF9B9B]' },
  { icon: FileText, label: 'Reports', gradient: 'from-[#05CD99] to-[#6DE1B8]' },
  { icon: ImageIcon, label: 'Banners', gradient: 'from-[#8A49F7] to-[#B68CFF]' },
  { icon: DownloadCloud, label: 'Export', gradient: 'from-[#00C2FF] to-[#7AE6FF]' }
]

const revenueData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 8900 },
  { name: 'Sat', revenue: 4390 },
  { name: 'Sun', revenue: 3490 }
]

const orderStatusData = [
  { name: 'Delivered', value: 400, color: '#05CD99' },
  { name: 'Pending', value: 300, color: '#FFB547' },
  { name: 'Cancelled', value: 300, color: '#FF5E5E' },
  { name: 'Returned', value: 200, color: '#4318FF' }
]

const StatsCard = ({ title, value, trend, trendUp, icon: Icon, gradient }) => (
  <div className="card group cursor-pointer relative overflow-hidden">
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-linear-to-br ${gradient} opacity-10 group-hover:scale-150 transition-transform duration-500`} />
    <div className="flex justify-between items-center mb-4">
      <div className={`w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center`}>
        <Icon size={24} className="text-primary dark:text-accent group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div className="flex items-center space-x-1">
        <span className={`text-sm font-bold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
          {trendUp ? '+' : '-'}{trend}
        </span>
        {trendUp ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
      </div>
    </div>
    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h4>
    <h2 className="text-3xl font-extrabold text-[#2B3674] dark:text-white tracking-tight">{value}</h2>
  </div>
)

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats()
        setStats(data.stats)
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
        <StatsCard title="Total Revenue" value={formatCurrency(totalRevenue)} trend="12.5%" trendUp={true} icon={DollarSign} gradient="from-green-400 to-green-600" />
        <StatsCard title="Total Sellers" value={totalSellers.toLocaleString()} trend="5.2%" trendUp={true} icon={Store} gradient="from-purple-400 to-purple-600" />
        <StatsCard title="Total Users" value={totalUsers.toLocaleString()} trend="2.1%" trendUp={true} icon={Users} gradient="from-blue-400 to-blue-600" />
        <StatsCard title="Total Products" value={totalProducts.toLocaleString()} trend="0.8%" trendUp={false} icon={Package} gradient="from-orange-400 to-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#2B3674] dark:text-white">Revenue Overview</h3>
            <button className="bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-bold text-primary dark:text-accent transition-colors">
              This Week
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
                />
                <Area type="monotone" dataKey="revenue" stroke="#4318FF" strokeWidth={4} fill="url(#colorRevenue)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

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
