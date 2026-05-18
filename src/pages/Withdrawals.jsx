import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Withdrawals = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get('http://localhost:5000/api/payments/admin/commissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setRequests(res.data.withdrawalRequests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      // In a real app, this would call an API endpoint to update the status
      alert(`Withdrawal marked as ${status}`);
      // Refresh list
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold dark:text-white mb-6">Withdrawal Requests</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">Seller</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Amount</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Bank Details</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map(req => (
              <tr key={req._id} className="hover:bg-gray-50">
                <td className="p-4 text-sm text-gray-800 font-medium">{req.sellerId?.shopName}</td>
                <td className="p-4 text-sm font-bold text-gray-800">${req.amount}</td>
                <td className="p-4 text-sm text-gray-600">
                  <div className="text-xs">
                    <p>Acc: {req.bankDetails?.accountNumber}</p>
                    <p>IFSC: {req.bankDetails?.ifscCode}</p>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">
                    {req.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => handleAction(req._id, 'completed')} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold mr-2">Approve</button>
                  <button onClick={() => handleAction(req._id, 'rejected')} className="bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold">Reject</button>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan="5" className="p-4 text-center text-gray-500">No pending withdrawal requests.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Withdrawals;
