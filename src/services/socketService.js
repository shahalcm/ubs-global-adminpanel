import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || 'https://ubs-global-server-production.up.railway.app'

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
    socket.emit('joinAdmin')
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
