import React, { useState, useEffect, useCallback } from 'react';
import { Page, Video, UploadedVideo } from './types';
import { fetchHomePageSections, searchYouTube } from './services/youtubeService';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoGrid from './components/VideoGrid';
import VideoPlayerModal from './components/VideoPlayerModal';
import UploadModal from './components/UploadModal';
import VoiceSearchModal from './components/VoiceSearchModal';
import CustomAlert from './components/CustomAlert';
import useWebSpeech from './hooks/useWebSpeech';
import { YOUTUBE_API_KEY } from './constants';

const API_URL = 'http://localhost:3001'; // Backend server URL

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
    const [videos, setVideos] = useState<Video[]>([]);
    const [homePageVideos, setHomePageVideos] = useState<Record<string, Video[]>>({});
    const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTitle, setSearchTitle] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    
    // Modal states
    const [selectedVideo, setSelectedVideo] = useState<Video | UploadedVideo | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [alert, setAlert] = useState<{ message: string } | null>(null);

    const handleSearch = useCallback(async (query: string) => {
        if (YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
            setAlert({ message: 'Please add your YouTube API Key to the constants.ts file to enable search.' });
            return;
        }
        setIsLoading(true);
        setCurrentPage(Page.SearchResults);
        setSearchQuery(query);
        setSearchTitle(`Searching for "${query}"...`);
        setVideos([]);
        try {
            const results = await searchYouTube(query);
            setVideos(results);
            setSearchTitle(`Results for "${query}"`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            setAlert({ message: `Search failed: ${errorMessage}` });
            setSearchTitle(`Failed to load results for "${query}"`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const { isListening, transcript, startListening, stopListening } = useWebSpeech({
        onResult: (finalTranscript) => {
            setSearchQuery(finalTranscript);
            handleSearch(finalTranscript);
        },
        onError: (error) => {
            setAlert({ message: error });
        }
    });

    useEffect(() => {
        const loadHomePageData = async () => {
             if (YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
                setAlert({ message: 'Please add your YouTube API Key to constants.ts to load videos.' });
                return;
            }
            setIsLoading(true);
            try {
                const sections = await fetchHomePageSections();
                setHomePageVideos(sections);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
                setAlert({ message: `Could not load home page videos: ${errorMessage}` });
            }
            setIsLoading(false);
        };
        loadHomePageData();
    }, []);
    
    const fetchMyVideos = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/my-videos`);
            if (!response.ok) {
                throw new Error('Could not fetch videos from server.');
            }
            const data = await response.json();
            setUploadedVideos(data);
        } catch (error) {
            console.error("Failed to load uploaded videos from server", error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            setAlert({ message: `Error loading your videos: ${errorMessage}` });
        }
    }, []);

    useEffect(() => {
        if (currentPage === Page.MyVideos) {
            fetchMyVideos();
        }
    }, [currentPage, fetchMyVideos]);

    const handleUploadComplete = () => {
        setAlert({ message: 'Video uploaded successfully!' });
        setIsUploadModalOpen(false);
        // Refresh videos if we are on the MyVideos page
        if (currentPage === Page.MyVideos) {
            fetchMyVideos();
        }
    };

    const handleDeleteVideo = async (id: string) => {
        if(window.confirm('Are you sure you want to delete this video? This is permanent.')){
           try {
                const response = await fetch(`${API_URL}/api/videos/${id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete video.');
                }
                setUploadedVideos(uploadedVideos.filter(v => v.id !== id));
                setAlert({ message: 'Video deleted successfully.' });
           } catch(error) {
                console.error("Failed to delete video", error);
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
                setAlert({ message: `Error deleting video: ${errorMessage}` });
           }
        }
    };

    const renderContent = () => {
        switch (currentPage) {
            case Page.Home:
                return (
                    <div>
                        <h2 className="text-2xl mb-4 mt-10 text-white border-b-2 border-[var(--accent)] pb-2 inline-block">What is...</h2>
                        <VideoGrid videos={homePageVideos['whatIs'] || []} onVideoSelect={setSelectedVideo} />
                        <h2 className="text-2xl mb-4 mt-10 text-white border-b-2 border-[var(--accent)] pb-2 inline-block">How to...</h2>
                        <VideoGrid videos={homePageVideos['howTo'] || []} onVideoSelect={setSelectedVideo} />
                        <h2 className="text-2xl mb-4 mt-10 text-white border-b-2 border-[var(--accent)] pb-2 inline-block">Free Courses</h2>
                        <VideoGrid videos={homePageVideos['courses'] || []} onVideoSelect={setSelectedVideo} />
                    </div>
                );
            case Page.SearchResults:
                return (
                    <div>
                        <h2 className="text-2xl mb-4 mt-10 text-white border-b-2 border-[var(--accent)] pb-2 inline-block">{searchTitle}</h2>
                        <VideoGrid videos={videos} isLoading={isLoading} onVideoSelect={setSelectedVideo} />
                    </div>
                );
            case Page.MyVideos:
                 return (
                    <div>
                        <h2 className="text-2xl mb-4 mt-10 text-white border-b-2 border-[var(--accent)] pb-2 inline-block">My Uploaded Videos</h2>
                        {uploadedVideos.length === 0 ? (
                             <p className="text-center text-lg text-gray-400 mt-8">
                                No videos uploaded yet. {' '}
                                <button onClick={() => setIsUploadModalOpen(true)} className="text-[var(--accent)] hover:underline">
                                    Upload your first video!
                                </button>
                            </p>
                        ) : (
                             <VideoGrid videos={uploadedVideos} onVideoSelect={setSelectedVideo} onDelete={handleDeleteVideo} />
                        )}
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="bg-[#111] min-h-screen text-[var(--text)] font-sans">
             <video autoPlay loop muted playsInline id="background-video" className="fixed top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto z-0 transform -translate-x-1/2 -translate-y-1/2 bg-cover opacity-70">
                <source src="https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4" type="video/mp4" />
            </video>
            <div className="relative z-10 flex flex-col md:flex-row">
                <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onUploadClick={() => setIsUploadModalOpen(true)} />
                <div className="flex-1 md:ml-56">
                    <Header
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onSearch={handleSearch}
                        onVoiceSearch={startListening}
                    />
                    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-[var(--text-dim)]">
                        {renderContent()}
                    </main>
                </div>
            </div>
            
            {selectedVideo && <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />}
            {isUploadModalOpen && <UploadModal onClose={() => setIsUploadModalOpen(false)} onUploadComplete={handleUploadComplete} setAlert={setAlert} />}
            {isListening && <VoiceSearchModal transcript={transcript} onClose={stopListening} />}
            {alert && <CustomAlert message={alert.message} onClose={() => setAlert(null)} />}
        </div>
    );
};

export default App;