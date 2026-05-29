import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Heart, Send, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Stories = () => {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [groupIndex, setGroupIndex] = useState(0);
    const [storyIndex, setStoryIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [muted, setMuted] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const res = await axios.get('/api/stories');
            setGroups(res.data);
            const startIdx = userId ? res.data.findIndex(g => g.user._id === userId) : 0;
            setGroupIndex(startIdx > -1 ? startIdx : 0);
            setLoading(false);
        } catch (err) { console.error(err); navigate('/'); }
    };

    const currentGroup = groups[groupIndex];
    const currentStory = currentGroup?.stories[storyIndex];

    useEffect(() => {
        if (!currentStory) return;
        
        // Mark as viewed
        if (!currentStory.hasViewed) {
            axios.post(`/api/stories/${currentStory._id}/view`).catch(e => {});
        }

        let duration = 5000;
        if (currentStory.fileType === 'video') {
            duration = 20000; // Give videos more time (20s)
        }

        const interval = 100;
        let elapsed = 0;

        const timer = setInterval(() => {
            elapsed += interval;
            setProgress((elapsed / duration) * 100);
            if (elapsed >= duration) {
                clearInterval(timer);
                nextStory();
            }
        }, interval);

        return () => clearInterval(timer);
    }, [groupIndex, storyIndex, currentStory]);

    const nextStory = () => {
        if (storyIndex < currentGroup.stories.length - 1) {
            setStoryIndex(storyIndex + 1);
            setProgress(0);
        } else if (groupIndex < groups.length - 1) {
            setGroupIndex(groupIndex + 1);
            setStoryIndex(0);
            setProgress(0);
        } else {
            navigate(-1);
        }
    };

    const prevStory = () => {
        if (storyIndex > 0) {
            setStoryIndex(storyIndex - 1);
            setProgress(0);
        } else if (groupIndex > 0) {
            setGroupIndex(groupIndex - 1);
            setStoryIndex(groups[groupIndex - 1].stories.length - 1);
            setProgress(0);
        }
    };

    if (loading) return <div className="stories-loader">Loading...</div>;
    if (!currentGroup) return null;

    return (
        <div className="stories-viewer">
            <div className="stories-container">
                <header className="stories-header">
                    <div className="progress-bars">
                        {currentGroup.stories.map((s, i) => (
                            <div key={s._id} className="progress-bg">
                                <div className="progress-fill" style={{ width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%' }}></div>
                            </div>
                        ))}
                    </div>
                    <div className="story-user-info">
                        <div className="user-avatar">
                            <img src={currentGroup.user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentGroup.user.username}`} alt="v" />
                        </div>
                        <span className="username">{currentGroup.user.username}</span>
                        <span className="time">{new Date(currentStory.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <button className="close-btn" onClick={() => navigate(-1)}><X size={24} /></button>
                    </div>
                </header>

                <main className="story-content" onClick={(e) => {
                    const x = e.clientX;
                    if (x < window.innerWidth / 3) prevStory();
                    else nextStory();
                }}>
                    {currentStory.fileType === 'video' ? (
                        <video 
                            src={currentStory.fileUrl} 
                            autoPlay 
                            playsInline 
                            muted={muted}
                            onEnded={nextStory}
                        />
                    ) : (
                        <img src={currentStory.fileUrl} alt="story" />
                    )}
                </main>

                <footer className="story-footer">
                    <div className="reply-box">
                        <input type="text" placeholder="Reply to story..." />
                        <button><Send size={20} /></button>
                    </div>
                    <button onClick={() => setMuted(!muted)}>
                        {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                    </button>
                    <button><Heart size={24} /></button>
                </footer>
            </div>

            <style jsx="true">{`
                .stories-viewer { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: #000; z-index: 2000; display: flex; align-items: center; justify-content: center; }
                .stories-container { width: 100%; max-width: 450px; height: 100%; position: relative; display: flex; flex-direction: column; background: #111; }
                
                .stories-header { position: absolute; top: 0; left: 0; right: 0; z-index: 10; padding: 10px; background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); }
                .progress-bars { display: flex; gap: 4px; margin-bottom: 15px; }
                .progress-bg { flex: 1; height: 2px; background: rgba(255,255,255,0.3); border-radius: 2px; overflow: hidden; }
                .progress-fill { height: 100%; background: #fff; transition: width 0.1s linear; }

                .story-user-info { display: flex; align-items: center; gap: 10px; color: white; }
                .user-avatar { width: 32px; height: 32px; border-radius: 50%; overflow: hidden; }
                .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .username { font-weight: 700; font-size: 0.9rem; flex: 1; }
                .time { font-size: 0.8rem; opacity: 0.7; margin-right: 10px; }
                .close-btn { background: transparent; border: none !important; color: white; cursor: pointer; }

                .story-content { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: pointer; }
                .story-content img, .story-content video { width: 100%; max-height: 100%; object-fit: contain; }

                .story-footer { padding: 20px; display: flex; align-items: center; gap: 15px; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); }
                .reply-box { flex: 1; display: flex; align-items: center; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); border-radius: 25px; padding: 8px 15px; }
                .reply-box input { flex: 1; background: transparent; border: none; color: white; outline: none; font-size: 0.9rem; }
                .story-footer button { background: transparent; border: none !important; color: white; }

                .stories-loader { height: 100vh; background: #000; color: white; display: flex; align-items: center; justify-content: center; }
            `}</style>
        </div>
    );
};

export default Stories;
