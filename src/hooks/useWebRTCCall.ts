import { useState, useRef, useCallback, useEffect } from 'react';
import { CallType, CallState, IncomingCallInfo, CallSignal } from '../types';
import { getSupabaseClient } from '../lib/supabase';

interface UseWebRTCCallReturn {
  callState: CallState;
  callType: CallType | null;
  remotePeerId: string | null;
  incomingCall: IncomingCallInfo | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  startCall: (targetId: string, targetName: string, targetAvatar: string, type: CallType) => void;
  acceptCall: () => void;
  declineCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

let globalChannel: ReturnType<ReturnType<typeof getSupabaseClient>['channel']> | null = null;
let globalPeerConnection: RTCPeerConnection | null = null;
let globalLocalStream: MediaStream | null = null;
let globalRemoteStream: MediaStream | null = null;
let currentCallType: CallType | null = null;
let currentRemotePeerId: string | null = null;
let currentRoomId: string | null = null;
let isIncomingCall: IncomingCallInfo | null = null;
let isMuted = false;
let isCameraOff = false;

// Callbacks for React state updates
let stateCallbacks: Array<() => void> = [];

function notifyAll() {
  stateCallbacks.forEach((cb) => cb());
}

function makeRoomId(userId: string, peerId: string): string {
  const sorted = [userId, peerId].sort();
  return `calls-${sorted[0]}-${sorted[1]}`;
}

async function getMediaStream(type: CallType): Promise<MediaStream> {
  if (globalLocalStream) return globalLocalStream;
  const constraints: MediaStreamConstraints = {
    audio: true,
    video: type === 'video' ? { facingMode: 'user' } : false,
  };
  globalLocalStream = await navigator.mediaDevices.getUserMedia(constraints);
  return globalLocalStream;
}

function createPeerConnection(): RTCPeerConnection {
  if (globalPeerConnection) {
    globalPeerConnection.close();
  }
  globalPeerConnection = new RTCPeerConnection(RTC_CONFIG);

  globalRemoteStream = new MediaStream();
  globalPeerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      globalRemoteStream!.addTrack(track);
    });
    notifyAll();
  };

  globalPeerConnection.onicecandidate = (event) => {
    if (event.candidate && currentRoomId) {
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.from('call_signals').insert({
          room_id: currentRoomId,
          sender_id: 'currentUser',
          receiver_id: currentRemotePeerId,
          signal_type: 'ice-candidate',
          signal_data: { candidate: event.candidate.toJSON() },
        });
      }
      // Also broadcast via realtime
      if (globalChannel) {
        globalChannel.send({
          type: 'broadcast',
          event: 'signal',
          payload: { type: 'ice-candidate', candidate: event.candidate.toJSON() },
        });
      }
    }
  };

  // Add local stream tracks
  if (globalLocalStream) {
    globalLocalStream.getTracks().forEach((track) => {
      globalPeerConnection!.addTrack(track, globalLocalStream!);
    });
  }

  return globalPeerConnection;
}

async function setupRealtimeChannel(roomId: string, userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  if (globalChannel) {
    supabase.removeChannel(globalChannel);
  }

  globalChannel = supabase.channel(roomId);

  globalChannel
    .on('broadcast', { event: 'signal' }, async (payload: { payload: { type: string; [key: string]: any } }) => {
      const signal = payload.payload;
      if (!globalPeerConnection) return;

      if (signal.type === 'offer' && currentRemotePeerId === null && currentCallType === null) {
        // Incoming call
        isIncomingCall = {
          callerId: signal.senderId,
          callerName: signal.callerName,
          callerAvatar: signal.callerAvatar,
          type: signal.callType,
          roomId,
        };
        currentRemotePeerId = signal.senderId;
        currentRoomId = roomId;
        notifyAll();
      } else if (signal.type === 'offer' && globalPeerConnection) {
        await globalPeerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        const answer = await globalPeerConnection.createAnswer();
        await globalPeerConnection.setLocalDescription(answer);
        globalChannel!.send({
          type: 'broadcast',
          event: 'signal',
          payload: { type: 'answer', sdp: answer },
        });
      } else if (signal.type === 'answer' && globalPeerConnection) {
        await globalPeerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      } else if (signal.type === 'ice-candidate' && globalPeerConnection) {
        await globalPeerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
      } else if (signal.type === 'call-end' || signal.type === 'call-decline') {
        cleanupCall();
        notifyAll();
      }
    })
    .subscribe();
}

