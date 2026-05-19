import React, { useState } from 'react';
import { 
  Download, 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingDown,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

const chartData = [
  { name: 'Jan', gross: 180000, net: 150000, commission: 30000 },
  { name: 'Feb', gross: 220000, net: 185000, commission: 35000 },
  { name: 'Mar', gross: 250000, net: 210000, commission: 40000 },
  { name: 'Apr', gross: 280000, net: 235000, commission: 45000 },
  { name: 'May', gross: 354500, net: 312000, commission: 42500 },
];

const withdrawalRequests = [
  {
    id: 'SEL-9921',
    initials: 'NS',
    color: 'bg-blue-100 text-blue-700',
    name: 'NextGen Systems',
    amount: '$4,250.00',
    bankTitle: 'Chase Bank',
    bankSub: 'Acc: **** 4421',
    date: 'Oct 24, 2023',
    status: 'Pending Review'
  },
  {
    id: 'SEL-3345',
    initials: 'BF',
    color: 'bg-red-100 text-red-700',
    name: 'Blueberry Fashion',
    amount: '$1,890.00',
    bankTitle: 'UPI: bluberry@pay',
    bankSub: 'Verified Merchant',
    date: 'Oct 23, 2023',
    status: 'Processing'
  },
  {
    id: 'SEL-8871',
    initials: 'TC',
    color: 'bg-purple-100 text-purple-700',
    name: 'Tech-Core Sol.',
    amount: '$12,400.00',
    bankTitle: 'HSBC Int.',
    bankSub: 'Acc: **** 9012',
    date: 'Oct 22, 2023',
    status: 'Pending Review'
  }
];

const Payments = () => {
  const [activeTab, setActiveTab] = useState('Pending');

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payments & Commission</h1>
          <p className="text-slate-500 text-sm mt-1">Overview of platform revenue, seller payouts, and commission models.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Download size={18} />
            Export Report
          </button>
          <button className="px-4 py-2 bg-[#0A0F2C] text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
            <Plus size={18} />
            Manual Payout
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-5 text-slate-900">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M21 4H3C1.9 4 1 4.9 1 6V18C1 19.1 1.9 20 3 20H21C22.1 20 23 19.1 23 18V6C23 4.9 22.1 4 21 4ZM21 18H3V6H21V18ZM14 15V13H17V10H14V8L10 11.5L14 15Z" /></svg>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1 relative z-10">Total Revenue</p>
          <h3 className="text-3xl font-bold text-[#0A0F2C] mb-3 relative z-10">$1,284,500.00</h3>
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold relative z-10">
            <TrendingUp size={14} />
            <span>12.4% from last month</span>
          </div>
        </div>

        {/* Paid to Sellers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-5 text-slate-900">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 16H13V18H11V16ZM12 6C10.34 6 9 7.34 9 9H11C11 8.45 11.45 8 12 8C12.55 8 13 8.45 13 9C13 10 11 9.75 11 13H13C13 10.75 15 10.5 15 9C15 7.34 13.66 6 12 6Z" /></svg>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1 relative z-10">Paid to Sellers</p>
          <h3 className="text-3xl font-bold text-[#0A0F2C] mb-3 relative z-10">$1,092,000.00</h3>
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold relative z-10">
            <CheckCircle2 size={14} />
            <span>85% payout ratio</span>
          </div>
        </div>

        {/* Pending Payouts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-5 text-slate-900">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM11 7H12.5V12.25L17 14.92L16.25 16.15L11 13V7Z" /></svg>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1 relative z-10">Pending Payouts</p>
          <h3 className="text-3xl font-bold text-[#0A0F2C] mb-3 relative z-10">$45,280.00</h3>
          <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold relative z-10">
            <AlertTriangle size={14} />
            <span>14 requests awaiting approval</span>
          </div>
        </div>

        {/* Platform Commission */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-5 text-slate-900">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 19H11V17H13V19ZM15 13.5C15 14.33 14.33 15 13.5 15H10.5V16.5H15V19H13.5V20.5H10.5V19H9V17.5C9 16.67 9.67 16 10.5 16H13.5V14.5H9V12H10.5V10.5H13.5V12H15V13.5Z" /></svg>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1 relative z-10">Platform Commission</p>
          <h3 className="text-3xl font-bold text-[#0A0F2C] mb-3 relative z-10">$147,220.00</h3>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold relative z-10">
            <TrendingDown size={14} />
            <span>11.5% average rate</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Financial Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900">Financial Distribution</h2>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0A0F2C]"></div>
                <span className="text-slate-600">Gross Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></div>
                <span className="text-slate-600">Net Payouts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#fca5a5]"></div>
                <span className="text-slate-600">Commission</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="gross" fill="#0A0F2C" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="net" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="commission" fill="#fca5a5" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commission Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <SlidersHorizontal className="text-[#0A0F2C]" size={20} />
            <h2 className="text-lg font-bold text-[#0A0F2C] leading-tight">Commission<br/>Settings</h2>
          </div>
          
          <div className="space-y-6 flex-1">
            <div>
              <label className="block text-[13px] font-bold text-slate-800 mb-2">Default Global Rate (%)</label>
              <div className="relative">
                <input type="text" defaultValue="10" className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A0F2C] focus:border-transparent outline-none transition-all" />
                <span className="absolute right-4 top-2.5 text-slate-400 font-medium">%</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-[13px] font-bold text-slate-800 mb-4">Category Overrides</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-slate-600">Electronics</span>
                  <div className="flex items-center gap-2">
                    <input type="text" defaultValue="8" className="w-16 border border-slate-300 rounded-md px-3 py-1.5 text-center text-sm focus:ring-2 focus:ring-[#0A0F2C] outline-none" />
                    <span className="text-slate-400 text-sm">%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-slate-600 w-24 leading-tight">Apparel & Fashion</span>
                  <div className="flex items-center gap-2">
                    <input type="text" defaultValue="12" className="w-16 border border-slate-300 rounded-md px-3 py-1.5 text-center text-sm focus:ring-2 focus:ring-[#0A0F2C] outline-none" />
                    <span className="text-slate-400 text-sm">%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-slate-600">Home & Kitchen</span>
                  <div className="flex items-center gap-2">
                    <input type="text" defaultValue="15" className="w-16 border border-slate-300 rounded-md px-3 py-1.5 text-center text-sm focus:ring-2 focus:ring-[#0A0F2C] outline-none" />
                    <span className="text-slate-400 text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-6 py-2.5 bg-[#0A0F2C] text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm">
            Save Changes
          </button>
        </div>
      </div>

      {/* Withdrawal Requests */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Withdrawal Requests</h2>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('Pending')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'Pending' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setActiveTab('Completed')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTab === 'Completed' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold">
              <tr>
                <th className="px-6 py-4">Seller</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Bank/UPI Info</th>
                <th className="px-6 py-4">Date Requested</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {withdrawalRequests.map((req, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${req.color}`}>
                        {req.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{req.name}</p>
                        <p className="text-xs text-slate-400">ID: {req.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900">{req.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{req.bankTitle}</p>
                    <p className="text-xs text-slate-400">{req.bankSub}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600">{req.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${
                      req.status === 'Processing' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded transition-colors">
                        Reject
                      </button>
                      <button className="px-3 py-1.5 bg-[#0A0F2C] text-white hover:bg-slate-800 text-xs font-bold rounded transition-colors">
                        Approve
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <span className="text-xs text-slate-500">Showing 3 of 14 pending requests</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:bg-slate-50 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-600 hover:bg-slate-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
