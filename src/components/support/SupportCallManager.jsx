import React, { useState, useEffect, useRef } from 'react'
import api from '../../services/api'
import { getAdminSocket, setAvailability } from '../../services/socketService'
import webrtcService from '../../services/webrtcService'
import { Phone, PhoneOff, Mic, MicOff, Volume2, ShieldAlert, PhoneCall } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SupportCallManager() {
  const [availabilityState, setAvailabilityState] = useState(() => {
    return localStorage.getItem('supportAvailability') || 'AVAILABLE'
  })

  // Call status: 'idle' | 'connecting' | 'ringing' | 'accepted' | 'ended'
  const [callStatus, setCallStatus] = useState('idle')
  const [callData, setCallData] = useState(null) // { callId, channelId, callerId, callerName, callerAvatar, callerType, targetId, isOutgoing }

  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)

  const audioRef = useRef(null)
  const timerRef = useRef(null)
  const socketRef = useRef(null)
  const callDataRef = useRef(null)

  useEffect(() => {
    callDataRef.current = callData
  }, [callData])

  // Sync availability state with backend
  useEffect(() => {
    const socket = getAdminSocket()
    if (socket) {
      socketRef.current = socket
      socket.emit('support-call:set-availability', { status: availabilityState })
    }
  }, [availabilityState])

  // Listen for socket events
  useEffect(() => {
    const socket = getAdminSocket()
    if (!socket) return
    socketRef.current = socket

    // 1. Incoming Call
    const handleIncomingCall = (data) => {
      console.log('[Incoming Call Event]', data)
      if (callStatus !== 'idle') {
        socket.emit('reject-call', { callId: data.callId, targetId: data.callerId, reason: 'busy' })
        return
      }

      setCallData({
        ...data,
        targetId: data.callerId,
        isOutgoing: false
      })
      setCallStatus('ringing')
      toast.success(`Incoming call from ${data.callerName || 'User'}!`, { duration: 5000 })
    }
    socket.on('incoming-call', handleIncomingCall)
    socket.on('support-call:incoming', handleIncomingCall)

    // 2. Call Ringing Notification for Outgoing Call
    socket.on('call-ringing', (data) => {
      console.log('[Call Ringing Event]', data)
      if (callStatus === 'connecting') {
        setCallStatus('ringing')
      }
    })

    // 3. Call Accepted by Peer
    const handleCallAccepted = async (data) => {
      console.log('[Call Accepted Event]', data)
      setCallStatus('accepted')
      toast.success('Call connected!')
    }
    socket.on('accept-call', handleCallAccepted)
    socket.on('support-call:accepted', handleCallAccepted)

    // 4. SDP Offer from Peer
    const handleOffer = async (data) => {
      console.log('[Offer Received Event]', data)
      try {
        await webrtcService.setupLocalStream()
        webrtcService.createPeerConnection()

        webrtcService.onIceCandidateCallback = (candidate) => {
          socket.emit('ice-candidate', {
            callId: data.callId,
            targetId: data.senderId || callDataRef.current?.targetId,
            candidate
          })
        }

        webrtcService.onTrackCallback = (stream) => {
          if (audioRef.current) {
            audioRef.current.srcObject = stream
          }
        }

        const answer = await webrtcService.createAnswer(data.offer)
        socket.emit('answer', {
          callId: data.callId,
          targetId: data.senderId || callDataRef.current?.targetId,
          answer
        })
      } catch (err) {
        console.error('[WebRTC Offer Processing Failed]', err)
        handleEndCall()
      }
    }
    socket.on('offer', handleOffer)
    socket.on('support-call:offer', handleOffer)

    // 5. SDP Answer from Peer
    const handleAnswer = async (data) => {
      console.log('[Answer Received Event]', data)
      try {
        await webrtcService.setAnswer(data.answer)
        setCallStatus('accepted')
      } catch (err) {
        console.error('[WebRTC Answer Processing Failed]', err)
        handleEndCall()
      }
    }
    socket.on('answer', handleAnswer)
    socket.on('support-call:answer', handleAnswer)

    // 6. ICE Candidate from Peer
    const handleIceCandidate = async (data) => {
      await webrtcService.addIceCandidate(data.candidate)
    }
    socket.on('ice-candidate', handleIceCandidate)
    socket.on('support-call:ice-candidate', handleIceCandidate)

    // 7. Call Rejected
    const handleCallRejected = (data) => {
      console.log('[Call Rejected Event]', data)
      toast.error(data.message || 'Call was declined by user.')
      cleanUpCall()
    }
    socket.on('call-rejected', handleCallRejected)
    socket.on('support-call:rejected', handleCallRejected)

    // 8. Call Timeout
    const handleCallTimeout = () => {
      console.log('[Call Timeout Event]')
      toast.error('Call timed out (No answer)')
      cleanUpCall()
    }
    socket.on('call-timeout', handleCallTimeout)
    socket.on('support-call:timeout', handleCallTimeout)

    // 9. Call Ended by Peer
    const handleCallEnded = () => {
      console.log('[Call Ended Event]')
      toast.error('Call ended by remote user')
      cleanUpCall()
    }
    socket.on('call-ended', handleCallEnded)
    socket.on('support-call:ended', handleCallEnded)

    // 10. Global Custom Window Event for Admin Outgoing Calls
    const handleInitiateAdminCall = async (e) => {
      const { user } = e.detail
      if (!user || !user._id) return

      try {
        console.log('[Initiating Outgoing Call from Admin]', user)
        setCallStatus('connecting')
        setCallData({
          callId: null,
          channelId: null,
          targetId: user._id,
          callerName: user.name,
          callerAvatar: user.avatar,
          callerType: 'user',
          isOutgoing: true
        })

        await webrtcService.setupLocalStream()
        webrtcService.createPeerConnection()

        webrtcService.onTrackCallback = (stream) => {
          if (audioRef.current) {
            audioRef.current.srcObject = stream
          }
        }

        // Call API
        const res = await api.post('/calls/initiate', {
          receiverId: user._id,
          receiverType: user.role === 'seller' ? 'seller' : 'user'
        })

        if (res.data && res.data.success) {
          const call = res.data.call
          setCallData((prev) => ({
            ...prev,
            callId: call._id,
            channelId: call.channelId
          }))

          webrtcService.onIceCandidateCallback = (candidate) => {
            socket.emit('ice-candidate', {
              callId: call._id,
              targetId: user._id,
              candidate
            })
          }

          // Emit call-user socket event
          socket.emit('call-user', {
            receiverId: user._id,
            receiverType: user.role === 'seller' ? 'seller' : 'user',
            callerName: 'UBS Admin',
            channelId: call.channelId
          })

          // Generate Offer and Emit
          const offer = await webrtcService.createOffer()
          socket.emit('offer', {
            callId: call._id,
            targetId: user._id,
            offer
          })

          setCallStatus('ringing')
        }
      } catch (err) {
        console.error('[Outgoing Call Initiate Error]', err)
        toast.error(err.response?.data?.message || err.message || 'Failed to initiate call')
        cleanUpCall()
      }
    }

    window.addEventListener('admin:initiate-call', handleInitiateAdminCall)

    return () => {
      socket.off('incoming-call', handleIncomingCall)
      socket.off('support-call:incoming', handleIncomingCall)
      socket.off('call-ringing')
      socket.off('accept-call', handleCallAccepted)
      socket.off('support-call:accepted', handleCallAccepted)
      socket.off('offer', handleOffer)
      socket.off('support-call:offer', handleOffer)
      socket.off('answer', handleAnswer)
      socket.off('support-call:answer', handleAnswer)
      socket.off('ice-candidate', handleIceCandidate)
      socket.off('support-call:ice-candidate', handleIceCandidate)
      socket.off('call-rejected', handleCallRejected)
      socket.off('support-call:rejected', handleCallRejected)
      socket.off('call-timeout', handleCallTimeout)
      socket.off('support-call:timeout', handleCallTimeout)
      socket.off('call-ended', handleCallEnded)
      socket.off('support-call:ended', handleCallEnded)
      window.removeEventListener('admin:initiate-call', handleInitiateAdminCall)
    }
  }, [callStatus])

  // Timer logic for connected calls
  useEffect(() => {
    if (callStatus === 'accepted') {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setDuration(0)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [callStatus])

  // Accept incoming call action
  const handleAcceptCall = async () => {
    if (!callData) return
    try {
      await webrtcService.setupLocalStream()
      webrtcService.createPeerConnection()

      webrtcService.onIceCandidateCallback = (candidate) => {
        if (socketRef.current) {
          socketRef.current.emit('ice-candidate', {
            callId: callData.callId,
            targetId: callData.targetId,
            candidate
          })
        }
      }

      webrtcService.onTrackCallback = (stream) => {
        if (audioRef.current) {
          audioRef.current.srcObject = stream
        }
      }

      if (socketRef.current) {
        socketRef.current.emit('accept-call', {
          callId: callData.callId,
          targetId: callData.targetId
        })
      }

      setCallStatus('accepted')
      toast.success('Call accepted!')
    } catch (err) {
      console.error('[Accept Call Error]', err)
      toast.error('Microphone permission required to answer call')
      cleanUpCall()
    }
  }

  // Reject call action
  const handleRejectCall = () => {
    if (callData && socketRef.current) {
      socketRef.current.emit('reject-call', {
        callId: callData.callId,
        targetId: callData.targetId,
        reason: 'rejected'
      })
    }
    cleanUpCall()
  }

  // End active call action
  const handleEndCall = () => {
    if (callData && socketRef.current) {
      socketRef.current.emit('end-call', {
        callId: callData.callId,
        targetId: callData.targetId,
        endedBy: 'admin'
      })
    }
    cleanUpCall()
  }

  // Clean up all states and audio
  const cleanUpCall = () => {
    webrtcService.cleanUp()
    if (audioRef.current) {
      audioRef.current.srcObject = null
    }
    setCallStatus('idle')
    setCallData(null)
    setIsMuted(false)
    setAvailabilityState(availabilityState)
    setAvailability(availabilityState)
  }

  // Toggle microphone mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    webrtcService.toggleMute(nextMuted)
  }

  // Format call duration timer
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <>
      <audio ref={audioRef} autoPlay />

      {/* Floating Availability Control Bar */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 px-4 py-2.5 rounded-2xl shadow-lg">
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Support Calls:</span>
        <select
          value={availabilityState}
          onChange={(e) => {
            const val = e.target.value
            setAvailabilityState(val)
            localStorage.setItem('supportAvailability', val)
          }}
          className={`text-xs font-bold rounded-lg px-2 py-1 outline-none border cursor-pointer ${
            availabilityState === 'AVAILABLE'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900'
              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900'
          }`}
        >
          <option value="AVAILABLE">Available</option>
          <option value="BUSY">Busy / DND</option>
        </select>
      </div>

      {/* 1. Incoming Call Modal Alert */}
      {callStatus === 'ringing' && callData && !callData.isOutgoing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-dark-card rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-850 flex flex-col items-center text-center animate-bounce-short">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Phone className="text-primary animate-wiggle" size={28} />
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Incoming Support Call</h3>
            <p className="text-2xl font-black text-gray-850 dark:text-gray-100 mt-2">{callData.callerName || 'User'}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 bg-gray-100 dark:bg-dark-bg px-2.5 py-1 rounded-full">
              {callData.callerType || 'User'}
            </p>

            <div className="flex gap-4 w-full mt-8">
              <button
                onClick={handleRejectCall}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-md transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAcceptCall}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Outgoing Call Screen Overlay */}
      {(callStatus === 'connecting' || (callStatus === 'ringing' && callData?.isOutgoing)) && callData && (
        <div className="fixed bottom-24 right-6 z-50 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 w-80 rounded-3xl p-6 shadow-2xl animate-fade-in flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 animate-pulse">
            <PhoneCall className="text-primary animate-wiggle" size={28} />
          </div>

          <h4 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            {callStatus === 'connecting' ? 'Connecting Call...' : 'Ringing...'}
          </h4>

          <p className="text-lg font-extrabold text-gray-950 dark:text-white mt-1">{callData.callerName}</p>
          <p className="text-xs text-gray-500">{callData.callerType?.toUpperCase()}</p>

          <button
            onClick={handleEndCall}
            className="mt-6 p-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition-colors flex items-center gap-2 px-6 font-bold"
          >
            <PhoneOff size={18} /> End Call
          </button>
        </div>
      )}

      {/* 3. Active Call UI Overlay Panel */}
      {callStatus === 'accepted' && callData && (
        <div className="fixed bottom-24 right-6 z-50 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 w-80 rounded-3xl p-6 shadow-2xl animate-fade-in flex flex-col items-center">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
            <Volume2 className="text-emerald-500 animate-pulse" size={22} />
          </div>

          <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Call Active
          </h4>

          <p className="text-lg font-extrabold text-gray-950 dark:text-white mt-1">{callData.callerName}</p>
          <p className="text-xs text-gray-500">{callData.callerType?.toUpperCase()}</p>

          <p className="text-3xl font-mono font-bold text-gray-800 dark:text-gray-100 mt-4">
            {formatTime(duration)}
          </p>

          <div className="flex items-center gap-6 mt-6 w-full justify-center">
            <button
              onClick={handleToggleMute}
              className={`p-3.5 rounded-full shadow-md transition-colors ${
                isMuted
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button
              onClick={handleEndCall}
              className="p-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition-colors"
              title="Hang Up"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
