import { BrowserRouter, Routes, Route, Navigate }
  from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { connectAdminSocket } from './services/socketService'
import useAuthStore from './store/authStore'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SellerManagement from './pages/SellerManagement'
import UserManagement from './pages/UserManagement'
import ProductManagement from './pages/ProductManagement'
import OrdersManagement from './pages/OrdersManagement'
import Categories from './pages/Categories'
import Analytics from './pages/Analytics'
import Banners from './pages/Banners'
import Payments from './pages/Payments'
import Support from './pages/Support'
import Notifications from './pages/Notifications'
import Moderation from './pages/Moderation'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import ContactRequests from './pages/ContactRequests'
import ChatMonitor from './pages/ChatMonitor'
import Transactions from './pages/Transactions'
import Withdrawals from './pages/Withdrawals'
import LegalCompliance from './pages/LegalCompliance'
import JobsServices from './pages/JobsServices'


export default function App() {
  const { token } = useAuthStore()

  useEffect(() => {
    if (token) {
      connectAdminSocket()
    }
  }, [token])

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <Navigate to="/dashboard" replace />
        } />
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard"
            element={<Dashboard />} />
          <Route path="/sellers"
            element={<SellerManagement />} />
          <Route path="/users"
            element={<UserManagement />} />
          <Route path="/products"
            element={<ProductManagement />} />
          <Route path="/jobs-services"
            element={<JobsServices />} />
          <Route path="/orders"
            element={<OrdersManagement />} />
          <Route path="/categories"
            element={<Categories />} />
          <Route path="/analytics"
            element={<Analytics />} />
          <Route path="/banners"
            element={<Banners />} />
          <Route path="/payments"
            element={<Payments />} />
          <Route path="/support"
            element={<Support />} />
          <Route path="/notifications"
            element={<Notifications />} />
          <Route path="/moderation"
            element={<Moderation />} />
          <Route path="/contact-requests"
            element={<ContactRequests />} />
          <Route path="/chat-monitor"
            element={<ChatMonitor />} />
          <Route path="/transactions"
            element={<Transactions />} />
          <Route path="/withdrawals"
            element={<Withdrawals />} />
          <Route path="/settings"
            element={<Settings />} />
          <Route path="/profile"
            element={<Profile />} />
          <Route path="/legal-compliance"
            element={<LegalCompliance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
