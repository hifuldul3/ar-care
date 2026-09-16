export class WebRTCManager {
  constructor(wsService, onRemoteStream) {
    this.wsService = wsService;
    this.onRemoteStream = onRemoteStream;
    this.peerConnection = null;
    this.localStream = null;
    this.isInitiator = false;

    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }

  async init(localStream, isInitiator = false) {
    this.localStream = localStream;
    this.isInitiator = isInitiator;

    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    this.peerConnection.ontrack = (event) => {
      if (this.onRemoteStream && event.streams[0]) {
        this.onRemoteStream(event.streams[0]);
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.wsService.send({
          type: 'WEBRTC_ICE_CANDIDATE',
          candidate: event.candidate
        });
      }
    };

    if (this.isInitiator) {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.wsService.send({
        type: 'WEBRTC_OFFER',
        offer: offer
      });
    }
  }

  async handleSignal(data) {
    if (!this.peerConnection) return;

    if (data.type === 'WEBRTC_OFFER') {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.wsService.send({
        type: 'WEBRTC_ANSWER',
        answer: answer
      });
    } else if (data.type === 'WEBRTC_ANSWER') {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.type === 'WEBRTC_ICE_CANDIDATE' && data.candidate) {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }

  close() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}