function cleanupCall() {
  if (globalChannel) {
    const supabase = getSupabaseClient();
    if (supabase) supabase.removeChannel(globalChannel);
    globalChannel = null;
  }
  if (globalPeerConnection) {
    globalPeerConnection.close();
    globalPeerConnection = null;
  }
  if (globalLocalStream) {
    globalLocalStream.getTracks().forEach((t) => t.stop());
    globalLocalStream = null;
  }
  globalRemoteStream = null;
  currentCallType = null;
  currentRemotePeerId = null;
  currentRoomId = null;
  isIncomingCall = null;
  isMuted = false;
  isCameraOff = false;
}

export function useWebRTCCall(userId: string): UseWebRTCCallReturn {
  const [callState, setCallState] = useState<CallState>('idle');
  const [callType, setCallType] = useState<CallType | null>(null);
  const [remotePeerId, setRemotePeerId] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCallInfo | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  // Subscribe to state changes from the global module
  useEffect(() => {
    const updateState = () => {
      setCallState(isIncomingCall ? 'ringing' : currentCallType ? 'connected' : 'idle');
      setCallType(currentCallType);
      setRemotePeerId(currentRemotePeerId);
      setIncomingCall(isIncomingCall);
      setLocalStream(globalLocalStream);
      setRemoteStream(globalRemoteStream);
      setMuted(isMuted);
      setCameraOff(isCameraOff);
    };

    stateCallbacks.push(updateState);
    updateState();

    return () => {
      stateCallbacks = stateCallbacks.filter((cb) => cb !== updateState);
    };
  }, []);

  const startCall = useCallback(async (targetId: string, targetName: string, targetAvatar: string, type: CallType) => {
    try {
      currentCallType = type;
      currentRemotePeerId = targetId;
      const roomId = makeRoomId(userId, targetId);
      currentRoomId = roomId;

      await getMediaStream(type);
      const pc = createPeerConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await setupRealtimeChannel(roomId, userId);

      if (globalChannel) {
        globalChannel.send({
          type: 'broadcast',
          event: 'signal',
          payload: {
            type: 'offer',
            sdp: offer,
            senderId: userId,
            callerName: targetName, // We send our info for symmetry
            callerAvatar: targetAvatar,
            callType: type,
          },
        });
      }

      setCallState('calling');
      setCallType(type);
      setRemotePeerId(targetId);
      setLocalStream(globalLocalStream);
      notifyAll();
    } catch (err) {
      console.error('Failed to start call:', err);
      cleanupCall();
      setCallState('idle');
    }
  }, [userId]);

  const acceptCall = useCallback(async () => {
    if (!isIncomingCall) return;
    try {
      const type = isIncomingCall.type;
      currentCallType = type;
      currentRemotePeerId = isIncomingCall.callerId;
      currentRoomId = isIncomingCall.roomId;

      await getMediaStream(type);
      const pc = createPeerConnection();
      await setupRealtimeChannel(currentRoomId, userId);

      setCallState('connected');
      setCallType(type);
      setRemotePeerId(isIncomingCall.callerId);
      setLocalStream(globalLocalStream);
      setIncomingCall(null);
      notifyAll();
    } catch (err) {
      console.error('Failed to accept call:', err);
      cleanupCall();
    }
  }, [userId]);

  const declineCall = useCallback(() => {
    if (globalChannel && currentRoomId) {
      globalChannel.send({
        type: 'broadcast',
        event: 'signal',
        payload: { type: 'call-decline' },
      });
    }
    cleanupCall();
    setCallState('idle');
    setIncomingCall(null);
    notifyAll();
  }, []);

  const endCall = useCallback(() => {
    if (globalChannel && currentRoomId) {
      globalChannel.send({
        type: 'broadcast',
        event: 'signal',
        payload: { type: 'call-end' },
      });
    }
    cleanupCall();
    setCallState('ended');
    setTimeout(() => setCallState('idle'), 500);
    notifyAll();
  }, []);

  const toggleMute = useCallback(() => {
    if (globalLocalStream) {
      const audioTrack = globalLocalStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        isMuted = !audioTrack.enabled;
        setMuted(isMuted);
      }
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (globalLocalStream && currentCallType === 'video') {
      const videoTrack = globalLocalStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        isCameraOff = !videoTrack.enabled;
        setCameraOff(isCameraOff);
      }
    }
  }, []);

  return {
    callState,
    callType,
    remotePeerId,
    incomingCall,
    localStream,
    remoteStream,
    isMuted: muted,
    isCameraOff: cameraOff,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleCamera,
  };
}
