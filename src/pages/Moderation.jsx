import React, { useState, useEffect } from 'react';
import { getAdminReviews, approveReview, deleteReview } from '../services/adminService';
import toast from 'react-hot-toast';

const Moderation = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'approved', 'flagged'

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'approved') params.isApproved = 'true';
      if (filter === 'flagged') params.isFlagged = 'true';
      
      const res = await getAdminReviews(params);
      setReviews(res.reviews || []);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveReview(id);
      toast.success('Review approved successfully');
      loadReviews();
    } catch (error) {
      toast.error('Failed to approve review');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteReview(id);
      toast.success('Review deleted successfully');
      loadReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Reviews & Moderation</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-dark-bg text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
            }`}
          >
            All Reviews
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-dark-bg text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('flagged')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === 'flagged'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-dark-bg text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
            }`}
          >
            Flagged
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-bg p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-semibold dark:text-white mb-4">Customer Feedback</h2>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No reviews found matching filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Product</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Buyer</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Rating</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Comment</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Status</th>
                  <th className="py-3 px-4 font-semibold text-gray-600 dark:text-gray-300 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={review.productId?.images?.[0] || 'https://via.placeholder.com/50'}
                          alt={review.productId?.title || 'Product'}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100 dark:border-gray-800"
                        />
                        <div>
                          <span className="font-semibold text-sm text-gray-800 dark:text-white block max-w-[180px] truncate">
                            {review.productId?.title || 'Deleted Product'}
                          </span>
                          <span className="text-xs text-gray-400 block">
                            Seller: {review.sellerId?.shopName || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={review.buyerId?.avatar || 'https://via.placeholder.com/30'}
                          alt={review.buyerId?.name || 'Buyer'}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-medium text-sm text-gray-700 dark:text-gray-200 block">
                            {review.buyerId?.name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-gray-400 block">
                            {review.buyerId?.email || ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-base ${
                              star <= review.rating ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {review.comment || <span className="italic text-gray-400">No comment text</span>}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {review.isApproved ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Approved
                        </span>
                      ) : review.isFlagged ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                          Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!review.isApproved && (
                          <button
                            onClick={() => handleApprove(review._id)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 p-1.5 rounded-lg border border-emerald-200 transition-colors"
                            title="Approve Review"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 p-1.5 rounded-lg border border-rose-200 transition-colors"
                          title="Delete Review"
                        >
                          ✕
                        </button>
                      </div>
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

export default Moderation;
