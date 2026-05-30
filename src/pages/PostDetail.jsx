import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import BottomNav from '../components/BottomNav';
import { Heart, MessageCircle, Send, Trash2, ArrowLeft, Loader, MoreVertical } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ShareModal from '../components/ShareModal';


const PostDetail = () => {
    const { user, lang } = useAuth();
    const t = translations[lang];
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sharingPost, setSharingPost] = useState(null);


    useEffect(() => {
        fetchPost();
    }, [postId]);

    const fetchPost = async () => {
        try {
            const res = await axios.get(`/api/posts/${postId}`);
            setPost(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleLike = async () => {
        try {
            const res = await axios.post(`/api/posts/${postId}/like`);
            setPost({ ...post, likes: res.data.hasLiked ? [...post.likes, user.id] : post.likes.filter(id => id !== user.id) });
        } catch (err) { console.error(err); }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const res = await axios.post(`/api/posts/${postId}/comment`, { text: commentText });
            setPost({ ...post, comments: res.data });
            setCommentText('');
        } catch (err) { console.error(err); }
    };

    const handleDelete = async () => {
        if (!window.confirm("Postni o'chirmoqchimisiz?")) return;
        try {
            await axios.delete(`/api/posts/${postId}`);
            navigate(-1);
        } catch (err) { alert("Xatolik!"); }
    };

    if (loading) return <div className="post-loading"><Loader className="spin" /></div>;
    if (!post) return <div className="post-error">Post Not Found</div>;

    const isOwner = post.user._id === user.id;

    return (
        <div className="post-detail-page">
            <header className="post-header">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h2>Post</h2>
                {isOwner ? (
                    <button onClick={handleDelete} className="delete-btn"><Trash2 size={22} /></button>
                ) : <div style={{width: 24}}></div>}
            </header>

            <main className="post-detail-content">
                <div className="post-owner-row">
                    <img src={post.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user.username}`} alt="o" />
                    <div className="owner-meta">
                        <h4>{post.user.username}</h4>
                        <p>{post.user.firstName} {post.user.lastName}</p>
                    </div>
                </div>

                <div className="post-media-box">
                    {post.fileType === 'video' ? <video src={post.fileUrl} controls /> : <img src={post.fileUrl} alt="p" />}
                </div>

                <div className="post-actions-row">
                    <button onClick={handleLike}>
                        <Heart size={26} fill={post.likes.includes(user.id) ? "#ff3b30" : "none"} color={post.likes.includes(user.id) ? "#ff3b30" : "currentColor"} />
                    </button>
                    <button><MessageCircle size={26} /></button>
                    <button onClick={() => setSharingPost(post)}><Send size={26} /></button>
                </div>


                <div className="post-metadata">
                    <p className="likes-count"><b>{post.likes.length} likes</b></p>
                    <p className="caption"><b>{post.user.username}</b> {post.caption}</p>
                    <p className="time">{new Date(post.createdAt).toLocaleString()}</p>
                </div>

                <div className="comments-section">
                    <h3>Comments</h3>
                    {post.comments.map((c, i) => (
                        <div key={i} className="comment-item">
                            <img src={c.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${c.user.username}`} alt="c" />
                            <div className="comment-body">
                                <b>{c.user.username}</b>
                                <p>{c.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <div className="comment-input-strip">
                <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    value={commentText} 
                    onChange={e => setCommentText(e.target.value)} 
                />
                <button disabled={!commentText.trim()} onClick={handleComment}>Post</button>
            </div>

            <BottomNav />
            {sharingPost && <ShareModal post={sharingPost} onClose={() => setSharingPost(null)} />}


            <style jsx="true">{`
                .post-detail-page { background: var(--bg-primary); min-height: 100vh; padding-bottom: 120px; }
                .post-header { display: flex; align-items: center; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg-primary); z-index: 100; }
                .post-header h2 { font-size: 1.1rem; font-weight: 800; margin: 0; }
                .post-header button { background: transparent; border: none !important; color: var(--text-primary); }
                .delete-btn { color: #ff3b30 !important; }

                .post-owner-row { display: flex; align-items: center; gap: 12px; padding: 15px 20px; }
                .post-owner-row img { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border); }
                .owner-meta h4 { margin: 0; font-size: 0.95rem; font-weight: 800; }
                .owner-meta p { margin: 0; font-size: 0.8rem; color: var(--text-secondary); }

                .post-media-box { width: 100%; background: #000; display: flex; align-items: center; justify-content: center; }
                .post-media-box img, .post-media-box video { width: 100%; max-height: 500px; object-fit: contain; }

                .post-actions-row { display: flex; gap: 15px; padding: 15px 20px 5px; }
                .post-actions-row button { background: transparent; border: none !important; color: var(--text-primary); padding: 0; }

                .post-metadata { padding: 0 20px 15px; }
                .likes-count { font-size: 0.95rem; margin-bottom: 5px; }
                .caption { font-size: 0.95rem; margin-bottom: 5px; line-height: 1.4; }
                .time { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; }

                .comments-section { padding: 20px; border-top: 1px solid var(--border); }
                .comments-section h3 { font-size: 1rem; margin-bottom: 15px; }
                .comment-item { display: flex; gap: 12px; margin-bottom: 15px; }
                .comment-item img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
                .comment-body { flex: 1; }
                .comment-body b { font-size: 0.85rem; }
                .comment-body p { font-size: 0.9rem; margin: 2px 0 0; }

                .comment-input-strip { position: fixed; bottom: 60px; left: 0; right: 0; background: var(--bg-primary); border-top: 1px solid var(--border); padding: 10px 15px; display: flex; gap: 10px; align-items: center; }
                .comment-input-strip input { flex: 1; background: var(--bg-secondary); border: none; border-radius: 20px; padding: 10px 15px; color: var(--text-primary); outline: none; }
                .comment-input-strip button { background: transparent; border: none !important; color: var(--accent); font-weight: 800; font-size: 0.95rem; }
                .comment-input-strip button:disabled { opacity: 0.5; }

                .post-loading { height: 100vh; display: flex; align-items: center; justify-content: center; color: var(--accent); }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default PostDetail;
