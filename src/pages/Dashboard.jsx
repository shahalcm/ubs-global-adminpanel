import React from 'react';
import { Users, Store, Package, DollarSign, ShoppingBag, Clock, X, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '../utils/formatters';

const revenueData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 8900 },
  { name: 'Sat', revenue: 4390 },
  { name: 'Sun', revenue: 3490 },
];

const orderStatusData = [
  { name: 'Delivered', value: 400, color: '#22c55e' },
  { name: 'Pending', value: 300, color: '#f59e0b' },
  { name: 'Cancelled', value: 300, color: '#ef4444' },
  { name: 'Returned', value: 200, color: '#3b82f6' },
];

const StatsCard = ({ title, value, trend, trendUp, icon: Icon, color, borderColor }) => (
  <div className={`bg-white rounded-2xl shadow-sm border-l-4 p-5 ${borderColor}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[13px] text-gray-500 font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center">
      {trendUp ? (
        <TrendingUp size={16} className="text-green-500 mr-1" />
      ) : (
        <TrendingDown size={16} className="text-red-500 mr-1" />
      )}
      <span className={`text-sm font-medium ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
        {trend}
      </span>
      <span className="text-sm text-gray-500 ml-1">this month</span>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, Admin 👋</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Row 1: Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value="12,480"
          trend="↑ 12%"
          trendUp={true}
          icon={Users}
          color="bg-blue-500"
          borderColor="border-blue-500"
        />
        <StatsCard
          title="Total Sellers"
          value="842"
          trend="↑ 5%"
          trendUp={true}
          icon={Store}
          color="bg-purple-500"
          borderColor="border-purple-500"
        />
        <StatsCard
          title="Total Products"
          value="45,290"
          trend="↑ 18%"
          trendUp={true}
          icon={Package}
          color="bg-orange-500"
          borderColor="border-orange-500"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(125430)}
          trend="↑ 8%"
          trendUp={true}
          icon={DollarSign}
          color="bg-green-500"
          borderColor="border-green-500"
        />
      </div>

      {/* Row 2: Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-xl font-bold text-gray-900">8,945</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending Orders</p>
            <p className="text-xl font-bold text-gray-900">342</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <X size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Cancelled Orders</p>
            <p className="text-xl font-bold text-gray-900">128</p>
          </div>
        </div>
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm lg:col-span-3 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Revenue Overview</h3>
            <div className="flex space-x-2">
              {['Week', 'Month', 'Year'].map((period) => (
                <button
                  key={period}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    period === 'Week' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#29b6f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#29b6f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#29b6f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm lg:col-span-2 border border-gray-100 flex flex-col">
          <h3 className="font-bold text-gray-900 mb-2">Orders by Status</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Orders`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {orderStatusData.map((item) => (
              <div key={item.name} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="text-sm font-semibold ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
