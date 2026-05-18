import React from 'react';
import { useNavigate } from 'react-router-dom';

const Support = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-2xl font-bold dark:text-white mb-6">Messages & Support</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Buyer Support Requests</h2>
          <p className="text-gray-500 mb-4">
            Review incoming buyer admin requests and approve or connect them with sellers.
          </p>
          <button
            onClick={() => navigate('/contact-requests')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            View Contact Requests
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Chat Monitoring</h2>
          <p className="text-gray-500 mb-4">
            Monitor active buyer-seller conversations and step in if admin support is needed.
          </p>
          <button
            onClick={() => navigate('/chat-monitor')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Open Chat Monitor
          </button>
        </div>
      </div>
    </div>
  );
};

export default Support;
