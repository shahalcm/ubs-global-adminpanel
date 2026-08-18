import React, { useState, useEffect, useRef } from 'react'
import api from '../../services/api'
import { getAdminSocket, setAvailability } from '../../services/socketService'
import { Phone, PhoneOff, Mic, MicOff, Volume2, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SupportCallManager() {
  const [availabilityState, setAvailabilityState] = useState(() => {
    return localStorage.getItem('supportAvailability') || 'AVAILABLE'
  })

  // Call status: 'idle', 'ringing', 'accepted', 'ended'
  const [callStatus, setCallStatus] = useState('idle')
  const [callData, setCallData] = useState(null) // { callId, channelId, callerId, callerName, callerRole }
  
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)

  const peerConnectionRef = useRef(null)
  const localStreamRef = useRef(null)
  const audioRef = useRef(null)
  const timerRef = useRef(null)
  const socketRef = useRef(null)

  // Sync availability state with backend on socket connections
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

    // 1. Incoming support call
    socket.on('support-call:incoming', (data) => {
      if (callStatus !== 'idle') {
        // Automatically decline if busy
        socket.emit('support-call:reject', { callId: data.callId })
        return
      }

      setCallData(data)
      setCallStatus('ringing')
      toast.success(`Incoming call from ${data.callerName} (${data.callerRole})!`, { duration: 5000 })
    })

    // 2. Caller cancelled call
    socket.on('support-call:cancelled', () => {
      toast.error('Caller cancelled the call')
      cleanUpCall()
    })

    // 3. Signaling timeout
    socket.on('support-call:timeout', () => {
      toast.error('Support call missed (timeout)')
      cleanUpCall()
    })

    // 4. SDP Offer from caller
    socket.on('support-call:offer', async (data) => {
      try {
        console.log('WebRTC: Received SDP offer from caller')
        await initPeerConnection(data.offer)
      } catch (err) {
        console.error('Failed to answer offer:', err)
        handleEndCall()
      }
    })

    // 5. ICE Candidate relays
    socket.on('support-call:ice-candidate', async (data) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate))
        }
      } catch (err) {
        console.error('Failed to add remote ICE candidate:', err)
      }
    })

    // 6. Call ended by peer
    socket.on('support-call:ended', () => {
      toast.error('Call ended by user')
      cleanUpCall()
    })

    return () => {
      socket.off('support-call:incoming')
      socket.off('support-call:cancelled')
      socket.off('support-call:timeout')
      socket.off('support-call:offer')
      socket.off('support-call:ice-candidate')
      socket.off('support-call:ended')
    }
  }, [callStatus])

  // Timer logic
  useEffect(() => {
    if (callStatus === 'accepted') {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
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

  // Initialize WebRTC connection responder
  const initPeerConnection = async (sdpOffer) => {
    const pcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    }

    const pc = new RTCPeerConnection(pcConfig)
    peerConnectionRef.current = pc

    // Bind ICE candidates handler
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && callData) {
        socketRef.current.emit('support-call:ice-candidate', {
          callId: callData.callId,
          candidate: event.candidate
        })
      }
    }

    // Bind incoming remote audio tracks
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0] && audioRef.current) {
        audioRef.current.srcObject = event.streams[0]
      }
    }

    // Capture microphone input
    let localStream
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      })
      localStreamRef.current = localStream
    } catch (err) {
      toast.error('Microphone permission is required to answer the support call.')
      throw err
    }

    // Add local mic track to peer connection
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream)
    })

    // Set remote offer & generate response answer
    await pc.setRemoteDescription(new RTCSessionDescription(sdpOffer))
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    // Emit Answer back to user
    if (socketRef.current && callData) {
      socketRef.current.emit('support-call:answer', {
        callId: callData.callId,
        answer
      })
    }
  }

  // Accept call action
  const handleAcceptCall = async () => {
    if (!callData) return
    try {
      const socket = getAdminSocket()
      const res = await api.post(`/support-calls/${callData.callId}/accept`, {
        socketId: socket?.id
      })

      if (res.data && res.data.success) {
        setCallStatus('accepted')
        toast.success('Support call connected!')
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to accept call')
      cleanUpCall()
    }
  }

  // Reject call action
  const handleRejectCall = async () => {
    if (!callData) return
    try {
      await api.post(`/support-calls/${callData.callId}/reject`)
      toast.error('Call rejected')
    } catch (err) {
      console.error(err)
    } finally {
      cleanUpCall()
    }
  }

  // End active call
  const handleEndCall = async () => {
    if (!callData) {
      cleanUpCall()
      return
    }
    try {
      if (socketRef.current) {
        socketRef.current.emit('support-call:end', { callId: callData.callId })
      }
      await api.post(`/support-calls/${callData.callId}/end`, { endedBy: 'receiver' })
      toast.success('Call ended successfully')
    } catch (err) {
      console.error(err)
    } finally {
      cleanUpCall()
    }
  }

  // Clean up all media & connection states
  const cleanUpCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.srcObject = null
    }
    setCallStatus('idle')
    setCallData(null)
    setIsMuted(false)
    
    // Set availability back to default config status
    setAvailabilityState(availabilityState)
    setAvailability(availabilityState)
  }

  // Mute microphone
  const handleToggleMute = () => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted
      })
    }
  }

  // Format timer duration
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
          className={`text-xs font-bold rounded-lg px-2 py-1 outline-none border ${
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
      {callStatus === 'ringing' && callData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-dark-card rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-850 flex flex-col items-center text-center animate-bounce-short">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Phone className="text-primary animate-wiggle" size={28} />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Incoming Support Call</h3>
            <p className="text-2xl font-black text-gray-850 dark:text-gray-100 mt-2">{callData.callerName}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 bg-gray-100 dark:bg-dark-bg px-2.5 py-1 rounded-full">
              {callData.callerRole}
            </p>

            <div className="flex gap-4 w-full mt-8">
              <button
                onClick={handleRejectCall}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-md transition-colors"
              >
                Reject
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

      {/* 2. Active Call UI Overlay Panel */}
      {callStatus === 'accepted' && callData && (
        <div className="fixed bottom-24 right-6 z-50 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 w-80 rounded-3xl p-6 shadow-2xl animate-fade-in flex flex-col items-center">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
            <Volume2 className="text-emerald-500" size={22} />
          </div>
          
          <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Connected Call
          </h4>
          
          <p className="text-lg font-extrabold text-gray-950 dark:text-white mt-1">{callData.callerName}</p>
          <p className="text-xs text-gray-500">{callData.callerRole?.toUpperCase()}</p>
          
          <p className="text-3xl font-mono font-bold text-gray-800 dark:text-gray-100 mt-4">
            {formatTime(duration)}
          </p>

          <div className="flex items-center gap-6 mt-6 w-full justify-center">
            <button
              onClick={handleToggleMute}
              className={`p-3.5 rounded-full shadow-md transition-colors ${
                isMuted
                  ? 'bg-rose-550 hover:bg-rose-600 text-white'
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
