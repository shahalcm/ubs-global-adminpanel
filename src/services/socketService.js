import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://api.ubsglobalapp.com'

let socket = null

export const connectAdminSocket = () => {
  const adminToken = localStorage.getItem('adminToken')

  if (socket) {
    if (!socket.connected) {
      console.log('[Admin Socket] Reconnecting existing instance...')
      socket.auth = { token: adminToken }
      socket.connect()
    }
    return socket
  }

  console.log('[Admin Socket] Initializing new Socket.io connection to:', SOCKET_URL)
  socket = io(SOCKET_URL, {
    auth: { token: adminToken },
    query: { token: adminToken },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  })

  socket.on('connect', () => {
    console.log('[Socket Connected] Admin socket ID:', socket.id)
    let adminData = null
    if (adminToken) {
      try {
        const base64Url = adminToken.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        adminData = JSON.parse(jsonPayload)
      } catch (e) {
        console.error('[Admin Socket] Failed to parse JWT token details:', e)
      }
    }
    socket.emit('joinAdmin', adminData)
  })

  socket.on('disconnect', (reason) => {
    console.warn('[Socket Disconnected] Admin socket disconnected. Reason:', reason)
    if (reason === 'io server disconnect' || reason === 'transport close' || reason === 'ping timeout') {
      socket.connect()
    }
  })

  socket.on('connect_error', (error) => {
    console.warn('[Admin Socket] Connection error:', error.message)
  })

  if (typeof window !== 'undefined') {
    window.addEventListener('focus', () => {
      if (socket && !socket.connected) {
        console.log('[Admin Socket] Window focused. Reconnecting socket...')
        socket.connect()
      }
    })

    window.addEventListener('online', () => {
      if (socket && !socket.connected) {
        console.log('[Admin Socket] Network restored online. Reconnecting socket...')
        socket.connect()
      }
    })
  }

  return socket
}

export const getAdminSocket = () => socket

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
