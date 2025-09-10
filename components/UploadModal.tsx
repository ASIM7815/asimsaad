import React, { useState, useCallback } from 'react';
import { UploadIcon } from './Icons';

const API_URL = 'http://localhost:3001'; // Backend server URL

interface UploadModalProps {
    onClose: () => void;
    onUploadComplete: () => void;
    setAlert: (alert: { message: string }) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUploadComplete, setAlert }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFileChange = (selectedFile: File | null) => {
        if (selectedFile) {
            if (!selectedFile.type.startsWith('video/')) {
                setAlert({ message: 'Please select a valid video file.' });
                return;
            }
            if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit
                setAlert({ message: 'File is too large. Maximum size is 100MB.' });
                return;
            }
            setFile(selectedFile);
        }
    };
    
    const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(false);
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            handleFileChange(event.dataTransfer.files[0]);
        }
    }, []);

    const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(true);
    };

    const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setAlert({ message: 'Please select a video file.' });
            return;
        }
        if (!title.trim()) {
            setAlert({ message: 'Please enter a title.' });
            return;
        }

        setIsUploading(true);
        setProgress(0);

        try {
            // 1. Get a presigned URL from the backend
            setUploadStatus('Requesting upload URL...');
            const presignedUrlResponse = await fetch(`${API_URL}/api/generate-upload-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: file.name, fileType: file.type }),
            });

            if (!presignedUrlResponse.ok) {
                throw new Error('Could not get an upload URL from the server.');
            }
            const { uploadUrl, fileKey } = await presignedUrlResponse.json();

            // 2. Upload the file directly to S3 using XMLHttpRequest for progress
            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', uploadUrl, true);
                xhr.setRequestHeader('Content-Type', file.type);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        setProgress(percentComplete);
                        setUploadStatus(`Uploading... ${percentComplete}%`);
                    }
                };
                
                xhr.onload = async () => {
                    if (xhr.status === 200) {
                        setUploadStatus('Processing...');
                        // 3. Notify backend that upload is complete
                        await fetch(`${API_URL}/api/upload-complete`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ fileKey, fileName: file.name, fileType: file.type, title, description }),
                        });
                        resolve();
                    } else {
                        reject(new Error(`Upload failed with status: ${xhr.status}`));
                    }
                };
                
                xhr.onerror = () => reject(new Error('Network error during upload.'));
                xhr.send(file);
            });
            
            onUploadComplete();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            setAlert({ message: `Upload failed: ${errorMessage}` });
            setIsUploading(false);
            setProgress(0);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[103]" onClick={onClose}>
            <div className="bg-gradient-to-b from-[#2b2b3e] to-[#1e1e2d] p-6 rounded-2xl shadow-lg w-11/12 max-w-lg border border-[var(--border)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-white">Upload your Video</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onClick={() => document.getElementById('videoFileInput')?.click()}
                        className={`border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center cursor-pointer transition-all duration-200 mb-5 ${isDragOver ? 'border-[var(--accent)] bg-white/10' : ''}`}
                    >
                        <input type="file" id="videoFileInput" accept="video/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
                        <UploadIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-300">Drag & Drop your video here</p>
                        <p className="text-sm text-gray-500">or click to select file</p>
                        {file && <p className="mt-3 text-sm text-[var(--accent)] italic">{file.name}</p>}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="videoTitleInput" className="block mb-2 font-medium text-gray-300">Title</label>
                            <input type="text" id="videoTitleInput" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-white focus:ring-2 focus:ring-[var(--accent)] focus:outline-none" required />
                        </div>
                        <div>
                            <label htmlFor="videoDescInput" className="block mb-2 font-medium text-gray-300">Description</label>
                            <textarea id="videoDescInput" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-white h-24 resize-none focus:ring-2 focus:ring-[var(--accent)] focus:outline-none"></textarea>
                        </div>
                    </div>
                    
                    {isUploading && (
                        <div className="mt-4">
                            <p className="text-center text-sm mb-1">{uploadStatus}</p>
                            <div className="w-full bg-[var(--muted)] rounded-full h-2.5">
                                <div className="bg-[var(--accent)] h-2.5 rounded-full transition-width duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}
                    
                    <button type="submit" disabled={isUploading} className="w-full mt-6 py-3 font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                        {isUploading ? 'Uploading...' : 'Upload Video'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadModal;