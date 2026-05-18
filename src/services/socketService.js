import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || 'http://localhost:5000'

let socket = null

export const connectAdminSocket = () => {
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnection: true,
  })

  socket.on('connect', () => {
    console.log('✅ Admin socket connected')
    socket.emit('joinAdmin')
  })

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
