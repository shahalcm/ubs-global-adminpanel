import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Transactions = () => {
  const [data, setData] = useState({ totalCommissions: 0, transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get('https://ubs-global-server.onrender.com/api/payments/admin/commissions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCommissions();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold dark:text-white mb-6">Platform Transactions</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 max-w-sm">
        <h3 className="text-gray-500 text-sm font-semibold mb-2">Total Platform Commissions (3%)</h3>
        <p className="text-3xl font-bold text-green-600">${data.totalCommissions}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">Order ID</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Seller</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Gross</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Seller Earnings</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Admin Commission</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.transactions.map(tx => (
              <tr key={tx._id} className="hover:bg-gray-50">
                <td className="p-4 text-sm text-blue-600 font-medium">#{tx.orderNumber}</td>
                <td className="p-4 text-sm text-gray-800">{tx.sellerId?.shopName}</td>
                <td className="p-4 text-sm text-gray-600">${tx.grossAmount}</td>
                <td className="p-4 text-sm text-gray-600">${tx.sellerEarnings}</td>
                <td className="p-4 text-sm font-bold text-green-600">${tx.adminEarnings}</td>
                <td className="p-4 text-sm text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {data.transactions.length === 0 && (
              <tr><td colSpan="6" className="p-4 text-center text-gray-500">No transactions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
