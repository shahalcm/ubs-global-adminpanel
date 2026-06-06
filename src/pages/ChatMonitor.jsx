import React, { useState, useEffect, useRef } from 'react'
import {
  getChatRooms,
  getAdminChatMessages,
  sendAdminChatMessage
} from '../services/adminService'
import toast from 'react-hot-toast'

const ChatMonitor = () => {
  const [rooms, setRooms] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const messageEndRef = useRef(null)
  const pollingInterval = useRef(null)

  const loadRooms = async () => {
    try {
      const data = await getChatRooms()
      setRooms(data.rooms || [])
    } catch (error) {
      console.error('Failed to load chat rooms:', error)
    } finally {
      setLoadingRooms(false)
    }
  }

  const loadMessages = async (roomId, silent = false) => {
    if (!silent) setLoadingMessages(true)
    try {
      const data = await getAdminChatMessages(roomId)
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      if (!silent) setLoadingMessages(false)
    }
  }

  // Load chat rooms on mount
  useEffect(() => {
    loadRooms()
    
    // Poll rooms list every 10 seconds
    const interval = setInterval(loadRooms, 10000)
    return () => clearInterval(interval)
  }, [])

  // Poll active chat messages when a room is selected
  useEffect(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current)
    }

    if (selectedRoom) {
      loadMessages(selectedRoom._id)
      
      // Poll active chat room messages every 4 seconds
      pollingInterval.current = setInterval(() => {
        loadMessages(selectedRoom._id, true)
      }, 4000)
    } else {
      setMessages([])
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current)
      }
    }
  }, [selectedRoom])

  // Scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!selectedRoom || !newMessage.trim()) return

    setSending(true)
    const text = newMessage.trim()
    setNewMessage('')
    
    try {
      const res = await sendAdminChatMessage(selectedRoom._id, text)
      if (res.success && res.message) {
        setMessages(prev => [...prev, res.message])
      } else {
        loadMessages(selectedRoom._id, true)
      }
    } catch (error) {
      toast.error('Failed to send message')
      setNewMessage(text) // Restore input on error
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold dark:text-white">Active Chat Monitoring</h1>
        <p className="text-gray-500 text-sm mt-1 dark:text-gray-400">
          Monitor conversations between buyers and sellers. You can step in as admin to assist or resolve issues.
        </p>
      </div>

      <div className="flex-1 flex bg-white dark:bg-dark-bg rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden min-h-0">
        
        {/* Rooms Sidebar */}
        <div className="w-80 border-r border-gray-100 dark:border-gray-800 flex flex-col min-h-0">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 font-semibold dark:text-white text-sm">
            Conversations ({rooms.length})
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-850">
            {loadingRooms ? (
              <p className="p-4 text-sm text-gray-500">Loading chat rooms...</p>
            ) : rooms.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No active chat sessions.</p>
            ) : (
              rooms.map((room) => {
                const isActive = selectedRoom?._id === room._id
                const buyerName = room.buyerId?.name || 'Buyer'
                const sellerName = room.sellerId?.shopName || room.sellerId?.name || 'UBS Global Admin Panel'
                
                return (
                  <button
                    key={room._id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors flex flex-col gap-1.5 ${
                      isActive ? 'bg-blue-50/50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-baseline w-full">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white truncate max-w-[160px]">
                        {room.roomName || `${buyerName} x ${sellerName}`}
                      </span>
                      {room.lastMessageAt && (
                        <span className="text-[10px] text-gray-400">
                          {new Date(room.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      {room.botActive ? (
                        <span className="text-[9px] bg-blue-550/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-semibold">
                          🤖 AI Bot Active
                        </span>
                      ) : (
                        <span className="text-[9px] bg-green-550/10 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full font-semibold">
                          👨‍💼 Seller Active
                        </span>
                      )}
                    </div>
                    
                    {room.productId?.title && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">
                        🏷️ {room.productId.title}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {room.lastMessage || 'No messages yet.'}
                    </p>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat Conversation Logs Panel */}
        <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30 dark:bg-gray-950/20">
          {selectedRoom ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-bg flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedRoom.roomName || `${selectedRoom.buyerId?.name} × ${selectedRoom.sellerId?.shopName || 'UBS Global Admin Panel'}`}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Buyer: {selectedRoom.buyerId?.name} • Seller: {selectedRoom.sellerId?.shopName || 'UBS Global Admin Panel'}
                  </p>
                </div>
                {selectedRoom.productId && (
                  <div className="text-xs bg-gray-100 dark:bg-gray-800 py-1.5 px-3 rounded-lg flex items-center gap-2 max-w-xs">
                    {selectedRoom.productId.images && selectedRoom.productId.images[0] && (
                      <img
                        src={selectedRoom.productId.images[0]}
                        alt={selectedRoom.productId.title}
                        className="w-6 h-6 rounded object-cover"
                      />
                    )}
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                      {selectedRoom.productId.title}
                    </span>
                  </div>
                )}
              </div>

              {/* Message History list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
                {loadingMessages ? (
                  <p className="text-center text-sm text-gray-500 my-auto">Loading message history...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 my-auto">No messages recorded in this chat room.</p>
                ) : (
                  messages.map((msg) => {
                    const isFromAdmin = msg.senderType === 'admin'
                    const isFromSeller = msg.senderType === 'seller'
                    const isFromBot = msg.senderType === 'bot' || msg.isBot
                    
                    let bubbleClass = 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 self-start border border-gray-200 dark:border-gray-800'
                    let label = msg.senderName || 'Buyer'
                    
                    if (isFromAdmin) {
                      bubbleClass = 'bg-indigo-600 text-white self-end'
                      label = 'Admin Support'
                    } else if (isFromSeller) {
                      bubbleClass = 'bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-900 self-start'
                      label = msg.senderName || 'Seller'
                    } else if (isFromBot) {
                      bubbleClass = 'bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900 self-start'
                      label = '🤖 UBS AI Assistant'
                    }
                    
                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col max-w-[70%] ${isFromAdmin ? 'self-end' : 'self-start'}`}
                      >
                        <span className={`text-[10px] text-gray-400 mb-0.5 px-1 ${isFromAdmin ? 'text-right' : 'text-left'}`}>
                          {label}
                        </span>
                        
                        <div className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm ${bubbleClass}`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <span className={`text-[9px] block mt-1 text-right ${isFromAdmin ? 'text-indigo-200' : 'text-gray-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messageEndRef} />
              </div>

              {/* Message Input Panel */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white dark:bg-dark-bg border-t border-gray-100 dark:border-gray-800 flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Type an official admin message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm disabled:opacity-50 transition"
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center p-8 text-center my-auto">
              <span className="text-5xl mb-4">💬</span>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No Conversation Selected</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                Select an active buyer-seller connection from the sidebar list to inspect their real-time messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatMonitor
