import React, { useEffect, useState } from 'react'
import { Search, Eye, ChevronLeft, ChevronRight, Filter, Download } from 'lucide-react'
import { getAdminOrders } from '../services/adminService'
import { formatCurrency } from '../utils/formatters'
import { onOrderStatusChanged, offOrderStatusChanged } from '../services/socketService'

const orderStatusConfig = {
  'placed': { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-300', label: 'Placed' },
  'confirmed': { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-300', label: 'Confirmed' },
  'packed': { bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-300', label: 'Packed' },
  'shipped': { bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-300', label: 'Shipped' },
  'delivered': { bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-300', label: 'Delivered' },
  'cancelled': { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-300', label: 'Cancelled' },
  'returned': { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-300', label: 'Returned' }
}

const paymentStatusConfig = {
  'pending': { bg: 'bg-gray-100 dark:bg-gray-600', text: 'text-gray-800 dark:text-gray-200', label: 'Pending' },
  'paid': { bg: 'bg-green-100 dark:bg-green-600', text: 'text-green-800 dark:text-green-200', label: 'Paid' },
  'failed': { bg: 'bg-red-100 dark:bg-red-600', text: 'text-red-800 dark:text-red-200', label: 'Failed' },
  'refunded': { bg: 'bg-purple-100 dark:bg-purple-600', text: 'text-purple-800 dark:text-purple-200', label: 'Refunded' }
}

const StatusBadge = ({ status, config }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
    {config.label}
  </span>
)

const OrdersManagement = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchOrders()

    const handleOrderStatusChange = () => {
      fetchOrders()
    }

    onOrderStatusChanged(handleOrderStatusChange)
    return () => {
      offOrderStatusChanged(handleOrderStatusChange)
    }
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await getAdminOrders()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.buyerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.sellerId?.shopName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !filterStatus || order.orderStatus === filterStatus
    
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage)

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setShowDetails(true)
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2B3674] dark:text-white">Orders Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track all customer orders</p>
        </div>
        <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-opacity-90 transition">
          <Download size={18} />
          <span>Export</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by order number, buyer name, or seller..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            {Object.entries(orderStatusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">Total Orders</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{orders.length}</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">Delivered</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-300">{orders.filter(o => o.orderStatus === 'delivered').length}</p>
          </div>
          <div className="p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">{orders.filter(o => ['placed', 'confirmed', 'packed', 'shipped'].includes(o.orderStatus)).length}</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">Cancelled/Returned</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-300">{orders.filter(o => ['cancelled', 'returned'].includes(o.orderStatus)).length}</p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Order #</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Buyer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Seller</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Items</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Order Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Payment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Date</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4 text-sm font-semibold text-[#2B3674] dark:text-white">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-gray-900 dark:text-gray-100 font-medium">{order.buyerId?.name || 'N/A'}</div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">{order.buyerId?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-gray-900 dark:text-gray-100 font-medium">{order.sellerId?.shopName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(order.grandTotal || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge 
                        status={order.orderStatus} 
                        config={orderStatusConfig[order.orderStatus] || orderStatusConfig.placed}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge 
                        status={order.paymentStatus} 
                        config={paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.pending}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="inline-flex items-center space-x-1 text-primary hover:text-opacity-80 transition"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    currentPage === idx + 1
                      ? 'bg-primary text-white'
                      : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#2B3674] dark:text-white">Order Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Header */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Order Number</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Statuses */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Order Status</p>
                  <StatusBadge 
                    status={selectedOrder.orderStatus} 
                    config={orderStatusConfig[selectedOrder.orderStatus]}
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Payment Status</p>
                  <StatusBadge 
                    status={selectedOrder.paymentStatus} 
                    config={paymentStatusConfig[selectedOrder.paymentStatus]}
                  />
                </div>
              </div>

              {/* Customer & Seller Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Buyer</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.buyerId?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedOrder.buyerId?.email}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Seller</p>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.sellerId?.shopName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: {selectedOrder.sellerId?._id}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.productName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>{formatCurrency(selectedOrder.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span>{formatCurrency(selectedOrder.tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.grandTotal)}</span>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.deliveryAddress && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Delivery Address</p>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                    <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.deliveryAddress.fullName}</p>
                    <p>{selectedOrder.deliveryAddress.street}</p>
                    <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.zipCode}</p>
                    <p>{selectedOrder.deliveryAddress.country}</p>
                    <p className="mt-2">{selectedOrder.deliveryAddress.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersManagement
