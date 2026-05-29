import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import BottomNav from '../components/BottomNav';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post, user, t, onLike, onDelete }) => {
    const [postMuted, setPostMuted] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
    const videoRef = useRef(null);

    useEffect(() => {
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
        }, { threshold: 0.7 });
        if (videoRef.current) obs.observe(videoRef.current);
        return () => obs.disconnect();
    }, []);

    return (
        <article className="post-card">
            <div className="post-owner" onClick={() => navigate(`/profile/${post.user._id}`)}>
                <div className="avatar">
                    {post.user.avatar ? <img src={post.user.avatar} alt="v" /> : <span>{post.user.firstName[0]}</span>}
                </div>
                <div className="owner-info">
                    <h3>{post.user.username}</h3>
                    <p>{post.user.firstName} {post.user.lastName}</p>
                </div>
                {post.user._id === user.id && (
                    <button className="post-menu-del" onClick={(e) => { e.stopPropagation(); onDelete(post._id); }}>
                        <MoreHorizontal size={20} />
                    </button>
                )}
            </div>

            <div className="post-media" onDoubleClick={() => onLike(post._id)}>
                {post.fileType === 'video' ? (
                    <div className="video-wrapper">
                        <video ref={videoRef} src={post.fileUrl} muted={postMuted} loop playsInline />
                        <button className="video-sound-overlay" onClick={(e) => { e.stopPropagation(); setPostMuted(!postMuted); }}>
                            {postMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                    </div>
                ) : (
                    <img src={post.fileUrl} alt="post" />
                )}
            </div>

            <div className="post-actions-overlay">
                <div className="action-btns">
                    <button onClick={() => onLike(post._id)}>
                        <Heart size={28} fill={post.likes.includes(user.id) ? "#ff3b30" : "none"} color={post.likes.includes(user.id) ? "#ff3b30" : "white"} />
                    </button>
                </div>
                <p className="likes-count"><b>{post.likes.length} likes</b></p>
                <div className="caption">
                    <b>{post.user.username}</b>
                    {isExpanded || post.caption.length < 60 ? (
                        <span>{post.caption}</span>
                    ) : (
                        <>
                            <span>{post.caption.slice(0, 60)}...</span>
                            <button className="more-btn" onClick={() => setIsExpanded(true)}>more</button>
                        </>
                    )}
                </div>
                <p className="post-time">{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
        </article>
    );
};

const Home = () => {
    const { user, lang } = useAuth();
    const t = translations[lang];
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [storyGroups, setStoryGroups] = useState([]);
    const [loading, setLoading] = useState(true);

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
            // Advanced shuffle
            const shuffled = res.data
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value);
            setPosts(shuffled);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleLike = async (postId) => {
        try {
            const res = await axios.post(`/api/posts/${postId}/like`);
            setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.hasLiked ? [...p.likes, user.id] : p.likes.filter(id => id !== user.id) } : p));
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
        <div className="home-page">
            <header className="home-header">
                <h1 className="logo">CHaT</h1>
                <div className="header-actions">
                    <button onClick={() => navigate('/chat')}><Send size={24} /></button>
                </div>
            </header>

            <div className="stories-bar">
                <div className="story-item mine" onClick={() => navigate('/profile')}>
                    <div className="story-avatar">
                        {user.avatar ? <img src={user.avatar} alt="v" /> : <span>+</span>}
                    </div>
                    <span>Your Story</span>
                </div>
                {storyGroups.map(group => (
                    <div key={group.user._id} className="story-item" onClick={() => navigate(`/stories/${group.user._id}`)}>
                        <div className={`story-avatar ${group.stories.some(s => !s.hasViewed) ? 'unseen' : ''}`}>
                            <img src={group.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${group.user.username}`} alt="s" />
                        </div>
                        <span>{group.user.username}</span>
                    </div>
                ))}
            </div>

            <main className="feed-container">
                {posts.map(post => <PostCard key={post._id} post={post} user={user} t={t} onLike={handleLike} onDelete={handleDeletePost} />)}
            </main>

            <BottomNav />

            <style jsx="true">{`
                .home-page { background: var(--bg-primary); min-height: 100vh; max-width: 600px; margin: 0 auto; border-left: 1px solid var(--border); border-right: 1px solid var(--border); display: flex; flex-direction: column; }
                .home-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid var(--border); background: var(--bg-primary); z-index: 100; flex-shrink: 0; }
                .logo { font-size: 1.6rem; font-weight: 900; color: var(--text-primary); letter-spacing: -1px; }
                .header-actions button { background: transparent; border: none !important; color: var(--text-primary); }

                .stories-bar { display: flex; gap: 15px; padding: 15px; overflow-x: auto; border-bottom: 1px solid var(--border); scrollbar-width: none; flex-shrink: 0; }
                .stories-bar::-webkit-scrollbar { display: none; }
                .story-item { display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 75px; cursor: pointer; }
                .story-avatar { width: 68px; height: 68px; border-radius: 50%; padding: 3px; border: 2px solid transparent; background: var(--bg-secondary); }
                .story-avatar.unseen { background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); }
                .story-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid var(--bg-primary); }
                .story-item span { font-size: 0.78rem; font-weight: 500; color: var(--text-primary); max-width: 65px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

                .feed-container { flex: 1; overflow-y: auto; scroll-snap-type: y mandatory; scrollbar-width: none; background: #000; }
                .feed-container::-webkit-scrollbar { display: none; }
                .post-card { scroll-snap-align: start; scroll-snap-stop: always; height: calc(100vh - 140px); background: #000; display: flex; flex-direction: column; position: relative; border-bottom: 0.5px solid #222; margin-bottom: 15px; border-radius: 12px; overflow: hidden; }
                
                .post-owner { position: absolute; top: 0; left: 0; right: 0; display: flex; align-items: center; gap: 12px; padding: 15px; cursor: pointer; background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent); z-index: 20; color: white; }
                .post-owner .avatar { width: 40px; height: 40px; border-radius: 50%; background: #333; overflow: hidden; border: 1.5px solid white; }
                .post-owner .avatar img { width: 100%; height: 100%; object-fit: cover; }
                .owner-info h3 { font-size: 0.95rem; font-weight: 800; margin: 0; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
                .owner-info p { font-size: 0.8rem; opacity: 0.8; margin: 0; }
                .post-menu-del { background: transparent; border: none !important; color: white; margin-left: auto; }

                .post-media { flex: 1; width: 100%; display: flex; align-items: center; justify-content: center; background: #000; position: relative; overflow: hidden; }
                .video-wrapper { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
                .post-media img, .post-media video { width: 100%; height: 100%; object-fit: contain; }
                .video-sound-overlay { position: absolute; bottom: 85px; right: 15px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 30; }

                .post-actions-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); color: white; z-index: 20; }
                .action-btns { display: flex; gap: 20px; margin-bottom: 10px; }
                .action-btns button { color: white; }
                .likes-count { font-size: 0.95rem; font-weight: 700; margin-bottom: 5px; }
                .caption { font-size: 0.95rem; line-height: 1.4; display: block; opacity: 0.95; }
                .caption b { margin-right: 8px; }
                .post-time { font-size: 0.75rem; opacity: 0.6; margin-top: 8px; text-transform: uppercase; }
            `}</style>
        </div>
    );
};

export default Home;
