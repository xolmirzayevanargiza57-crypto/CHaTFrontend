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
                <h2>{t.newPost}</h2>
                <button className="share-btn" disabled={!file || uploading} onClick={handleUpload}>
                    {uploading ? <Loader className="spin" size={20} /> : t.share}
                </button>
            </header>

            <main className="create-content">
                <div className="caption-area">
                    <textarea 
                        placeholder={t.writeCaption}
                        value={caption} 
                        onChange={(e) => setCaption(e.target.value)}
                        rows="4"
                        style={{ fontSize: '1.2rem', fontWeight: '500' }}
                    />
                </div>

                <div className={`media-preview-box ${isReel ? 'is-video' : ''}`} onClick={() => !file && fileInputRef.current.click()}>
                    {preview ? (
                        <div className="preview-container">
                            {file.type.startsWith('video/') ? <video src={preview} controls className="v-contain" /> : <img src={preview} alt="v" />}
                            <button className="remove-media" onClick={(e) => { e.stopPropagation(); setPreview(null); setFile(null); }}><X size={20} /></button>
                        </div>
                    ) : (
                        <div className="select-placeholder">
                            <ImageIcon size={48} />
                            <p>{t.selectPhotos}</p>
                            <button className="select-btn">{t.gallery}</button>
                        </div>
                    )}
                </div>

                <input type="file" ref={fileInputRef} hidden onChange={handleFileSelect} accept="image/*,video/*" />

                {file && file.type.startsWith('video/') && (
                    <div className="toggle-section">
                        <span>{t.shareAsReel}</span>
                        <input type="checkbox" checked={isReel} onChange={e => setIsReel(e.target.checked)} />
                    </div>
                )}

                {uploading && (
                    <div className="upload-progress-container">
                        <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <span>{uploadProgress}% {t.uploadingStatus}</span>
                    </div>
                )}
            </main>

            <BottomNav />

            <style jsx="true">{`
                .create-page { background: var(--bg-primary); min-height: 100vh; padding-bottom: 80px; display: flex; flex-direction: column; }
                .create-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg-primary); z-index: 100; }
                .create-header h2 { font-size: 1.1rem; font-weight: 800; margin: 0; }
                .create-header button { background: transparent; border: none !important; color: var(--text-primary); padding: 4px; }
                .share-btn { 
                    background: var(--accent) !important; 
                    color: white !important; 
                    padding: 8px 20px !important; 
                    border-radius: 8px;
                    font-weight: 700; 
                    font-size: 0.95rem; 
                }
                .share-btn:disabled { opacity: 0.5; }

                .create-content { flex: 1; display: flex; flex-direction: column; }
                .caption-area { padding: 20px 16px; border-bottom: 1px solid var(--border); }
                .caption-area textarea { 
                    width: 100%; 
                    background: transparent; 
                    border: none !important; 
                    color: var(--text-primary); 
                    font-size: 1.15rem; 
                    outline: none; 
                    resize: none; 
                    font-family: inherit; 
                    font-weight: 500;
                }

                .media-preview-box { 
                    width: 100%; 
                    background: var(--bg-secondary); 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    overflow: hidden; 
                    cursor: pointer; 
                }
                .media-preview-box:not(.is-video) { aspect-ratio: 1; }
                .media-preview-box.is-video { aspect-ratio: 9/16; max-height: 60vh; }
                
                .preview-container { width: 100%; height: 100%; position: relative; background: #000; }
                .v-contain { width: 100%; height: 100%; object-fit: contain !important; }
                .preview-container img { width: 100%; height: 100%; object-fit: cover; }
                .remove-media { position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.5); color: white; border-radius: 50%; padding: 8px; }
                
                .select-placeholder { text-align: center; color: var(--text-secondary); padding: 40px 20px; }
                .select-btn { margin-top: 15px; background: var(--bg-primary); border: 1px solid var(--border) !important; color: var(--text-primary); padding: 10px 20px; border-radius: 8px; font-weight: 700; }

                .toggle-section { padding: 15px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); }
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
