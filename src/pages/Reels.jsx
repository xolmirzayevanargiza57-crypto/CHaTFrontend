import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Heart, Music, Loader, Volume2, VolumeX, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2, Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ShareModal from '../components/ShareModal';
import { getSocket } from '../utils/socket';
import { formatCount } from '../utils/formatters';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://chatbackend-o1i2.onrender.com';

const ReelItem = ({ post, user, onLike, onDelete, isMuted, onToggleMute, onShare, savedPostIds, onSaveChange }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [comments, setComments] = useState(post.comments || []);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [commentLoading, setCommentLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(savedPostIds?.includes(post._id) || false);
    const [hasCountedView, setHasCountedView] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const watchTimer = useRef(null);
    const videoRef = useRef(null);
    const navigate = useNavigate();

    // Get full video URL
    const getVideoUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        if (url.startsWith('/api/')) {
            return `${BACKEND_URL}${url}`;
        }
        if (post.fileId) {
            return `${BACKEND_URL}/api/upload/file/${post.fileId}`;
        }
        return url;
    };

    useEffect(() => {
        if (user && post.user) {
            setIsFollowing(post.user.followers?.some(id => id.toString() === user.id) || false);
        }
    }, [user, post.user]);

    useEffect(() => {
        setIsSaved(savedPostIds?.includes(post._id) || false);
    }, [savedPostIds, post._id]);

    useEffect(() => {
        if (!videoRef.current) return;
        const video = videoRef.current;

        const handleCountView = () => {
            if (hasCountedView) return;
            watchTimer.current = setTimeout(() => {
                axios.post(`${API_URL}/posts/${post._id}/view`).catch(err => {
                    console.error('Failed to track view:', err);
                });
                setHasCountedView(true);
            }, 2000);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        video.currentTime = 0;
                        video.play().catch(() => {});
                        setIsPlaying(true);
                        handleCountView();
                    } else {
                        video.pause();
                        setIsPlaying(false);
                        clearTimeout(watchTimer.current);
                    }
                });
            },
            { threshold: 0.6 }
        );
        observer.observe(video);
        return () => {
            observer.disconnect();
            clearTimeout(watchTimer.current);
        };
    }, [post._id, hasCountedView]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    const handleVideoLoad = () => {
        setIsLoading(false);
    };

    const handleVideoError = (e) => {
        console.error('Video error:', e);
        if (retryCount < 3) {
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
                if (videoRef.current) {
                    const videoUrl = getVideoUrl(post.fileUrl);
                    videoRef.current.src = videoUrl + '?retry=' + Date.now();
                    videoRef.current.load();
                    videoRef.current.play().catch(() => {});
                }
            }, 1000);
        } else {
            setVideoError(true);
            setIsLoading(false);
        }
    };

    const handleDoubleTap = () => {
        if (!post.likes?.includes(user.id)) onLike(post._id);
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
    };

    const handleSaveToggle = async () => {
        setIsSaving(true);
        try {
            const res = await axios.post(`${API_URL}/users/save/${post._id}`);
            setIsSaved(res.data.isSaved);
            if (onSaveChange) onSaveChange(post._id, res.data.isSaved);
        } catch (err) {
            console.error('Save toggle failed:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCommentSubmit = async () => {
        const trimmed = commentText.trim();
        if (!trimmed) return;
        setCommentLoading(true);
        try {
            const res = await axios.post(`${API_URL}/posts/${post._id}/comment`, { text: trimmed });
            setComments(res.data);
            setCommentText('');
            setShowComments(true);
        } catch (err) {
            console.error('Comment failed:', err);
        } finally {
            setCommentLoading(false);
        }
    };

    const isOwn = post.user?._id?.toString() === user?.id;

    return (
        <div className="reel-slide">
            {videoError ? (
                <div className="reel-error-container">
                    <Eye size={48} color="#666" />
                    <p className="reel-error-text">Video failed to load</p>
                    <button 
                        className="reel-retry-btn"
                        onClick={() => {
                            setVideoError(false);
                            setRetryCount(0);
                            setIsLoading(true);
                            if (videoRef.current) {
                                const videoUrl = getVideoUrl(post.fileUrl);
                                videoRef.current.src = videoUrl + '?t=' + Date.now();
                                videoRef.current.load();
                            }
                        }}
                    >
                        Qayta yuklash
                    </button>
                </div>
            ) : (
                <>
                    {isLoading && (
                        <div className="reel-video-loader">
                            <Loader className="spin" size={48} color="white" />
                        </div>
                    )}
                    <video
                        ref={videoRef}
                        src={getVideoUrl(post.fileUrl)}
                        loop
                        muted={isMuted}
                        playsInline
                        preload="auto"
                        onClick={onToggleMute}
                        onDoubleClick={handleDoubleTap}
                        onError={handleVideoError}
                        onLoadedData={handleVideoLoad}
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            display: isLoading ? 'none' : 'block'
                        }}
                    />
                </>
            )}
            {showHeart && (
                <div className="reel-heart-overlay">
                    <Heart size={80} fill="white" color="white" />
                </div>
            )}

            <div className="reel-overlay">
                <div className="reel-sidebar-actions">
                    <div className="reel-action" onClick={() => onLike(post._id)}>
                        <Heart
                            size={28}
                            fill={post.likes?.includes(user?.id) ? "#ed4956" : "none"}
                            color={post.likes?.includes(user?.id) ? "#ed4956" : "white"}
                        />
                        <span>{formatCount(post.likes?.length || 0)}</span>
                    </div>
                    <div className="reel-action" onClick={() => setShowComments(prev => !prev)}>
                        <MessageCircle size={28} color="white" />
                        <span>{formatCount(comments.length)}</span>
                    </div>
                    <div className="reel-action" onClick={() => onShare(post)}>
                        <Send size={28} color="white" />
                    </div>
                    <div className="reel-action" onClick={handleSaveToggle}>
                        <Bookmark 
                            size={28} 
                            color={isSaved ? "#ffd700" : "white"} 
                            fill={isSaved ? "#ffd700" : "none"} 
                        />
                        <span style={{ fontSize: '10px' }}>{isSaved ? 'Saved' : ''}</span>
                    </div>
                    <div className="reel-action" onClick={onToggleMute}>
                        {isMuted ? <VolumeX size={24} color="white" /> : <Volume2 size={24} color="white" />}
                    </div>
                    <div className="reel-action">
                        <Eye size={28} color="white" />
                        <span>{formatCount(post.views || 0)}</span>
                    </div>
                    {isOwn && (
                        <div className="reel-action" onClick={() => setShowMenu(!showMenu)}>
                            <MoreHorizontal size={24} color="white" />
                            {showMenu && (
                                <div className="reel-menu" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => { onDelete(post._id); setShowMenu(false); }}>
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="reel-bottom-info">
                    <div className="reel-user" onClick={() => navigate(`/profile/${post.user?._id}`)}>
                        <img
                            src={post.user?.avatar && post.user.avatar.startsWith('http') 
                                ? post.user.avatar 
                                : `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user?.username || 'user'}`
                            }
                            alt=""
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user?.username || 'user'}`;
                            }}
                        />
                        <span className="reel-username">@{post.user?.username || 'user'}</span>
                        {!isOwn && post.user && (
                            <button
                                className={`reel-follow ${isFollowing ? 'following' : ''}`}
                                onClick={async (e) => { 
                                    e.stopPropagation(); 
                                    try {
                                        const res = await axios.post(`${API_URL}/users/${post.user._id}/follow`);
                                        setIsFollowing(res.data.isFollowing);
                                    } catch (err) { console.error(err); }
                                }}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        )}
                    </div>
                    {post.caption && <p className="reel-caption">{post.caption}</p>}
                    <div className="reel-audio">
                        <Music size={12} />
                        <span>{post.user?.username || 'User'} · Original Audio</span>
                    </div>

                    {showComments && (
                        <div className="reel-comments-panel">
                            <div className="reel-comments-header">
                                <strong>Comments</strong>
                                <span>{formatCount(comments.length)}</span>
                                <button 
                                    onClick={() => setShowComments(false)}
                                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="reel-comments-list">
                                {comments.length === 0 ? (
                                    <p className="reel-comments-empty">No comments yet. Be first!</p>
                                ) : comments.map((comment, idx) => (
                                    <div key={idx} className="reel-comment-item">
                                        <div className="reel-comment-user">
                                            <strong>{comment.user?.username || 'User'}</strong>
                                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p>{comment.text}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="reel-comment-form">
                                <input
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                                />
                                <button onClick={handleCommentSubmit} disabled={commentLoading || !commentText.trim()}>
                                    {commentLoading ? '...' : 'Send'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Reels = () => {
    const { user } = useAuth();
    const [reels, setReels] = useState([]);
    const [savedPostIds, setSavedPostIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [globalMuted, setGlobalMuted] = useState(false);
    const [sharingPost, setSharingPost] = useState(null);
    const containerRef = useRef(null);
    const isScrolling = useRef(false);

    useEffect(() => { 
        fetchReels(); 
        if (user) {
            fetchSavedIds();
            const socket = getSocket(user.id);
            socket.on('postDeleted', (postId) => {
                setReels(prev => prev.filter(p => p._id !== postId));
            });
            return () => socket.off('postDeleted');
        }
    }, [user?.id]);

    const fetchReels = async () => {
        try {
            setError(null);
            setLoading(true);
            const res = await axios.get(`${API_URL}/posts/reels`, { timeout: 30000 });
            console.log('Reels data:', res.data);
            setReels(res.data || []);
        } catch (err) {
            console.error('Reels fetch error:', err);
            if (err.code === 'ECONNABORTED') {
                setError('Server javob bermayapti. Internet ulanishini tekshiring.');
            } else {
                setError(err.response?.data?.message || 'Failed to load reels');
            }
            setReels([]);
        } finally { 
            setLoading(false); 
        }
    };

    const fetchSavedIds = async () => {
        try {
            const res = await axios.get(`${API_URL}/users/saved-posts`);
            setSavedPostIds(res.data.map(post => post._id));
        } catch (err) {
            console.error('Failed to fetch saved reels:', err);
        }
    };

    const handleSaveChange = (postId, isSaved) => {
        setSavedPostIds(prev => {
            if (isSaved) {
                return [...new Set([...prev, postId])];
            }
            return prev.filter(id => id !== postId);
        });
    };

    const handleLike = async (postId) => {
        if (!user) return;
        try {
            const res = await axios.post(`${API_URL}/posts/${postId}/like`);
            setReels(reels.map(p => {
                if (p._id === postId) {
                    const likes = res.data.hasLiked 
                        ? [...(p.likes || []), user.id] 
                        : (p.likes || []).filter(id => id !== user.id);
                    return { ...p, likes };
                }
                return p;
            }));
        } catch (err) { 
            console.error('Like error:', err);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm("Reelni o'chirishni istaysizmi?")) return;
        try {
            await axios.delete(`${API_URL}/posts/${postId}`);
            setReels(reels.filter(p => p._id !== postId));
        } catch (err) { 
            if (err.response?.status === 404) {
                setReels(reels.filter(p => p._id !== postId));
            } else {
                alert("Xatolik: " + (err.response?.data?.message || err.message)); 
            }
        }
    };

    const handleWheel = (e) => {
        if (isScrolling.current) return;
        const container = containerRef.current;
        if (!container) return;
        if (Math.abs(e.deltaY) < 30) return;

        e.preventDefault();
        isScrolling.current = true;

        const delta = e.deltaY;
        const slideHeight = window.innerHeight;
        const currentScroll = container.scrollTop;
        
        let targetScroll;
        if (delta > 0) {
            targetScroll = Math.ceil((currentScroll + 1) / slideHeight) * slideHeight;
        } else {
            targetScroll = Math.floor((currentScroll - 1) / slideHeight) * slideHeight;
        }

        container.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });

        setTimeout(() => {
            isScrolling.current = false;
        }, 800);
    };

    if (loading) return (
        <div className="reels-loading">
            <Loader className="spin" size={48} color="white" />
        </div>
    );

    if (error) return (
        <div className="reels-error">
            <Music size={48} opacity={0.5} color="white" />
            <p style={{ color: 'white' }}>{error}</p>
            <button className="reels-retry-btn" onClick={fetchReels}>
                Qayta yuklash
            </button>
        </div>
    );

    return (
        <div className="reels-page">
            <div 
                className="reels-scroll" 
                ref={containerRef}
                onWheel={handleWheel}
            >
                {reels.length === 0 ? (
                    <div className="reels-empty">
                        <Music size={48} opacity={0.5} color="white" />
                        <span style={{ color: 'white' }}>No Reels yet</span>
                    </div>
                ) : reels.map(reel => (
                    <ReelItem
                        key={reel._id}
                        post={reel}
                        user={user}
                        savedPostIds={savedPostIds}
                        onSaveChange={handleSaveChange}
                        onLike={handleLike}
                        onDelete={handleDelete}
                        isMuted={globalMuted}
                        onToggleMute={() => setGlobalMuted(!globalMuted)}
                        onShare={setSharingPost}
                    />
                ))}
            </div>

            {sharingPost && <ShareModal post={sharingPost} onClose={() => setSharingPost(null)} />}

            <style>{`
                .reels-page {
                    background: #000;
                    height: 100vh;
                    overflow: hidden;
                    width: 100%;
                    position: fixed;
                    top: 0;
                    left: 0;
                    z-index: 1000;
                }
                .reels-scroll {
                    height: 100%;
                    overflow-y: scroll;
                    scroll-snap-type: y mandatory;
                    scroll-snap-stop: always;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    overscroll-behavior: contain;
                    overscroll-behavior-y: contain;
                    -webkit-overflow-scrolling: touch;
                    touch-action: pan-y;
                }
                .reels-scroll::-webkit-scrollbar { display: none; }

                .reel-slide {
                    height: 100vh;
                    width: 100%;
                    max-width: 430px;
                    margin: 0 auto;
                    scroll-snap-align: start;
                    scroll-snap-stop: always;
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

                .reel-error-container {
                    width: 100%;
                    height: 100%;
                    background: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #999;
                    flex-direction: column;
                    gap: 12px;
                }
                .reel-error-text {
                    margin: 0;
                    font-size: 14px;
                    color: #999;
                }
                .reel-retry-btn, .reels-retry-btn {
                    padding: 8px 20px;
                    background: #0a66c2;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .reel-retry-btn:hover, .reels-retry-btn:hover {
                    background: #0a5aad;
                }

                .reel-video-loader {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 10;
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
                    background: transparent;
                    border: none;
                    cursor: pointer;
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
                    flex-wrap: wrap;
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
                    cursor: pointer;
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

                .reel-comments-panel {
                    margin-top: 12px;
                    background: rgba(0,0,0,0.35);
                    border-radius: 14px;
                    padding: 12px;
                    max-height: 220px;
                    overflow: hidden;
                    backdrop-filter: blur(6px);
                }
                .reel-comments-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    color: #fff;
                    font-size: 0.9rem;
                }
                .reel-comments-list {
                    max-height: 130px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-bottom: 10px;
                }
                .reel-comments-list::-webkit-scrollbar {
                    width: 3px;
                }
                .reel-comments-list::-webkit-scrollbar-track {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
                .reel-comments-list::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.3);
                    border-radius: 10px;
                }
                .reel-comment-item {
                    color: white;
                    font-size: 0.85rem;
                    line-height: 1.4;
                }
                .reel-comment-user {
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                    align-items: center;
                    margin-bottom: 4px;
                    opacity: 0.9;
                    font-size: 0.8rem;
                }
                .reel-comment-user strong { font-weight: 700; }
                .reel-comments-empty {
                    color: rgba(255,255,255,0.78);
                    font-size: 0.84rem;
                }
                .reel-comment-form {
                    display: flex;
                    gap: 8px;
                }
                .reel-comment-form input {
                    flex: 1;
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.18);
                    color: white;
                    border-radius: 999px;
                    padding: 10px 14px;
                    font-size: 0.9rem;
                    outline: none;
                }
                .reel-comment-form input::placeholder {
                    color: rgba(255,255,255,0.5);
                }
                .reel-comment-form button {
                    background: #0a66c2;
                    border-radius: 999px;
                    border: none;
                    color: white;
                    padding: 0 18px;
                    font-weight: 700;
                    min-width: 72px;
                    cursor: pointer;
                }
                .reel-comment-form button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
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

                .reels-loading, .reels-error, .reels-empty {
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000;
                    color: white;
                    flex-direction: column;
                    gap: 12px;
                }

                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .reel-slide { max-width: 100%; }
                    .reel-slide video { object-fit: contain; background: #000; }
                }

                @media (min-width: 769px) {
                    .reel-slide {
                        max-width: 430px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Reels;
