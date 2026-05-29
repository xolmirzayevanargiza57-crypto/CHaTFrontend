import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { translations } from '../i18n';
import BottomNav from '../components/BottomNav';
import { Image as ImageIcon, Video, X, Send, Loader, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Create = () => {
    const { lang } = useAuth();
    const t = translations[lang];
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState('');
    const [isReel, setIsReel] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setIsReel(selectedFile.type.startsWith('video/'));
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setUploadProgress(0);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const uploadRes = await axios.post('/api/upload', formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });
            await axios.post('/api/posts', {
                fileUrl: uploadRes.data.fileUrl,
                fileType: file.type.startsWith('video/') ? 'video' : 'image',
                caption,
                isReel
            });
            navigate('/');
        } catch (err) { alert("Xatolik!"); }
        finally { setUploading(false); setUploadProgress(0); }
    };

    return (
        <div className="create-page">
            <header className="create-header">
                <button onClick={() => navigate(-1)}><ArrowLeft size={24} /></button>
                <h2>New Post</h2>
                <button className="share-btn" disabled={!file || uploading} onClick={handleUpload}>
                    {uploading ? <Loader className="spin" size={20} /> : 'Share'}
                </button>
            </header>

            <main className="create-content">
                <div className={`media-preview-box ${isReel ? 'is-video' : ''}`} onClick={() => !file && fileInputRef.current.click()}>
                    {preview ? (
                        <div className="preview-container">
                            {file.type.startsWith('video/') ? <video src={preview} controls className="v-contain" /> : <img src={preview} alt="v" />}
                            <button className="remove-media" onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); }}><X size={20} /></button>
                        </div>
                    ) : (
                        <div className="select-placeholder">
                            <ImageIcon size={48} />
                            <p>Select Photos or Videos</p>
                            <button className="select-btn">Select from gallery</button>
                        </div>
                    )}
                </div>

                <input type="file" ref={fileInputRef} hidden onChange={handleFileSelect} accept="image/*,video/*" />

                <div className="caption-area">
                    <textarea 
                        placeholder="Write a caption..." 
                        value={caption} 
                        onChange={(e) => setCaption(e.target.value)}
                        rows="5"
                    />
                </div>

                {file && file.type.startsWith('video/') && (
                    <div className="toggle-section">
                        <span>Share as Reel</span>
                        <input type="checkbox" checked={isReel} onChange={e => setIsReel(e.target.checked)} />
                    </div>
                )}

                {uploading && (
                    <div className="upload-progress-container">
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <span>{uploadProgress}% yuklanmoqda...</span>
                    </div>
                )}
            </main>

            <BottomNav />

            <style jsx="true">{`
                .create-page { background: var(--bg-primary); min-height: 100vh; padding-bottom: 80px; }
                .create-header { display: flex; align-items: center; justify-content: space-between; padding: 15px 20px; border-bottom: 1px solid var(--border); }
                .create-header h2 { font-size: 1.1rem; font-weight: 800; margin: 0; }
                .create-header button { background: transparent; border: none !important; color: var(--text-primary); }
                .share-btn { color: var(--accent) !important; font-weight: 800; font-size: 1rem; }
                .share-btn:disabled { opacity: 0.5; }

                .create-content { padding: 0; }
                .media-preview-box { width: 100%; aspect-ratio: 1; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; overflow: hidden; cursor: pointer; }
                .media-preview-box.is-video { aspect-ratio: 9/16; max-height: 70vh; }
                .preview-container { width: 100%; height: 100%; position: relative; background: #000; }
                .v-contain { width: 100%; height: 100%; object-fit: contain !important; }
                .preview-container img { width: 100%; height: 100%; object-fit: cover; }
                .remove-media { position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.5); color: white; border-radius: 50%; padding: 8px; }
                
                .select-placeholder { text-align: center; color: var(--text-secondary); }
                .select-btn { margin-top: 15px; background: var(--accent); color: white; padding: 8px 16px; border-radius: 8px; font-weight: 700; }

                .caption-area { padding: 15px; border-bottom: 1px solid var(--border); }
                .caption-area textarea { width: 100%; background: transparent; border: none; color: var(--text-primary); font-size: 1rem; outline: none; resize: none; font-family: inherit; }

                .toggle-section { padding: 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); }
                .toggle-section span { font-weight: 600; }

                .upload-progress-container { padding: 20px; display: flex; flex-direction: column; gap: 10px; align-items: center; }
                .progress-bar-bg { width: 100%; height: 6px; background: var(--bg-secondary); border-radius: 3px; overflow: hidden; }
                .progress-bar-fill { height: 100%; background: var(--accent); transition: width 0.3s; }
                .upload-progress-container span { font-size: 0.9rem; color: var(--text-secondary); font-weight: 600; }
                
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Create;
