import React, { useState, useEffect } from 'react'
import { Truck, RefreshCw, Filter, FileText, Barcode, CheckCircle, Search, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-[#2B3674] dark:text-white flex items-center gap-2">
            <Truck className="text-primary" /> Shiprocket Shipping Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor real-time shipments, couriers, AWBs, shipping revenue, and costs across all sellers.
          </p>
        </div>
        <button
          onClick={fetchShipments}
          className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2.5 rounded-xl font-semibold transition"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total Active Shipments</p>
          <h2 className="text-3xl font-extrabold text-[#2B3674] dark:text-white mt-2">{analytics.count || shipments.length}</h2>
        </div>
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total Shipping Revenue</p>
          <h2 className="text-3xl font-extrabold text-green-600 mt-2">₹{Number(analytics.totalRevenue || 0).toLocaleString()}</h2>
        </div>
        <div className="bg-white dark:bg-card p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total Shipping Costs</p>
          <h2 className="text-3xl font-extrabold text-blue-600 mt-2">₹{Number(analytics.totalShippingCost || 0).toLocaleString()}</h2>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-card p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          <Filter size={18} /> Filters:
        </div>
        <input
          type="text"
          placeholder="Order #"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="px-3.5 py-2 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        />
        <input
          type="text"
          placeholder="AWB Code"
          value={awbCode}
          onChange={(e) => setAwbCode(e.target.value)}
          className="px-3.5 py-2 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        />
        <input
          type="text"
          placeholder="Courier Name"
          value={courier}
          onChange={(e) => setCourier(e.target.value)}
          className="px-3.5 py-2 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3.5 py-2 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
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
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition flex items-center gap-1.5"
        >
          <Search size={16} /> Search
        </button>
      </div>

      {/* Shipments Table */}
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="p-4">Order #</th>
                <th className="p-4">Seller</th>
                <th className="p-4">Courier</th>
                <th className="p-4">AWB Code</th>
                <th className="p-4">Status</th>
                <th className="p-4">Documents</th>
                <th className="p-4 text-right">Actions</th>
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
                    <td className="p-4 font-bold text-primary">{s.orderNumber}</td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{s.sellerId?.shopName || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{s.sellerId?.ownerName}</p>
                    </td>
                    <td className="p-4 font-medium">{s.courierName || 'Shiprocket Courier'}</td>
                    <td className="p-4 font-mono text-xs font-semibold">{s.awbCode || s.trackingNumber || 'Pending'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        s.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                        s.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-700' :
                        s.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {s.orderStatus?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {s.invoiceUrl && (
                          <a href={s.invoiceUrl} target="_blank" rel="noreferrer" title="Invoice" className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                            <FileText size={16} />
                          </a>
                        )}
                        {s.labelUrl && (
                          <a href={s.labelUrl} target="_blank" rel="noreferrer" title="Shipping Label" className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100">
                            <Barcode size={16} />
                          </a>
                        )}
                        {s.manifestUrl && (
                          <a href={s.manifestUrl} target="_blank" rel="noreferrer" title="Manifest" className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100">
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
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs font-semibold rounded-lg transition"
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
