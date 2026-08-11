import React, { useState, useEffect } from 'react'
import { Truck, RefreshCw, Filter, FileText, Barcode, CheckCircle, Search, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

const orderStatusConfig = {
  'placed': { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-300', label: 'PLACED' },
  'confirmed': { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-300', label: 'CONFIRMED' },
  'packed': { bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-300', label: 'PACKED' },
  'shipped': { bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-300', label: 'SHIPPED' },
  'delivered': { bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-300', label: 'DELIVERED' },
  'cancelled': { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-300', label: 'CANCELLED' }
}

export default function ShippingManagement() {
  const [shipments, setShipments] = useState([])
  const [analytics, setAnalytics] = useState({ totalShippingCost: 0, totalRevenue: 0, count: 0 })
  const [loading, setLoading] = useState(true)

  // Filters
  const [sellerId, setSellerId] = useState('')
  const [courier, setCourier] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [awbCode, setAwbCode] = useState('')
  const [status, setStatus] = useState('All')
  const [syncingId, setSyncingId] = useState(null)

  const fetchShipments = async () => {
    setLoading(true)
    try {
      const params = {}
      if (sellerId) params.sellerId = sellerId
      if (courier) params.courier = courier
      if (orderNumber) params.orderNumber = orderNumber
      if (awbCode) params.awbCode = awbCode
      if (status !== 'All') params.status = status

      const res = await api.get('/admin/shipments', { params })
      if (res.data.success) {
        setShipments(res.data.shipments || [])
        setAnalytics(res.data.analytics || { totalShippingCost: 0, totalRevenue: 0, count: 0 })
      }
    } catch (err) {
      toast.error('Failed to load shipments data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShipments()
  }, [status])

  const handleSyncTracking = async (orderId) => {
    try {
      setSyncingId(orderId)
      const res = await api.post(`/admin/shipments/${orderId}/sync-tracking`)
      if (res.data.success) {
        toast.success('Shipment tracking synced with Shiprocket!')
        fetchShipments()
      } else {
        toast.error(res.data.message || 'Sync failed')
      }
    } catch (err) {
      toast.error('Failed to sync shipment tracking')
    } finally {
      setSyncingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-[#2B3674] dark:text-white flex items-center gap-2">
            <Truck className="text-primary dark:text-accent" /> Shiprocket Shipping Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor real-time shipments, couriers, AWBs, shipping revenue, and costs across all sellers.
          </p>
        </div>
        <button
          onClick={fetchShipments}
          className="flex items-center gap-2 bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent hover:bg-primary/20 dark:hover:bg-primary/30 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Active Shipments</p>
          <h2 className="text-3xl font-extrabold text-[#2B3674] dark:text-white mt-2">{analytics.count || shipments.length}</h2>
        </div>
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Shipping Revenue</p>
          <h2 className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-2">₹{Number(analytics.totalRevenue || 0).toLocaleString()}</h2>
        </div>
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Shipping Costs</p>
          <h2 className="text-3xl font-extrabold text-blue-600 dark:text-accent mt-2">₹{Number(analytics.totalShippingCost || 0).toLocaleString()}</h2>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Filter size={18} /> Filters:
        </div>
        <input
          type="text"
          placeholder="Order #"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="px-3.5 py-2 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-gray-500"
        />
        <input
          type="text"
          placeholder="AWB Code"
          value={awbCode}
          onChange={(e) => setAwbCode(e.target.value)}
          className="px-3.5 py-2 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-gray-500"
        />
        <input
          type="text"
          placeholder="Courier Name"
          value={courier}
          onChange={(e) => setCourier(e.target.value)}
          className="px-3.5 py-2 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-gray-500"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3.5 py-2 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="All">All Statuses</option>
          <option value="placed">Placed</option>
          <option value="confirmed">Confirmed</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={fetchShipments}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Search size={16} /> Search
        </button>
      </div>

      {/* Shipments Table */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-700 uppercase">
              <tr>
                <th className="p-4 text-xs">Order #</th>
                <th className="p-4 text-xs">Seller</th>
                <th className="p-4 text-xs">Courier</th>
                <th className="p-4 text-xs">AWB Code</th>
                <th className="p-4 text-xs">Status</th>
                <th className="p-4 text-xs">Documents</th>
                <th className="p-4 text-right text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    Loading shipments data...
                  </td>
                </tr>
              ) : shipments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    No shipments found matching criteria.
                  </td>
                </tr>
              ) : (
                shipments.map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <td className="p-4 font-bold text-primary dark:text-accent">{s.orderNumber}</td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{s.sellerId?.shopName || 'N/A'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{s.sellerId?.ownerName}</p>
                    </td>
                    <td className="p-4 font-medium">{s.courierName || 'Shiprocket Courier'}</td>
                    <td className="p-4 font-mono text-xs font-semibold">{s.awbCode || s.trackingNumber || 'Pending'}</td>
                    <td className="p-4">
                      {(() => {
                        const status = s.orderStatus?.toLowerCase() || 'placed';
                        const config = orderStatusConfig[status] || { bg: 'bg-gray-50 dark:bg-gray-500/10', text: 'text-gray-700 dark:text-gray-300', label: status.toUpperCase() };
                        return (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
                            {config.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {s.invoiceUrl && (
                          <a 
                            href={s.invoiceUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            title="Invoice" 
                            className="p-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition"
                          >
                            <FileText size={16} />
                          </a>
                        )}
                        {s.labelUrl && (
                          <a 
                            href={s.labelUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            title="Shipping Label" 
                            className="p-1.5 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-300 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-500/20 transition"
                          >
                            <Barcode size={16} />
                          </a>
                        )}
                        {s.manifestUrl && (
                          <a 
                            href={s.manifestUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            title="Manifest" 
                            className="p-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition"
                          >
                            <Download size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {s.awbCode && (
                        <button
                          onClick={() => handleSyncTracking(s._id)}
                          disabled={syncingId === s._id}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer"
                        >
                          {syncingId === s._id ? 'Syncing...' : 'Sync Track'}
                        </button>
                      )}
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
