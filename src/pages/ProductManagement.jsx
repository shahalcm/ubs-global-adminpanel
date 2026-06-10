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
          className={`relative inline-flex items-center px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all focus:outline-none ${
            i === currentPage
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-bg/40'
          }`}
        >
          {i}
        </button>
      )
    }
    return pages
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-[#2B3674] dark:text-white tracking-tight">Product Management</h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Review and manage products listed on the platform.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap bg-gray-150 dark:bg-white/5 p-1 rounded-xl shadow-sm">
          {['Pending', 'Approved', 'Rejected', 'All'].map((tab) => {
            const val = tab === 'All' ? '' : tab.toLowerCase()
            const isTabActive = status === val
            return (
              <button
                key={tab}
                onClick={() => { setStatus(val); setCurrentPage(1); }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  isTabActive
                    ? 'bg-white dark:bg-dark-card text-[#2B3674] dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-[#2B3674] dark:hover:text-gray-300'
                }`}
              >
                {tab === 'Pending' ? 'Pending Approval' : tab}
              </button>
            )
          })}
        </div>
        <div className="w-full sm:w-80 relative flex items-center">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[15px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-xs font-semibold shadow-soft dark:shadow-none"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-[20px] shadow-soft dark:shadow-none border border-gray-150 dark:border-gray-800/50 overflow-hidden p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800/40 bg-gray-50/70 dark:bg-dark-bg/20 text-gray-500 dark:text-gray-455 text-xs font-bold uppercase">
                <th className="py-3.5 px-4">Image</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Seller</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/30">
              {loading ? (
                Array(limit).fill(0).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-3 px-4"><div className="w-12 h-12 bg-gray-250 dark:bg-dark-bg rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-200 dark:bg-dark-bg rounded w-32"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-150 dark:bg-dark-bg rounded w-20"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-150 dark:bg-dark-bg rounded w-24"></div></td>
                    <td className="py-3 px-4"><div className="h-4 bg-gray-100 dark:bg-dark-bg rounded w-12"></div></td>
                    <td className="py-3 px-4"><div className="h-6 bg-gray-100 dark:bg-dark-bg rounded-full w-14"></div></td>
                    <td className="py-3 px-4 text-right"><div className="h-8 bg-gray-200 dark:bg-dark-bg rounded-lg w-36 ml-auto"></div></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-sm font-semibold text-gray-400 dark:text-gray-500 bg-gray-50/20 dark:bg-dark-bg/10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                      </svg>
                      No products found.
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/15 transition-colors duration-150">
                    <td className="py-3.5 px-4">
                      <img 
                        src={getProductImageUrl(product.images && product.images[0] ? product.images[0] : '')} 
                        alt={product.title}
                        className="w-12 h-12 rounded object-cover border border-gray-150 dark:border-gray-800"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150';
                        }}
                      />
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                      <div>{product.title}</div>
                      {product.rejectionReason && product.approvalStatus === 'rejected' && (
                        <div className="text-xs text-rose-500 font-normal mt-0.5">Reason: {product.rejectionReason}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300 capitalize">{product.category?.name || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300">{product.sellerId?.shopName || 'Unknown'}</td>
                    <td className="py-3.5 px-4 text-gray-900 dark:text-white font-medium">${product.price}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                        product.approvalStatus === 'approved' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                          : product.approvalStatus === 'rejected' 
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400' 
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                      }`}>
                        {product.approvalStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {product.approvalStatus !== 'approved' && (
                        <button 
                          onClick={() => handleApprove(product._id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-emerald-650/10 cursor-pointer transition-all"
                        >
                          Approve
                        </button>
                      )}
                      {product.approvalStatus !== 'rejected' && (
                        <button 
                          onClick={() => handleReject(product._id)}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm shadow-rose-650/10 cursor-pointer transition-all"
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
        <div className="flex items-center justify-between bg-white dark:bg-dark-card px-6 py-4 rounded-[15px] border border-gray-150 dark:border-gray-800/50 shadow-soft dark:shadow-none mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg/40 disabled:opacity-50 transition-all cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg/40 disabled:opacity-50 transition-all cursor-pointer"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Showing page <span className="text-gray-900 dark:text-white">{currentPage}</span> of{' '}
                <span className="text-gray-900 dark:text-white">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md gap-1" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-lg p-2 text-gray-450 ring-1 ring-inset ring-gray-200 dark:ring-gray-800 hover:bg-gray-50 dark:hover:bg-dark-bg/40 focus:outline-none disabled:opacity-30 cursor-pointer transition-all"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                {renderPageNumbers()}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-lg p-2 text-gray-450 ring-1 ring-inset ring-gray-200 dark:ring-gray-800 hover:bg-gray-50 dark:hover:bg-dark-bg/40 focus:outline-none disabled:opacity-30 cursor-pointer transition-all"
                >
                  <span className="sr-only">Next</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
                  </svg>
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
