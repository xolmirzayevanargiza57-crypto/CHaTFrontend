import React, { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VideoCall = ({ socket, friend, isReceiving, signal, onAnswer, onEnd }) => {
  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [iceSent, setIceSent] = useState(false);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const { user } = useAuth();

  useEffect(() => {
    // Media streamni faqat qo'ng'iroq boshlanganda yoki qabul qilinganda olamiz
    if (!isReceiving || callAccepted) {
      startMedia();
    }

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);
      if (connectionRef.current) {
        connectionRef.current.signal(signal);
      }
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
        socket.off('callAccepted');
        socket.off('iceCandidate');
        socket.off('endCall');
    };
  }, [callAccepted]);

  const startMedia = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
        if (!isReceiving) {
          callUser(currentStream);
        } else if (callAccepted) {
          answerCall(currentStream);
        }
      })
      .catch(err => {
          console.error("Media error:", err);
          alert("Kamera yoki mikrofonga ruxsat berilmadi");
          onEnd();
      });
  };

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
        name: user.firstName,
        avatar: user.avatar
      });
    });

    peer.on('stream', (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    connectionRef.current = peer;
  };

  const answerCall = (currentStream) => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: currentStream
    });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: friend._id });
    });

    peer.on('stream', (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.signal(signal);
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

  // Incoming Call View
  if (isReceiving && !callAccepted) {
    return (
      <div className="call-notification-overlay fade-in">
        <div className="call-card glass">
          <div className="caller-avatar">
            {friend.avatar ? <img src={friend.avatar} alt="avatar" /> : friend.firstName?.[0]}
          </div>
          <div className="caller-info">
            <h3>{friend.firstName} {friend.lastName}</h3>
            <p>Sizga video qo'ng'iroq qilmoqda...</p>
          </div>
          <div className="call-actions">
            <button className="call-btn decline" onClick={handleEndCall}>
              <PhoneOff size={24} />
            </button>
            <button className="call-btn accept" onClick={() => setCallAccepted(true)}>
              <Phone size={24} />
            </button>
          </div>
        </div>
        <style jsx="true">{`
          .call-notification-overlay {
            position: fixed;
            top: 2rem;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            width: 90%;
            max-width: 400px;
          }
          .call-card {
            padding: 1.5rem;
            border-radius: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.25rem;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            color: white;
            text-align: center;
          }
          .caller-avatar {
            width: 80px; height: 80px; border-radius: 28px;
            background: var(--accent); font-size: 2rem; font-weight: 800;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 30px rgba(135,116,225,0.5);
            animation: pulse 2s infinite;
          }
          .caller-avatar img { width: 100%; height: 100%; border-radius: 28px; object-fit: cover; }
          .call-actions { display: flex; gap: 2rem; width: 100%; justify-content: center; }
          .call-btn {
            width: 60px; height: 60px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            transition: transform 0.2s;
          }
          .call-btn:hover { transform: scale(1.1); }
          .call-btn.accept { background: #34c759; color: white; }
          .call-btn.decline { background: #ff3b30; color: white; }
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(135,116,225,0.4); }
            70% { box-shadow: 0 0 0 20px rgba(135,116,225,0); }
            100% { box-shadow: 0 0 0 0 rgba(135,116,225,0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="video-call-overlay fade-in">
      <div className="video-call-container glass">
        <div className="video-grid">
          <div className="video-wrapper remote">
            <video playsInline ref={userVideo} autoPlay />
            {!callAccepted && (
                <div className="calling-overlay">
                    <div className="call-avatar large">
                        {friend.avatar ? <img src={friend.avatar} alt="avatar" /> : friend.firstName?.[0]}
                    </div>
                    <h3>{friend.firstName}ga qo'ng'iroq qilinmoqda...</h3>
                    <div className="calling-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </div>
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
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(25px);
        }
        .video-call-container {
          width: 95%;
          max-width: 1100px;
          height: 85vh;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2.5rem;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 40px 100px rgba(0,0,0,0.6);
        }
        .video-grid { flex: 1; position: relative; background: #000; }
        .video-wrapper { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .video-wrapper video { width: 100%; height: 100%; object-fit: cover; }
        .video-wrapper.local {
          position: absolute; bottom: 2rem; right: 2rem;
          width: 260px; height: 180px; border-radius: 20px;
          overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          border: 2px solid rgba(255,255,255,0.2); z-index: 10;
        }
        .calling-overlay {
            position: absolute; inset: 0;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            background: rgba(0,0,0,0.7); color: white; gap: 1.5rem;
        }
        .call-avatar.large {
            width: 140px; height: 140px; border-radius: 48px;
            background: var(--accent); font-size: 4rem; font-weight: 800;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 50px rgba(135, 116, 225, 0.6);
            animation: pulse-large 2s infinite;
        }
        @keyframes pulse-large {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(135, 116, 225, 0.4); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 40px rgba(135, 116, 225, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(135, 116, 225, 0); }
        }
        .controls {
          padding: 2rem; display: flex; justify-content: center; gap: 1.5rem;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 20;
        }
        .control-btn {
          width: 65px; height: 65px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255, 255, 255, 0.1); color: white;
          transition: all 0.3s; backdrop-filter: blur(10px);
        }
        .control-btn:hover { background: rgba(255, 255, 255, 0.2); transform: translateY(-5px); }
        .control-btn.off { background: #ff3b30; }
        .control-btn.hangup { background: #ff3b30; width: 80px; border-radius: 22px; }

        .calling-dots span {
          display: inline-block; animation: dots 1.4s infinite; font-size: 3rem;
        }
        .calling-dots span:nth-child(2) { animation-delay: 0.2s; }
        .calling-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dots {
          0%, 20% { opacity: 0; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-10px); }
          100% { opacity: 0; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .video-call-container { width: 100%; height: 100%; border-radius: 0; }
          .video-wrapper.local { width: 140px; height: 210px; bottom: 120px; right: 1rem; }
          .controls { padding: 1.5rem 1rem 4rem; }
        }
      `}</style>
    </div>
  );
};

export default VideoCall;
