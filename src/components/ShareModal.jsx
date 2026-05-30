import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Search, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ShareModal = ({ post, onClose }) => {
    const { lang } = useAuth();
    const [friends, setFriends] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            const res = await axios.get('/api/users/friends');
            setFriends(res.data);
        } catch (err) { console.error(err); }
    };

    const toggleSelect = (id) => {
        setSelectedFriends(prev => 
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    const handleSend = async () => {
        if (selectedFriends.length === 0) return;
        setSending(true);
        try {
            for (const friendId of selectedFriends) {
                await axios.post(`/api/messages/${friendId}`, {
                    fileUrl: post.fileUrl,
                    fileType: post.fileType,
                    caption: `Shared a post: ${post.caption || ''}`
                });
            }
            onClose();
            alert("Barcha do'stlarga yuborildi!");
        } catch (err) {
            console.error(err);
            alert("Xatolik yuz berdi");
        } finally { setSending(false); }
    };

    return (
        <div className="share-overlay" onClick={onClose}>
            <div className="share-modal" onClick={e => e.stopPropagation()}>
                <header className="share-header">
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                    <h3>Share</h3>
                    <div style={{ width: 24 }}></div>
                </header>

                <div className="share-search">
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="share-friends-grid">
                    {friends
                        .filter(f => f.username?.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(friend => (
                        <div 
                            key={friend._id} 
                            className={`share-friend-item ${selectedFriends.includes(friend._id) ? 'selected' : ''}`}
                            onClick={() => toggleSelect(friend._id)}
                        >
                            <div className="share-avatar">
                                {friend.avatar ? (
                                    <img src={friend.avatar} alt="" />
                                ) : (
                                    <span>{friend.firstName?.[0] || friend.username?.[0]}</span>
                                )}
                                {selectedFriends.includes(friend._id) && (
                                    <div className="select-check"><Check size={12} color="white" /></div>
                                )}
                            </div>
                            <span className="share-name">{friend.username}</span>
                        </div>
                    ))}
                    {friends.length === 0 && <p className="no-friends">No friends to share with</p>}
                </div>

                <footer className="share-footer">
                    <button 
                        className="share-send-btn" 
                        onClick={handleSend}
                        disabled={selectedFriends.length === 0 || sending}
                    >
                        {sending ? 'Sending...' : `Send to ${selectedFriends.length} friends`}
                    </button>
                </footer>
            </div>

            <style jsx="true">{`
                .share-overlay { 
                    position: fixed; inset: 0; background: rgba(0,0,0,0.7); 
                    z-index: 5000; display: flex; align-items: center; justify-content: center; padding: 20px;
                }
                .share-modal { 
                    background: var(--bg-primary); width: 100%; max-width: 400px; 
                    border-radius: 15px; overflow: hidden; display: flex; flex-direction: column;
                    max-height: 80vh;
                }
                .share-header { 
                    display: flex; align-items: center; justify-content: space-between; 
                    padding: 15px; border-bottom: 1px solid var(--border);
                }
                .share-header h3 { margin: 0; font-size: 1.1rem; }
                .share-search { 
                    display: flex; align-items: center; gap: 10px; padding: 10px 15px;
                    background: var(--bg-secondary); margin: 10px 15px; border-radius: 10px;
                }
                .share-search input { 
                    flex: 1; background: transparent; border: none; outline: none; 
                    color: var(--text-primary); font-size: 0.95rem;
                }
                .share-friends-grid { 
                    display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; 
                    padding: 15px; overflow-y: auto; flex: 1;
                }
                .share-friend-item { 
                    display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;
                }
                .share-avatar { 
                    width: 60px; height: 60px; border-radius: 50%; background: #eee; 
                    display: flex; align-items: center; justify-content: center; position: relative;
                    border: 2px solid transparent; transition: 0.2s; overflow: hidden;
                }
                .share-friend-item.selected .share-avatar { border-color: var(--accent); }
                .share-avatar img { width: 100%; height: 100%; object-fit: cover; }
                .share-avatar span { font-weight: 700; color: #666; font-size: 1.2rem; }
                .select-check { 
                    position: absolute; bottom: 0; right: 0; width: 20px; height: 20px; 
                    background: var(--accent); border-radius: 50%; display: flex; 
                    align-items: center; justify-content: center; border: 2px solid var(--bg-primary);
                }
                .share-name { font-size: 0.8rem; text-align: center; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .share-footer { padding: 15px; border-top: 1px solid var(--border); }
                .share-send-btn { 
                    width: 100%; padding: 12px; background: var(--accent); color: white; 
                    border-radius: 10px; font-weight: 700; font-size: 1rem;
                }
                .share-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .no-friends { grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 20px; }
            `}</style>
        </div>
    );
};

export default ShareModal;
