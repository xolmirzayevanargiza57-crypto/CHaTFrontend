import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import BottomNav from '../components/BottomNav';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { user, lang } = useAuth();
    const t = translations[lang];
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [storyGroups, setStoryGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPosts, setExpandedPosts] = useState({});

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
            setPosts(res.data);
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
                {posts.map(post => (
                    <article key={post._id} className="post-card">
                        <div className="post-owner" onClick={() => navigate(`/profile/${post.user._id}`)}>
                            <div className="avatar">
                                {post.user.avatar ? <img src={post.user.avatar} alt="v" /> : <span>{post.user.firstName[0]}</span>}
                            </div>
                            <div className="owner-info">
                                <h3>{post.user.username}</h3>
                                <p>{post.user.firstName} {post.user.lastName}</p>
                            </div>
                            {post.user._id === user.id && (
                                <button className="post-menu-del" onClick={(e) => { e.stopPropagation(); handleDeletePost(post._id); }}>
                                    <MoreHorizontal size={20} />
                                </button>
                            )}
                        </div>

                        <div className="post-media" onDoubleClick={() => handleLike(post._id)}>
                            {post.fileType === 'video' ? (
                                <video src={post.fileUrl} controls playsInline />
                            ) : (
                                <img src={post.fileUrl} alt="post" />
                            )}
                        </div>

                        <div className="post-actions">
                            <div className="left">
                                <button onClick={() => handleLike(post._id)}>
                                    <Heart size={26} fill={post.likes.includes(user.id) ? "#ff3b30" : "none"} color={post.likes.includes(user.id) ? "#ff3b30" : "currentColor"} />
                                </button>
                                <button onClick={() => navigate(`/post/${post._id}`)}><MessageCircle size={26} /></button>
                                <button><Send size={26} /></button>
                            </div>
                            <button><Bookmark size={26} /></button>
                        </div>

                        <div className="post-content">
                            <p className="likes-count"><b>{post.likes.length} likes</b></p>
                            <div className="caption">
                                <b>{post.user.username}</b>
                                {expandedPosts[post._id] || post.caption.length < 60 ? (
                                    <span>{post.caption}</span>
                                ) : (
                                    <>
                                        <span>{post.caption.slice(0, 60)}...</span>
                                        <button className="more-btn" onClick={() => setExpandedPosts({...expandedPosts, [post._id]: true})}>more</button>
                                    </>
                                )}
                            </div>
                            <button className="view-comments" onClick={() => navigate(`/post/${post._id}`)}>
                                View all {post.comments.length} comments
                            </button>
                            <p className="post-time">{new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                    </article>
                ))}
            </main>

            <BottomNav />

            <style jsx="true">{`
                .home-page { background: var(--bg-primary); min-height: 100vh; padding-bottom: 80px; }
                .home-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 20px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg-primary); z-index: 100; }
                .logo { font-size: 1.5rem; font-weight: 900; color: var(--text-primary); }
                .header-actions button { background: transparent; border: none !important; color: var(--text-primary); }

                .stories-bar { display: flex; gap: 15px; padding: 15px; overflow-x: auto; border-bottom: 1px solid var(--border); scrollbar-width: none; }
                .stories-bar::-webkit-scrollbar { display: none; }
                .story-item { display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 70px; cursor: pointer; }
                .story-avatar { width: 64px; height: 64px; border-radius: 50%; padding: 2px; border: 2px solid transparent; background: var(--bg-secondary); }
                .story-avatar.unseen { background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); }
                .story-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid var(--bg-primary); }
                .story-item span { font-size: 0.75rem; color: var(--text-primary); max-width: 65px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .mine .story-avatar { background: var(--bg-secondary); border: 1px solid var(--border); position: relative; }
                .mine .story-avatar span { font-size: 1.5rem; color: var(--accent); display: flex; align-items: center; justify-content: center; height: 100%; }

                .feed-container { display: flex; flex-direction: column; gap: 20px; padding: 15px 0; }
                .post-card { border-bottom: 1px solid var(--border); padding-bottom: 15px; }
                .post-owner { display: flex; align-items: center; gap: 12px; padding: 0 15px 12px; cursor: pointer; }
                .post-owner .avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--bg-secondary); overflow: hidden; display: flex; align-items: center; justify-content: center; font-weight: 700; border: 1px solid var(--border); }
                .post-owner .avatar img { width: 100%; height: 100%; object-fit: cover; }
                .owner-info { flex: 1; }
                .owner-info h3 { font-size: 0.95rem; font-weight: 800; margin: 0; }
                .owner-info p { font-size: 0.8rem; color: var(--text-secondary); margin: 0; }
                .post-menu { background: transparent; border: none !important; color: var(--text-secondary); }

                .post-menu-del { background: transparent; border: none !important; color: var(--text-secondary); cursor: pointer; padding: 5px; border-radius: 50%; }
                .post-menu-del:hover { background: rgba(0,0,0,0.05); color: #ff3b30; }

                .post-media { width: 100%; background: #000; display: flex; align-items: center; justify-content: center; min-height: 300px; }
                .post-media img, .post-media video { width: 100%; max-height: 600px; object-fit: contain; }

                .post-actions { display: flex; justify-content: space-between; padding: 12px 15px 8px; }
                .post-actions .left { display: flex; gap: 15px; }
                .post-actions button { background: transparent; border: none !important; color: var(--text-primary); transition: transform 0.1s; }
                .post-actions button:active { transform: scale(1.2); }

                .post-content { padding: 0 15px; display: flex; flex-direction: column; gap: 5px; }
                .likes-count { font-size: 0.95rem; margin: 0; }
                .caption { font-size: 0.95rem; margin: 0; line-height: 1.4; display: inline; }
                .caption b { margin-right: 6px; cursor: pointer; }
                .more-btn { background: transparent; border: none !important; color: var(--text-secondary); font-size: 0.9rem; padding: 0; margin-left: 5px; cursor: pointer; }
                .view-comments { background: transparent; border: none !important; color: var(--text-secondary); font-size: 0.9rem; text-align: left; padding: 0; margin-top: 5px; }
                .post-time { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; margin-top: 5px; }
            `}</style>
        </div>
    );
};

export default Home;
