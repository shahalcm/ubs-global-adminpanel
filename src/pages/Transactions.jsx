import React, { useState, useEffect } from 'react'
import { DollarSign, ArrowUpRight, Search, RefreshCw, CreditCard, Calendar, Users, ShoppingBag } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Transactions() {
  const [data, setData] = useState({ totalCommissions: '0.00', transactions: [] })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('All')

  const fetchCommissions = async () => {
    setLoading(true)
    try {
      const res = await api.get('/payments/admin/commissions')
      if (res.data.success) {
        setData(res.data)
      }
    } catch (err) {
      toast.error('Failed to load transaction data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommissions()
  }, [])

  // Analytics helper calculations
  const totalVolume = data.transactions?.reduce((sum, tx) => sum + (tx.grossAmount || 0), 0) || 0
  const totalSellerEarnings = data.transactions?.reduce((sum, tx) => sum + (tx.sellerEarnings || 0), 0) || 0

  // Filtered transactions list
  const filteredTransactions = (data.transactions || []).filter(tx => {
    const orderNum = tx.orderNumber || ''
    const sellerShop = tx.sellerId?.shopName || ''
    const buyerName = tx.buyerId?.name || ''
    const payMethod = tx.paymentMethod || ''

    const matchesSearch = 
      orderNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sellerShop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyerName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPayment = 
      paymentFilter === 'All' || 
      payMethod.toLowerCase() === paymentFilter.toLowerCase()

    return matchesSearch && matchesPayment
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-[#2B3674] dark:text-white flex items-center gap-2">
            <CreditCard className="text-primary dark:text-accent" /> Platform Transactions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor and audit all platform orders, buyer payments, seller payouts, and admin commissions.
          </p>
        </div>
        <button
          onClick={fetchCommissions}
          className="flex items-center gap-2 bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent hover:bg-primary/20 dark:hover:bg-primary/30 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-primary/10 group-hover:scale-150 transition duration-500 pointer-events-none" />
          <div className="flex justify-between items-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <ShoppingBag size={20} className="text-primary dark:text-accent" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400">
              Total Volume
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Gross Platform Sales</p>
          <h2 className="text-3xl font-extrabold text-[#2B3674] dark:text-white mt-2">${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-green-500/10 group-hover:scale-150 transition duration-500 pointer-events-none" />
          <div className="flex justify-between items-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
              <DollarSign size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-105 text-green-800 dark:bg-green-950/30 dark:text-green-400">
              Admin cut (3%)
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Platform Commissions</p>
          <h2 className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-2">${Number(data.totalCommissions || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-yellow-500/10 group-hover:scale-150 transition duration-500 pointer-events-none" />
          <div className="flex justify-between items-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 dark:bg-yellow-500/20 flex items-center justify-center">
              <ArrowUpRight size={20} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
              Seller Payouts
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Seller Net Earnings</p>
          <h2 className="text-3xl font-extrabold text-yellow-600 dark:text-yellow-400 mt-2">${totalSellerEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by Order #, buyer, or shop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Payment Method Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-2 hidden sm:inline-block">Gateway:</span>
          {['All', 'Razorpay', 'Stripe'].map((method) => (
            <button
              key={method}
              onClick={() => setPaymentFilter(method)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                paymentFilter === method
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-700 uppercase">
              <tr>
                <th className="p-4 text-xs">Order Ref</th>
                <th className="p-4 text-xs">Parties (Buyer & Seller)</th>
                <th className="p-4 text-xs">Gross Amount</th>
                <th className="p-4 text-xs">Seller Earnings</th>
                <th className="p-4 text-xs">Admin Commission</th>
                <th className="p-4 text-xs">Payment Method</th>
                <th className="p-4 text-xs">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500 font-medium">
                    Loading platform transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500 font-semibold">
                    No transactions found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <td className="p-4 font-bold text-primary dark:text-accent">
                      #{tx.orderNumber}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col space-y-0.5">
                        <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1 text-xs">
                          <Users size={12} className="text-gray-400" /> {tx.buyerId?.name || 'Customer'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <ShoppingBag size={12} className="text-gray-455 dark:text-gray-500" /> {tx.sellerId?.shopName || 'Merchant'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white">
                      ${tx.grossAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 font-medium text-gray-600 dark:text-gray-400">
                      ${tx.sellerEarnings?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 font-extrabold text-green-600 dark:text-green-400 text-base">
                      +${tx.adminEarnings?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-mono bg-gray-50 dark:bg-gray-900 p-2.5 rounded-xl border border-gray-150 dark:border-gray-800 inline-block">
                        <p className="font-bold text-gray-800 dark:text-gray-200 capitalize">{tx.paymentMethod}</p>
                        {tx.razorpayPaymentId && (
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-30" title={tx.razorpayPaymentId}>
                            ID: {tx.razorpayPaymentId}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        {new Date(tx.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
