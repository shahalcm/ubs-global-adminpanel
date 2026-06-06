import { useState, useEffect } from 'react';
import { getAdminProducts, approveProduct, rejectProduct } from '../services/adminService';
import toast from 'react-hot-toast';
import { getProductImageUrl } from '../utils/formatters';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('pending'); // default to pending as it requires review

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const limit = 10;

  // Keystroke Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchTerm])

  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      await Promise.resolve();
      if (!active) return;
      setLoading(true);
      try {
        const res = await getAdminProducts({
          approvalStatus: status || undefined,
          page: currentPage,
          limit,
          search: debouncedSearch,
          excludeServices: 'true'
        });
        if (!active) return;
        setProducts(res.products || []);
        setTotalPages(res.pagination?.pages || 1);
      } catch (error) {
        console.error('fetchProducts error:', error);
        toast.error('Failed to load products');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      active = false;
    };
  }, [currentPage, debouncedSearch, status, reloadTrigger]);

  const handleApprove = async (productId) => {
    try {
      await approveProduct(productId);
      toast.success('Product approved - now visible to buyers!');
      setReloadTrigger(prev => prev + 1);
    } catch (error) {
      console.error('handleApprove error:', error);
      toast.error('Failed to approve product');
    }
  };

  const handleReject = async (productId) => {
    try {
      const reason = window.prompt('Provide a reason for rejecting this product?');
      if (reason === null) return; // Cancel clicked
      if (!reason.trim()) {
        toast.error('Rejection reason is required');
        return;
      }
      await rejectProduct(productId, reason);
      toast.success('Product rejected successfully');
      setReloadTrigger(prev => prev + 1);
    } catch (error) {
      console.error('handleReject error:', error);
      toast.error('Failed to reject product');
    }
  };

  const renderPageNumbers = () => {
    const pages = []
    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, startPage + 4)
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
            i === currentPage
              ? 'z-10 bg-[#0A0F2C] text-white focus-visible:outline-2 focus-visible:outline-offset-2'
              : 'text-gray-900 dark:text-gray-250 bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
          }`}
        >
          {i}
        </button>
      )
    }
    return pages
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Product Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Review and manage products listed on the platform.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-sm">
          {['Pending', 'Approved', 'Rejected', 'All'].map((tab) => {
            const val = tab === 'All' ? '' : tab.toLowerCase()
            const isTabActive = status === val
            return (
              <button
                key={tab}
                onClick={() => { setStatus(val); setCurrentPage(1); }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  isTabActive
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab === 'Pending' ? 'Pending Approval' : tab}
              </button>
            )
          })}
        </div>
        <div className="w-full lg:w-80 relative">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-855 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-850 text-slate-500 dark:text-gray-400 text-xs font-bold uppercase">
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Seller</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                Array(limit).fill(0).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3 px-4"><div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-12"></div></td>
                    <td className="py-3 px-4"><div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-14"></div></td>
                    <td className="py-3 px-4 text-right"><div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-36 ml-auto"></div></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500 dark:text-gray-400 bg-slate-50/50 dark:bg-slate-850/50">No products found.</td>
                </tr>
              ) : (
                products.map((product) => (
                   <tr key={product._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <img 
                        src={getProductImageUrl(product.images && product.images[0] ? product.images[0] : '')} 
                        alt={product.title}
                        className="w-12 h-12 rounded object-cover border border-gray-100 dark:border-gray-800"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150';
                        }}
                      />
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      <div>{product.title}</div>
                      {product.rejectionReason && product.approvalStatus === 'rejected' && (
                        <div className="text-xs text-red-500 font-normal mt-0.5">Reason: {product.rejectionReason}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300 capitalize">{product.category?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{product.sellerId?.shopName || 'Unknown'}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">${product.price}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                        product.approvalStatus === 'approved' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                          : product.approvalStatus === 'rejected' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {product.approvalStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {product.approvalStatus !== 'approved' && (
                        <button 
                          onClick={() => handleApprove(product._id)}
                          className="bg-green-600 hover:bg-green-755 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {product.approvalStatus !== 'rejected' && (
                        <button 
                          onClick={() => handleReject(product._id)}
                          className="bg-red-650 hover:bg-red-755 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          Reject
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

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white dark:bg-slate-900 px-4 py-3 sm:px-6 mt-4 rounded-xl shadow-sm border dark:border-slate-800">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-750 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-750 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Showing page <span className="font-semibold">{currentPage}</span> of{' '}
                <span className="font-semibold">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-755 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <span>&larr;</span>
                </button>
                {renderPageNumbers()}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-755 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <span>&rarr;</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
