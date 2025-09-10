
import React from 'react';
import { SearchIcon, XIcon, MicrophoneIcon } from './Icons';

interface HeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onSearch: (query: string) => void;
    onVoiceSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery, onSearch, onVoiceSearch }) => {

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearch(searchQuery);
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-black/30 backdrop-blur-xl border-b border-[var(--border)]">
            <div className="max-w-7xl mx-auto grid grid-cols-[auto,1fr,auto] md:grid-cols-[1fr,minmax(300px,700px),1fr] gap-3 items-center p-3">
                <div className="hidden md:flex items-center gap-2 cursor-pointer">
                    <img src="https://picsum.photos/40/40?random=1" alt="EduTube Logo" className="h-10 rounded-lg" />
                    <div className="font-bold text-xl text-white tracking-wide">
                        Edu<span>Tube</span>
                    </div>
                </div>

                <div className="col-start-1 md:col-start-2 col-span-3 md:col-span-1 w-full">
                    <form onSubmit={handleSubmit} className="flex items-stretch w-full">
                        <div className="flex-1 flex items-center gap-2 bg-[var(--muted)] border border-[var(--border)] border-r-0 rounded-l-full px-4 relative transition-all duration-300 focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:bg-white/20">
                           <SearchIcon className="w-5 h-5 text-white/90" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="flex-1 bg-transparent border-none text-white text-base leading-10 h-10 focus:outline-none"
                            />
                            {searchQuery && (
                                <button type="button" onClick={() => setSearchQuery('')} className="text-white/75 hover:text-white hover:scale-110 transition-transform">
                                    <XIcon className="w-5 h-5" />
                                </button>
                            )}
                            <span className="w-px bg-[var(--border)] h-6 mx-1"></span>
                            <button type="button" onClick={onVoiceSearch} className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-white flex items-center justify-center transition-transform hover:scale-110 shadow-lg">
                                <MicrophoneIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <button type="submit" className="min-w-[64px] h-10 rounded-r-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-bold transition-transform hover:scale-105 shadow-lg">
                            Search
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
};

export default Header;
