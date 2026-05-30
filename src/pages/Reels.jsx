import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Heart, Music, Loader, Volume2, VolumeX, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import ShareModal from '../components/ShareModal';
import { translations } from '../i18n';

const formatCount = (count) => {
    if (count < 10000) return count;
    if (count < 1000000) return (count / 1000).toFixed(0) + 'k';
    return (count / 1000000).toFixed(1) + 'm';
};

const ReelItem = ({ post, user, onLike, onDelete, isMuted, onToggleMute, onShare }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    const videoRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && post.user && post.user.followers) {
            setIsFollowing(post.user.followers.includes(user.id));
        }
    }, [user, post.user]);

    useEffect(() => {
        if (!videoRef.current) return;

        const video = videoRef.current;

        // Try to play with sound on user interaction
        const tryPlay = () => {
            video.play().catch(() => {});
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        video.currentTime = 0;
                        video.play().catch(() => {});
                    } else {
                        video.pause();
                    }
                });
            },
            { threshold: 0.6 }
        );
        observer.observe(video);
        return () => observer.disconnect();
    }, []);

    // Sync muted state
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const handleDoubleTap = () => {
        if (!post.likes.includes(user.id)) onLike(post._id);
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
    };

    const isOwn = post.user._id === user.id;

    return (
        <div className="reel-slide">
            <video
                ref={videoRef}
                src={post.fileUrl}
                loop
                muted={isMuted}
                playsInline
                preload="auto"
                onClick={onToggleMute}
                onDoubleClick={handleDoubleTap}
            />
            {showHeart && (
                <div className="reel-heart-overlay">
                    <Heart size={80} fill="white" color="white" />
                </div>
            )}

            <div className="reel-overlay">
                {/* Right actions */}
                <div className="reel-sidebar-actions">
                    <div className="reel-action" onClick={() => onLike(post._id)}>
                        <Heart
                            size={28}
                            fill={post.likes.includes(user.id) ? "#ed4956" : "none"}
                            color={post.likes.includes(user.id) ? "#ed4956" : "white"}
                        />
                        <span>{formatCount(post.likes.length)}</span>
                    </div>
                    <div className="reel-action" onClick={() => onShare(post)}>
                        <Send size={28} color="white" />
                    </div>
                    <div className="reel-action" onClick={onToggleMute}>
                        {isMuted ? <VolumeX size={24} color="white" /> : <Volume2 size={24} color="white" />}
                    </div>
                    {isOwn && (
                        <div className="reel-action" onClick={() => setShowMenu(!showMenu)}>
                            <MoreHorizontal size={24} color="white" />
                            {showMenu && (
                                <div className="reel-menu">
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(post._id); setShowMenu(false); }}>
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom info */}
                <div className="reel-bottom-info">
                    <div className="reel-user" onClick={() => navigate(`/profile/${post.user._id}`)}>
                        <img
                            src={post.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user.username}`}
                            alt=""
                        />
                        <span className="reel-username">@{post.user.username}</span>
                        {!isOwn && (
                            <button
                                className={`reel-follow ${isFollowing ? 'following' : ''}`}
                                onClick={(e) => { e.stopPropagation(); handleFollow(); }}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>
                    <p className="reel-caption">{post.caption}</p>
                    <div className="reel-audio">
                        <Music size={12} />
                        <span>{post.user.username} · Original Audio</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Reels = () => {
    const { user, lang } = useAuth();
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalMuted, setGlobalMuted] = useState(false);
    const [sharingPost, setSharingPost] = useState(null);

    useEffect(() => { fetchReels(); }, []);

    const fetchReels = async () => {
        try {
            const res = await axios.get('/api/posts/feed');
            const data = res.data.filter(p => p.fileType === 'video');
            setReels(data.sort(() => Math.random() - 0.5));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleLike = async (postId) => {
        try {
            const res = await axios.post(`/api/posts/${postId}/like`);
            setReels(reels.map(p => p._id === postId
                ? { ...p, likes: res.data.hasLiked ? [...p.likes, user.id] : p.likes.filter(id => id !== user.id) }
                : p
            ));
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("Reelni o'chirishni istaysizmi?")) return;
        try {
            await axios.delete(`/api/posts/${postId}`);
            setReels(reels.filter(p => p._id !== postId));
        } catch (err) { console.error(err); }
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: 'white' }}>
            <Loader className="spin" />
        </div>
    );

    return (
        <div className="reels-page">
            <div className="reels-scroll">
                {reels.length === 0 ? (
                    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem', flexDirection: 'column', gap: 12 }}>
                        <Music size={48} opacity={0.5} />
                        <span>No Reels yet</span>
                    </div>
                ) : reels.map(reel => (
                    <ReelItem
                        key={reel._id}
                        post={reel}
                        user={user}
                        onLike={handleLike}
                        onDelete={handleDelete}
                        isMuted={globalMuted}
                        onToggleMute={() => setGlobalMuted(!globalMuted)}
                        onShare={setSharingPost}
                    />
                ))}
            </div>

            <BottomNav />
            {sharingPost && <ShareModal post={sharingPost} onClose={() => setSharingPost(null)} />}

            <style jsx="true">{`
                .reels-page {
                    background: #000;
                    height: 100vh;
                    overflow: hidden;
                    width: 100%;
                }
                .reels-scroll {
                    height: 100%;
                    overflow-y: scroll;
                    scroll-snap-type: y mandatory;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .reels-scroll::-webkit-scrollbar { display: none; }

                .reel-slide {
                    height: 100vh;
                    width: 100%;
                    max-width: 430px;
                    margin: 0 auto;
                    scroll-snap-align: start;
                    position: relative;
                    background: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .reel-slide video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    cursor: pointer;
                }

                .reel-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%);
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 20px 16px;
                    pointer-events: none;
                }
                .reel-overlay * { pointer-events: auto; }

                .reel-sidebar-actions {
                    position: absolute;
                    right: 12px;
                    bottom: 80px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 18px;
                    pointer-events: auto;
                }
                .reel-action {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    color: white;
                    cursor: pointer;
                    gap: 4px;
                    position: relative;
                }
                .reel-action span { font-size: 0.75rem; font-weight: 600; }

                .reel-menu {
                    position: absolute;
                    right: 36px;
                    bottom: 0;
                    background: rgba(30,30,30,0.95);
                    border-radius: 12px;
                    padding: 8px;
                    min-width: 120px;
                    z-index: 100;
                }
                .reel-menu button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #ff4444;
                    padding: 8px 12px;
                    width: 100%;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                }
                .reel-menu button:hover { background: rgba(255,255,255,0.1); }

                .reel-bottom-info {
                    color: white;
                    max-width: calc(100% - 60px);
                    padding-bottom: 16px;
                }
                .reel-user {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                    cursor: pointer;
                }
                .reel-user img {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: 2px solid white;
                    object-fit: cover;
                }
                .reel-username { font-weight: 700; font-size: 0.95rem; }
                .reel-follow {
                    font-size: 0.82rem;
                    font-weight: 600;
                    background: transparent;
                    border: 1.5px solid white !important;
                    color: white;
                    padding: 4px 14px;
                    border-radius: 6px;
                    margin-left: 4px;
                }
                .reel-follow.following {
                    background: rgba(255,255,255,0.2);
                    border-color: transparent !important;
                }
                .reel-caption {
                    font-size: 0.9rem;
                    margin-bottom: 8px;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .reel-audio {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.8rem;
                    opacity: 0.85;
                }

        
        .reel-heart-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 100;
            animation: heartPop 0.8s ease-out forwards;
            pointer-events: none;
        }
        @keyframes heartPop {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            15% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.9; }
            30% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            80% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1.1); opacity: 0; }
        }

        @media (max-width: 768px) {
                    .reel-slide { max-width: 100%; height: calc(100vh - 60px); }
                    .reel-slide video { object-fit: contain; background: #000; }
                }
            `}</style>
        </div>
    );
};

export default Reels;
