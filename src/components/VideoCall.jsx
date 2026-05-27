import React, { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VideoCall = ({ socket, friend, isReceiving, signal, onAnswer, onEnd }) => {
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(isReceiving);
  const [callerSignal, setCallerSignal] = useState(signal);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const { user } = useAuth();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }

        if (!isReceiving) {
          callUser(currentStream);
        }
      })
      .catch(err => console.error("Media error:", err));

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      connectionRef.current.signal(signal);
    });

    socket.on('iceCandidate', (candidate) => {
        if (connectionRef.current) {
            connectionRef.current.addStream(candidate);
        }
    });

    socket.on('endCall', () => {
        handleEndCall();
    });

    return () => {
        handleEndCall();
    };
  }, []);

  const callUser = (currentStream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: currentStream
    });

    peer.on('signal', (data) => {
      socket.emit('callUser', {
        userToCall: friend._id,
        signalData: data,
        from: user.id,
        name: user.firstName
      });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: friend._id });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
    if (onAnswer) onAnswer();
  };

  const handleEndCall = () => {
    setCallEnded(true);
    if (connectionRef.current) {
        connectionRef.current.destroy();
    }
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    socket.emit('endCall', { to: friend._id });
    if (onEnd) onEnd();
  };

  const toggleVideo = () => {
      if (stream) {
          stream.getVideoTracks()[0].enabled = !videoOn;
          setVideoOn(!videoOn);
      }
  };

  const toggleMic = () => {
      if (stream) {
          stream.getAudioTracks()[0].enabled = !micOn;
          setMicOn(!micOn);
      }
  };

  return (
    <div className="video-call-overlay">
      <div className="video-call-container glass">
        <div className="video-grid">
          <div className="video-wrapper remote">
            <video playsInline ref={userVideo} autoPlay />
            {!callAccepted && (
                <div className="calling-overlay">
                    <div className="call-avatar">
                        {friend.avatar ? <img src={friend.avatar} alt="avatar" /> : friend.firstName[0]}
                    </div>
                    <h3>{isReceiving ? `${friend.firstName} qo'ng'iroq qilmoqda...` : `${friend.firstName}ga qo'ng'iroq qilinmoqda...`}</h3>
                </div>
            )}
          </div>
          <div className="video-wrapper local">
            <video playsInline muted ref={myVideo} autoPlay />
          </div>
        </div>

        <div className="controls">
          <button className={`control-btn ${!micOn ? 'off' : ''}`} onClick={toggleMic}>
            {micOn ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
          
          {isReceiving && !callAccepted ? (
              <button className="control-btn answer" onClick={answerCall}>
                  <Phone size={24} />
              </button>
          ) : null}

          <button className={`control-btn ${!videoOn ? 'off' : ''}`} onClick={toggleVideo}>
            {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
          </button>

          <button className="control-btn hangup" onClick={handleEndCall}>
            <PhoneOff size={24} />
          </button>
        </div>
      </div>

      <style jsx="true">{`
        .video-call-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(20px);
        }
        .video-call-container {
          width: 90%;
          max-width: 1000px;
          height: 80vh;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2.5rem;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .video-grid {
          flex: 1;
          position: relative;
          background: #000;
        }
        .video-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .video-wrapper video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .video-wrapper.local {
          position: absolute;
          bottom: 2rem;
          right: 2rem;
          width: 240px;
          height: 160px;
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          border: 2px solid rgba(255,255,255,0.2);
          z-index: 10;
        }
        .calling-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.6);
            color: white;
            gap: 1.5rem;
        }
        .call-avatar {
            width: 120px;
            height: 120px;
            border-radius: 40px;
            background: var(--accent);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            font-weight: 800;
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.5);
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .controls {
          padding: 2rem;
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 20;
        }
        .control-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          transition: all 0.3s;
          backdrop-filter: blur(10px);
        }
        .control-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-5px);
        }
        .control-btn.off {
          background: #ff3b30;
        }
        .control-btn.hangup {
          background: #ff3b30;
          width: 70px;
          height: 60px;
          border-radius: 20px;
        }
        .control-btn.answer {
            background: #34c759;
            animation: bounce 1s infinite;
        }
        @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }

        @media (max-width: 768px) {
          .video-call-container {
            width: 100%;
            height: 100%;
            border-radius: 0;
          }
          .video-wrapper.local {
            width: 120px;
            height: 180px;
            bottom: 110px;
            right: 1rem;
          }
          .controls {
              padding: 1.5rem 1rem 3rem;
          }
        }
      `}</style>
    </div>
  );
};

export default VideoCall;
