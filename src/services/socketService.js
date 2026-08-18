import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || 'https://api.ubsglobalapp.com'

let socket = null

export const connectAdminSocket = () => {
  if (socket) {
    console.log('🔌 Admin socket connection already exists. Status connected:', socket.connected)
    if (!socket.connected) {
      console.log('🔄 Reconnecting existing admin socket instance...')
      socket.connect()
    }
    return socket
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  })

  socket.on('connect', () => {
    console.log('✅ Admin socket connected')
    const adminToken = localStorage.getItem('adminToken')
    let adminData = null
    if (adminToken) {
      try {
        const base64Url = adminToken.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        adminData = JSON.parse(jsonPayload)
      } catch (e) {
        console.error('Failed to parse admin token details:', e)
      }
    }
    socket.emit('joinAdmin', adminData)
  })

  socket.on('disconnect', (reason) => {
    console.log('❌ Admin socket disconnected:', reason)
    if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') {
      socket.connect()
    }
  })

  socket.on('connect_error', (error) => {
    console.warn('⚠️ Admin socket connection error:', error)
  })

  // Reconnect automatically when the web page is focused or comes back online
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', () => {
      if (socket && !socket.connected) {
        console.log('🖥️ Admin panel focused. Reconnecting socket...')
        socket.connect()
      }
    })

    window.addEventListener('online', () => {
      if (socket && !socket.connected) {
        console.log('🖥️ Admin panel back online. Reconnecting socket...')
        socket.connect()
      }
    })
  }

  return socket
}

export const getAdminSocket = () => socket

// Listen for admin events
export const onNewContactRequest = (callback) => {
  socket?.on('newContactRequest', callback)
}

export const onNewOrder = (callback) => {
  socket?.on('newOrder', callback)
}

export const onChatActivity = (callback) => {
  socket?.on('chatActivity', callback)
}

export const onNewSellerRequest = (callback) => {
  socket?.on('newSellerRequest', callback)
}

export const onOrderStatusChanged = (callback) => {
  socket?.on('orderStatusChanged', callback)
}

export const offOrderStatusChanged = (callback) => {
  socket?.off('orderStatusChanged', callback)
}

export const setAvailability = (status) => {
  socket?.emit('support-call:set-availability', { status })
}
