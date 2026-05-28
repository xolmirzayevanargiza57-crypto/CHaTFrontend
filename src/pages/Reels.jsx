import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import BottomNav from '../components/BottomNav';
import { Heart, MessageCircle, Send, Music, Loader, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReelItem = ({ post, user, onLike }) => {
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        videoRef.current.play().catch(e => console.log("Autoplay blocked"));
                    } else {
                        videoRef.current.pause();
                    }
                });
            },
            { threshold: 0.7 }
        );

        if (videoRef.current) observer.observe(videoRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="reel-video-container">
            <video 
                ref={videoRef} 
                src={post.fileUrl} 
                loop 
                muted={isMuted}
                onClick={() => setIsMuted(!isMuted)}
                playsInline
            />
            
            <div className="reel-overlay">
                <div className="reel-sidebar">
                    <div className="action-item" onClick={() => onLike(post._id)}>
                        <Heart size={32} fill={post.likes.includes(user.id) ? "#ff3b30" : "none"} color={post.likes.includes(user.id) ? "#ff3b30" : "white"} />
                        <span>{post.likes.length}</span>
                    </div>
                    <div className="action-item">
                        <MessageCircle size={32} color="white" />
                        <span>{post.comments.length}</span>
                    </div>
                    <div className="action-item">
                        <Send size={30} color="white" />
                    </div>
                    <div className="action-item" onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? <VolumeX size={26} color="white" /> : <Volume2 size={26} color="white" />}
                    </div>
                </div>

                <div className="reel-info">
                    <div className="user-info">
                        <img src={post.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user.username}`} alt="u" />
                        <h3>{post.user.username}</h3>
                        <button className="follow-badge">Follow</button>
                    </div>
                    <p className="caption">{post.caption}</p>
                    <div className="audio-info">
                        <Music size={14} />
                        <span>{post.user.username} • Original Audio</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Reels = () => {
    const { user, lang } = useAuth();
    const t = translations[lang];
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReels();
    }, []);

    const fetchReels = async () => {
        try {
            const res = await axios.get('/api/posts/feed');
            setReels(res.data.filter(p => p.fileType === 'video'));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleLike = async (postId) => {
        try {
            const res = await axios.post(`/api/posts/${postId}/like`);
            setReels(reels.map(p => p._id === postId ? { ...p, likes: res.data.hasLiked ? [...p.likes, user.id] : p.likes.filter(id => id !== user.id) } : p));
        } catch (err) { console.error(err); }
    };

    if (loading) return <div className="reels-loading"><Loader className="spin" /></div>;

    return (
        <div className="reels-page">
            <div className="reels-container">
                {reels.map(reel => (
                    <ReelItem key={reel._id} post={reel} user={user} onLike={handleLike} />
                ))}
                {reels.length === 0 && <div className="no-reels">No Reels Available</div>}
            </div>
            
            <BottomNav />

            <style jsx="true">{`
                .reels-page { background: #000; height: 100vh; width: 100vw; position: fixed; inset: 0; z-index: 2000; }
                .reels-container { height: 100%; overflow-y: scroll; scroll-snap-type: y mandatory; scrollbar-width: none; }
                .reels-container::-webkit-scrollbar { display: none; }
                
                .reel-video-container { height: 100vh; width: 100%; scroll-snap-align: start; position: relative; background: #000; display: flex; align-items: center; justify-content: center; }
                video { width: 100%; height: 100%; object-fit: contain; }
                
                .reel-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%, transparent 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 20px 20px 100px; pointer-events: none; }
                .reel-overlay * { pointer-events: auto; }
                
                .reel-sidebar { position: absolute; right: 15px; bottom: 120px; display: flex; flex-direction: column; align-items: center; gap: 20px; z-index: 10; }
                .action-item { display: flex; flex-direction: column; align-items: center; color: white; cursor: pointer; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
                .action-item span { font-size: 0.8rem; font-weight: 600; margin-top: 4px; }
                
                .reel-info { color: white; max-width: 80%; }
                .user-info { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
                .user-info img { width: 34px; height: 34px; border-radius: 50%; border: 1px solid white; object-fit: cover; }
                .user-info h3 { font-size: 0.95rem; font-weight: 800; margin: 0; }
                .follow-badge { font-size: 0.8rem; font-weight: 700; background: transparent; border: 1px solid white !important; color: white; padding: 2px 10px; border-radius: 6px; }
                
                .caption { font-size: 0.9rem; margin-bottom: 10px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
                .audio-info { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
                
                .reels-loading { height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; color: white; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                .no-reels { height: 100vh; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; font-weight: 700; }
            `}</style>
        </div>
    );
};

export default Reels;
