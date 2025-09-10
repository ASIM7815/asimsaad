import React, { useEffect } from 'react';
import { Video, UploadedVideo } from '../types';

interface VideoPlayerModalProps {
    video: Video | UploadedVideo;
    onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const isUploaded = video.type === 'uploaded';
    const uploadedVideo = isUploaded ? (video as UploadedVideo) : null;
    const youtubeVideo = !isUploaded ? (video as Video) : null;

    let embedUrl = '';
    if (youtubeVideo) {
        embedUrl = youtubeVideo.type === 'video'
            ? `https://www.youtube.com/embed/${youtubeVideo.id}?autoplay=1&rel=0`
            : `https://www.youtube.com/embed/videoseries?list=${youtubeVideo.id}&autoplay=1&rel=0`;
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[102]" onClick={onClose}>
            <div className="relative w-11/12 max-w-4xl bg-[#181818] rounded-2xl p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute -top-4 -right-4 w-10 h-10 bg-white text-black rounded-full text-2xl font-bold flex items-center justify-center transition-transform hover:scale-110">
                    &times;
                </button>
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                    {isUploaded ? (
                        <video src={uploadedVideo?.publicUrl} controls autoPlay className="w-full h-full" />
                    ) : (
                        <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    )}
                </div>
                <h3 className="text-white text-xl font-bold mt-4 line-clamp-2">{video.title}</h3>
                <p className="text-gray-400 text-base">{isUploaded ? 'My Upload' : youtubeVideo?.channel}</p>
            </div>
        </div>
    );
};

export default VideoPlayerModal;