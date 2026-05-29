import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import BottomNav from '../components/BottomNav';
import { ChevronLeft, Loader, Calendar, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Archive = () => {
    const { lang } = useAuth();
    const t = translations[lang];
    const navigate = useNavigate();
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArchive();
    }, []);

    const fetchArchive = async () => {
        try {
            const res = await axios.get('/api/stories/archive');
            setStories(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleDeleteStory = async (storyId) => {
        if (!window.confirm("Storyni o'chirishni istaysizmi?")) return;
        try {
            await axios.delete(`/api/stories/${storyId}`);
            setStories(stories.filter(s => s._id !== storyId));
        } catch (err) { alert("Xatolik!"); }
    };

    if (loading) return <div className="loading-screen"><Loader className="spin" /></div>;

    return (
        <div className="archive-page">
            <header className="archive-header">
                <button onClick={() => navigate(-1)}><ChevronLeft size={24} /></button>
                <h2>{t.viewArchive}</h2>
                <div style={{width: 24}}></div>
            </header>

            <main className="archive-grid">
                {stories.map(story => (
                    <div key={story._id} className="archive-item">
                        {story.fileType === 'video' ? <video src={story.fileUrl} /> : <img src={story.fileUrl} alt="s" />}
                        <div className="item-date">
                            <Calendar size={12} />
                            <span>{new Date(story.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button className="delete-archive-btn" onClick={() => handleDeleteStory(story._id)}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </main>

            <BottomNav />

            <style jsx="true">{`
                .archive-page { background: var(--bg-primary); min-height: 100vh; padding-bottom: 80px; }
                .archive-header { display: flex; align-items: center; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg-primary); z-index: 100; }
                .archive-header h2 { font-size: 1.1rem; font-weight: 800; margin: 0; }
                .archive-header button { background: transparent; border: none !important; color: var(--text-primary); }

                .archive-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; padding: 2px; }
                .archive-item { aspect-ratio: 9/16; background: var(--bg-secondary); overflow: hidden; position: relative; }
                .archive-item img, .archive-item video { width: 100%; height: 100%; object-fit: cover; }
                
                .item-date { position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px; font-size: 0.7rem; font-weight: 600; }
                .delete-archive-btn { position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                .delete-archive-btn:hover { background: #ff3b30; }
                
                .loading-screen { height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-primary); color: var(--accent); }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Archive;
