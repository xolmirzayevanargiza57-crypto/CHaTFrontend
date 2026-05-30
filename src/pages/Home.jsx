import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoImg from '/chatlogo.png';
import { translations } from '../i18n';
import ShareModal from '../components/ShareModal';

const formatCount = (count) => {
    if (count < 10000) return count;
    if (count < 1000000) return (count / 1000).toFixed(0) + 'k';
    return (count / 1000000).toFixed(1) + 'm';
};

const PostCard = ({ post, user, onLike, onDelete, isMuted, onToggleMute, lang, onShare }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [liked, setLiked] = useState(post.likes.includes(user.id));
    const [likeCount, setLikeCount] = useState(post.likes.length);
    const navigate = useNavigate();
    const videoRef = useRef(null);

    useEffect(() => {
        if (!videoRef.current) return;
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (videoRef.current) {
                    if (entry.isIntersecting) {
                        videoRef.current.play().catch(() => {});
                    } else {
                        videoRef.current.pause();
                    }
                }
            });
        }, { threshold: 0.5 });
        obs.observe(videoRef.current);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        if (videoRef.current) videoRef.current.muted = isMuted;
    }, [isMuted]);

    const handleLike = () => {
        const newLiked = !liked;
        setLiked(newLiked);
        setLikeCount(c => newLiked ? c + 1 : c - 1);
        onLike(post._id);
    };

    const isOwn = post.user._id === user.id;

    return (
        <article className="ig-post">
            {/* Header */}
            <div className="ig-post-header">
                <div className="ig-avatar" onClick={() => navigate(`/profile/${post.user._id}`)}>
                    {post.user.avatar
                        ? <img src={post.user.avatar} alt="" />
                        : <span>{post.user.firstName?.[0] || post.user.username?.[0]}</span>
                    }
                </div>
                <div className="ig-user-info" onClick={() => navigate(`/profile/${post.user._id}`)}>
                    <span className="ig-username">{post.user.username}</span>
                    <span className="ig-post-time">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                {isOwn && (
                    <div style={{ position: 'relative' }}>
                        <button className="ig-menu" onClick={() => setShowMenu(!showMenu)}>
                            <MoreHorizontal size={20} />
                        </button>
                        {showMenu && (
                            <div className="post-dropdown">
                                <button className="post-dropdown-item danger" onClick={() => { onDelete(post._id); setShowMenu(false); }}>
                                    <Trash2 size={16} /> Delete post
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Media */}
            <div className="ig-post-media" onDoubleClick={handleLike}>
                {post.fileType === 'video' ? (
                    <>
                        <video
                            ref={videoRef}
                            src={post.fileUrl}
                            muted={isMuted}
                            loop
                            playsInline
                            preload="auto"
                        />
                        <button className="ig-sound-btn" onClick={onToggleMute}>
                            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                    </>
                ) : (
                    <img src={post.fileUrl} alt="post" loading="lazy" />
                )}
            </div>

            {/* Actions */}
            <div className="ig-post-actions">
                <div className="ig-actions-left">
                    <button onClick={handleLike} className={liked ? 'liked' : ''}>
                        <Heart
                            size={24}
                            fill={liked ? "#ed4956" : "none"}
                            color={liked ? "#ed4956" : "currentColor"}
                            style={liked ? { animation: 'heartBeat 0.4s ease' } : {}}
                        />
                    </button>
                    <button><MessageCircle size={24} /></button>
                    <button onClick={() => onShare(post)}><Send size={24} /></button>
                </div>
                <button><Bookmark size={24} /></button>
            </div>

            {/* Info */}
            <div className="ig-post-info">
                <span className="ig-likes">{formatCount(likeCount)} {translations[lang || 'uz']?.likes || 'likes'}</span>
                <div className="ig-caption">
                    <b>{post.user.username}</b>{' '}
                    {isExpanded || (post.caption || '').length < 80
                        ? <span>{post.caption}</span>
                        : <>
                            <span>{post.caption?.slice(0, 80)}...</span>
                            <button className="ig-more" onClick={() => setIsExpanded(true)}>more</button>
                        </>
                    }
                </div>
            </div>
        </article>
    );
};

const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [storyGroups, setStoryGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [globalMuted, setGlobalMuted] = useState(true);
    const [sharingPost, setSharingPost] = useState(null);

    useEffect(() => {
        fetchFeed();
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const res = await axios.get('/api/stories');
            setStoryGroups(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchFeed = async () => {
        try {
            const res = await axios.get('/api/posts/feed');
            // Randomize feed
            setPosts(res.data.sort(() => Math.random() - 0.5));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const { lang, token } = useAuth();

    const handleLike = async (postId) => {
        try {
            const res = await axios.post(`/api/posts/${postId}/like`);
            setPosts(posts.map(p => p._id === postId
                ? { ...p, likes: res.data.hasLiked ? [...p.likes, user.id] : p.likes.filter(id => id !== user.id) }
                : p
            ));
        } catch (err) { console.error(err); }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Postni o'chirishni istaysizmi?")) return;
        try {
            await axios.delete(`/api/posts/${postId}`);
            setPosts(posts.filter(p => p._id !== postId));
        } catch (err) { alert("Xatolik!"); }
    };

    return (
        <div className="ig-home">
            {/* Mobile-only header */}
            <header className="ig-home-header">
                <div className="ig-logo-container" onClick={() => navigate('/')}>
                    <img src={logoImg} alt="CHaT" className="ig-logo-img" />
                </div>
                <div className="ig-header-actions">
                    {!token ? (
                        <button className="ig-login-btn" onClick={() => navigate('/login')}>
                            {translations[lang || 'uz']?.login || 'Login'}
                        </button>
                    ) : (
                        <button onClick={() => navigate('/chat')}><Send size={24} /></button>
                    )}
                </div>
            </header>

            {/* Stories Bar */}
            <div className="ig-stories-bar">
                <div className="ig-story-item" onClick={() => navigate('/profile')}>
                    <div className="ig-story-ring own">
                        {user?.avatar
                            ? <img src={user.avatar} alt="" />
                            : <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user?.username?.[0] || '+'}</span>
                        }
                    </div>
                    <span>{translations[lang || 'uz']?.story || 'Your story'}</span>
                </div>
                {storyGroups.map(group => (
                    <div key={group.user._id} className="ig-story-item" onClick={() => navigate(`/stories/${group.user._id}`)}>
                        <div className={`ig-story-ring ${group.stories.some(s => !s.hasViewed) ? 'unseen' : 'seen'}`}>
                            {group.user.avatar ? (
                                <img src={group.user.avatar} alt="" />
                            ) : (
                                <div className="ig-story-placeholder">
                                    {group.user.username[0]}
                                </div>
                            )}
                        </div>
                        <span>{group.user.username}</span>
                    </div>
                ))}
            </div>

            {/* Feed */}
            <main className="ig-feed">
                {loading ? (
                    <div className="ig-loading">
                        {[1,2,3].map(i => (
                            <div key={i} className="ig-skeleton">
                                <div className="sk-header">
                                    <div className="sk-circle"></div>
                                    <div className="sk-lines">
                                        <div className="sk-line short"></div>
                                        <div className="sk-line shorter"></div>
                                    </div>
                                </div>
                                <div className="sk-media"></div>
                            </div>
                        ))}
                    </div>
                ) : posts.map(post => (
                    <PostCard
                        key={post._id}
                        post={post}
                        user={user}
                        onLike={handleLike}
                        onDelete={handleDeletePost}
                        isMuted={globalMuted}
                        onToggleMute={() => setGlobalMuted(!globalMuted)}
                        lang={lang}
                        onShare={setSharingPost}
                    />
                ))}
            </main>

            <BottomNav />
            {sharingPost && <ShareModal post={sharingPost} onClose={() => setSharingPost(null)} />}

            <style jsx="true">{`
                .ig-home { background: var(--bg-primary); min-height: 100vh; }

                .ig-home-header {
                    display: none;
                }
                @media (max-width: 768px) {
                    .ig-home-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 12px 16px;
                        border-bottom: 1px solid var(--border);
                        background: var(--bg-primary);
                        position: sticky;
                        top: 0;
                        z-index: 100;
                    }
                }
                .ig-logo-container { cursor: pointer; display: flex; align-items: center; }
                .ig-logo-img { height: 32px; width: auto; object-fit: contain; }
                .ig-header-actions button { color: var(--text-primary); }
                .ig-login-btn { 
                    background: var(--accent); 
                    color: white !important; 
                    padding: 6px 16px !important; 
                    border-radius: 8px; 
                    font-weight: 600; 
                    font-size: 0.9rem;
                }

                /* Stories */
                .ig-stories-bar {
                    display: flex;
                    gap: 14px;
                    padding: 14px 16px;
                    overflow-x: auto;
                    border-bottom: 1px solid var(--border);
                    scrollbar-width: none;
                    max-width: 630px;
                    margin: 0 auto;
                }
                .ig-stories-bar::-webkit-scrollbar { display: none; }

                .ig-story-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    min-width: 64px;
                    cursor: pointer;
                }
                .ig-story-ring {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    padding: 3px;
                    background: var(--bg-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.15s;
                }
                .ig-story-item:hover .ig-story-ring { transform: scale(1.05); }
                .ig-story-ring.unseen {
                    background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
                }
                .ig-story-ring.seen { background: var(--border); }
                .ig-story-ring.own { background: linear-gradient(45deg, #405de6, #5851db, #833ab4, #c13584, #e1306c, #fd1d1d); }

                .ig-story-ring img, .ig-story-ring span {
                    width: 58px;
                    height: 58px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid var(--bg-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-secondary);
                }
                .ig-story-placeholder {
                    width: 58px;
                    height: 58px;
                    border-radius: 50%;
                    background: var(--bg-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.2rem;
                    border: 3px solid var(--bg-primary);
                }
                .ig-story-item > span {
                    font-size: 0.73rem;
                    color: var(--text-primary);
                    max-width: 64px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    text-align: center;
                }

                /* Feed */
                .ig-feed {
                    max-width: 470px;
                    margin: 0 auto;
                    padding-bottom: 30px;
                }

                /* Post Card */
                .ig-post {
                    border-bottom: 1px solid var(--border);
                    margin-bottom: 4px;
                    background: var(--bg-primary);
                }

                .ig-post-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                }
                .ig-avatar {
                    width: 34px;
                    height: 34px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: var(--bg-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.85rem;
                    border: 1px solid var(--border);
                    cursor: pointer;
                    flex-shrink: 0;
                }
                .ig-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .ig-user-info {
                    flex: 1;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                }
                .ig-username { font-weight: 600; font-size: 0.9rem; }
                .ig-post-time { font-size: 0.75rem; color: var(--text-secondary); }
                .ig-menu { color: var(--text-primary); }

                .post-dropdown {
                    position: absolute;
                    right: 0;
                    top: 32px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                    z-index: 200;
                    min-width: 160px;
                    overflow: hidden;
                }
                .post-dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    width: 100%;
                    text-align: left;
                    transition: background 0.15s;
                }
                .post-dropdown-item:hover { background: var(--bg-secondary); }
                .post-dropdown-item.danger { color: #ed4956; }

                .ig-post-media {
                    position: relative;
                    width: 100%;
                    background: #000;
                    max-height: 600px;
                    overflow: hidden;
                }
                .ig-post-media img {
                    width: 100%;
                    display: block;
                    max-height: 600px;
                    object-fit: cover;
                }
                .ig-post-media video {
                    width: 100%;
                    display: block;
                    max-height: 600px;
                    object-fit: cover;
                }
                .ig-sound-btn {
                    position: absolute;
                    bottom: 14px;
                    right: 14px;
                    background: rgba(38,38,38,0.85);
                    color: white;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 5;
                }

                .ig-post-actions {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 12px 4px;
                }
                .ig-actions-left { display: flex; gap: 14px; }
                .ig-post-actions button { color: var(--text-primary); padding: 4px; }
                .ig-post-actions button.liked { color: #ed4956; }

                .ig-post-info { padding: 0 12px 14px; }
                .ig-likes { font-weight: 600; font-size: 0.9rem; display: block; margin-bottom: 4px; }
                .ig-caption { font-size: 0.9rem; line-height: 1.4; }
                .ig-caption b { font-weight: 600; margin-right: 6px; }
                .ig-more { color: var(--text-secondary); font-size: 0.9rem; cursor: pointer; }

                /* Skeleton loader */
                .ig-loading { padding: 0; }
                .ig-skeleton { margin-bottom: 4px; border-bottom: 1px solid var(--border); }
                .sk-header { display: flex; align-items: center; gap: 10px; padding: 12px; }
                .sk-circle { width: 34px; height: 34px; border-radius: 50%; background: var(--bg-secondary); animation: pulse 1.5s infinite; flex-shrink: 0; }
                .sk-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
                .sk-line { height: 10px; background: var(--bg-secondary); border-radius: 6px; animation: pulse 1.5s infinite; }
                .sk-line.short { width: 60%; }
                .sk-line.shorter { width: 40%; }
                .sk-media { height: 300px; background: var(--bg-secondary); animation: pulse 1.5s infinite; }

                @media (max-width: 768px) {
                    .ig-feed { max-width: 100%; }
                    .ig-stories-bar { max-width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default Home;
