
import React from 'react';
import { Video, UploadedVideo } from '../types';
import VideoCard from './VideoCard';

interface VideoGridProps {
    videos: (Video | UploadedVideo)[];
    onVideoSelect: (video: Video | UploadedVideo) => void;
    onDelete?: (id: string) => void;
    isLoading?: boolean;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, onVideoSelect, onDelete, isLoading }) => {
    if (isLoading) {
        return (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 py-6">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="bg-[var(--panel)] border border-[var(--border)] rounded-xl animate-pulse">
                        <div className="w-full aspect-video bg-white/20 rounded-t-xl"></div>
                        <div className="p-3 space-y-3">
                            <div className="h-5 bg-white/20 rounded w-3/4"></div>
                            <div className="h-4 bg-white/20 rounded w-1/2"></div>
                            <div className="h-4 bg-white/20 rounded w-1/3"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (videos.length === 0) {
        return <p className="text-center text-lg text-gray-400 mt-8">No videos found.</p>;
    }
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 py-6">
            {videos.map((video) => (
                <VideoCard key={video.id} video={video} onSelect={onVideoSelect} onDelete={onDelete} />
            ))}
        </div>
    );
};

export default VideoGrid;
