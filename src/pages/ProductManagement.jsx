import React, { useState, useEffect } from 'react';
import { getAdminProducts, approveProduct } from '../services/adminService';
import toast from 'react-hot-toast';

const ProductManagement = () => {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await getAdminProducts({
        approvalStatus: 'pending'
      });
      setPendingProducts(res.products || []);
    } catch (error) {
      toast.error('Failed to load pending products');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId) => {
    try {
      await approveProduct(productId);
      toast.success('Product approved - now visible to buyers!');
      loadProducts();
    } catch (error) {
      toast.error('Failed to approve product');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold dark:text-white mb-6">Product Management</h1>
      <div className="bg-white dark:bg-dark-bg p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold dark:text-white mb-4">Pending Approval</h2>
        
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading products...</p>
        ) : pendingProducts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No pending products to review.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Image</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Product</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Seller</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Price</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingProducts.map((product) => (
                  <tr key={product._id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4">
                      <img 
                        src={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/50'} 
                        alt={product.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium dark:text-white">{product.title}</td>
                    <td className="py-3 px-4 dark:text-gray-300">{product.sellerId?.shopName || 'Unknown'}</td>
                    <td className="py-3 px-4 dark:text-gray-300">${product.price}</td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => handleApprove(product._id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
