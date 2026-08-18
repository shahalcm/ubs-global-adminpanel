import toast from 'react-hot-toast'

const getIceServers = () => {
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]

  if (import.meta.env.VITE_TURN_SERVER_URL) {
    iceServers.push({
      urls: import.meta.env.VITE_TURN_SERVER_URL,
      username: import.meta.env.VITE_TURN_USERNAME || '',
      credential: import.meta.env.VITE_TURN_PASSWORD || ''
    })
  }

  return iceServers
}

class AdminWebRTCService {
  constructor() {
    this.peerConnection = null
    this.localStream = null
    this.remoteStream = null
    this.iceCandidateQueue = []
    this.onIceCandidateCallback = null
    this.onTrackCallback = null
    this.onConnectionStateChangeCallback = null
  }

  // Request browser microphone permission & setup local stream
  async setupLocalStream() {
    try {
      if (this.localStream) {
        return this.localStream
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access is not supported by your browser.')
      }

      console.log('[Admin WebRTC] Requesting microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      })

      this.localStream = stream
      console.log('[Admin WebRTC] Microphone access granted successfully')
      return stream
    } catch (error) {
      console.error('[Admin WebRTC] Microphone permission denied or error:', error)
      toast.error('Microphone permission is required for audio calling. Please check browser settings.')
      throw error
    }
  }

  // Create RTCPeerConnection with candidate queueing
  createPeerConnection() {
    this.cleanUp()

    const pcConfig = {
      iceServers: getIceServers()
    }

    console.log('[Admin WebRTC] Creating RTCPeerConnection with STUN/TURN servers:', pcConfig.iceServers)
    this.peerConnection = new RTCPeerConnection(pcConfig)
    this.iceCandidateQueue = []

    // Attach local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream)
      })
    }

    // ICE candidate discovery
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[ICE Candidate Sent]', event.candidate.candidate)
        if (this.onIceCandidateCallback) {
          this.onIceCandidateCallback(event.candidate)
        }
      }
    }

    // Remote audio track received
    this.peerConnection.ontrack = (event) => {
      console.log('[Admin WebRTC] Remote audio track received:', event.streams)
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0]
        if (this.onTrackCallback) {
          this.onTrackCallback(this.remoteStream)
        }
      }
    }

    // Connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState
      console.log('[Admin WebRTC Connection State]', state)
      if (this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback(state)
      }
    }

    return this.peerConnection
  }

  // Create SDP Offer (Outgoing call)
  async createOffer() {
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection is not initialized')
      }
      console.log('[Offer Sent] Generating local SDP offer...')
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      })
      await this.peerConnection.setLocalDescription(offer)
      return offer
    } catch (error) {
      console.error('[Admin WebRTC] createOffer error:', error)
      throw error
    }
  }

  // Process Remote Offer & Create Answer (Incoming call)
  async createAnswer(remoteOffer) {
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection is not initialized')
      }
      console.log('[Offer Received] Setting remote description offer...')
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(remoteOffer))

      // Flush buffered ICE candidates
      await this.flushIceCandidateQueue()

      console.log('[Answer Sent] Generating SDP answer...')
      const answer = await this.peerConnection.createAnswer()
      await this.peerConnection.setLocalDescription(answer)
      return answer
    } catch (error) {
      console.error('[Admin WebRTC] createAnswer error:', error)
      throw error
    }
  }

  // Set Remote Answer (Outgoing call response)
  async setAnswer(remoteAnswer) {
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection is not initialized')
      }
      console.log('[Answer Received] Setting remote description answer...')
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(remoteAnswer))

      // Flush buffered ICE candidates
      await this.flushIceCandidateQueue()
    } catch (error) {
      console.error('[Admin WebRTC] setAnswer error:', error)
      throw error
    }
  }

  // Add Remote ICE Candidate with Queuing Support
  async addIceCandidate(candidate) {
    if (!candidate) return

    try {
      if (this.peerConnection && this.peerConnection.remoteDescription && this.peerConnection.remoteDescription.type) {
        console.log('[ICE Candidate Received] Adding candidate immediately')
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      } else {
        console.log('[ICE Candidate Received] Remote description not set yet. Queueing candidate...')
        this.iceCandidateQueue.push(candidate)
      }
    } catch (error) {
      console.error('[Admin WebRTC] addIceCandidate error:', error)
    }
  }

  // Flush queued ICE candidates after remoteDescription is set
  async flushIceCandidateQueue() {
    if (this.iceCandidateQueue.length > 0 && this.peerConnection) {
      console.log(`[Admin WebRTC] Flushing ${this.iceCandidateQueue.length} queued ICE candidates...`)
      while (this.iceCandidateQueue.length > 0) {
        const cand = this.iceCandidateQueue.shift()
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(cand))
        } catch (e) {
          console.error('[Admin WebRTC] Error applying queued candidate:', e)
        }
      }
    }
  }

  // Toggle microphone mute state
  toggleMute(isMuted) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted
      })
      console.log(`[Admin WebRTC] Microphone track mute set to: ${isMuted}`)
    }
  }

  // Reset and clean up all WebRTC media streams
  cleanUp() {
    console.log('[Admin WebRTC] Cleaning up peer connection and streams...')
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }

    this.remoteStream = null
    this.iceCandidateQueue = []
    this.onIceCandidateCallback = null
    this.onTrackCallback = null
    this.onConnectionStateChangeCallback = null
  }
}

export default new AdminWebRTCService()
