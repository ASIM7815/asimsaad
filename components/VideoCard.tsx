import React from 'react';
import { Video, UploadedVideo } from '../types';

interface VideoCardProps {
    video: Video | UploadedVideo;
    onSelect: (video: Video | UploadedVideo) => void;
    onDelete?: (id: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect, onDelete }) => {
    const isUploaded = video.type === 'uploaded';
    
    // For uploaded videos, we'll use a placeholder thumbnail. Generating thumbnails is a more advanced backend process.
    const thumbnailUrl = isUploaded ? `https://picsum.photos/seed/${video.id}/400/225` : (video as Video).thumbnailUrl;
    const channel = isUploaded ? 'My Upload' : (video as Video).channel;
    const uploadedDate = isUploaded ? `Uploaded on ${new Date((video as UploadedVideo).uploadedAt).toLocaleDateString()}` : (video as Video).uploaded;

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete) {
            onDelete(video.id);
        }
    }

    return (
        <div className="bg-[var(--panel)] border border-[var(--border)] rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:transform hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/50">
            <div className="relative" onClick={() => onSelect(video)}>
                <img
                    src={thumbnailUrl}
                    alt={video.title}
                    className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300"></div>
            </div>
            <div className="p-3">
                <h3 className="font-semibold text-white text-base line-clamp-2 h-[48px] mb-2 group-hover:text-[var(--accent)] transition-colors" title={video.title}>
                    {video.title}
                </h3>
                <p className="text-sm text-gray-300 truncate">{channel}</p>
                <p className="text-xs text-gray-400">{uploadedDate}</p>
                {isUploaded && onDelete && (
                     <div className="mt-3 flex gap-2">
                        <button onClick={() => onSelect(video)} className="text-sm bg-[var(--accent)] text-black px-3 py-1 rounded-md font-semibold hover:opacity-80 transition-opacity">Play</button>
                        <button onClick={handleDelete} className="text-sm bg-red-600 text-white px-3 py-1 rounded-md font-semibold hover:bg-red-700 transition-colors">Delete</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoCard;