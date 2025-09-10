
import React from 'react';
import { Page } from '../types';
import { HomeIcon, SearchIcon, UploadIcon, VideoLibraryIcon } from './Icons';

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    onUploadClick: () => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
    return (
        <li>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    onClick();
                }}
                className={`flex items-center md:flex-row flex-col gap-1 md:gap-4 p-2 md:p-3 text-white text-xs md:text-base font-medium rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-[var(--accent)] text-black' : 'hover:bg-white/10'
                }`}
            >
                {icon}
                {label}
            </a>
        </li>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, onUploadClick }) => {
    const navItems = [
        { page: Page.Home, label: 'Home', icon: <HomeIcon /> },
        { page: Page.SearchResults, label: 'Search', icon: <SearchIcon /> },
        { page: null, label: 'Upload', icon: <UploadIcon />, action: onUploadClick },
        { page: Page.MyVideos, label: 'My Videos', icon: <VideoLibraryIcon /> },
    ];

    return (
        <nav className="fixed bottom-0 left-0 w-full h-16 md:h-screen md:w-56 bg-black/30 backdrop-blur-xl border-t md:border-t-0 md:border-r border-[var(--border)] z-50">
            <ul className="flex justify-around md:justify-start md:flex-col p-2 md:p-4 md:mt-20 md:space-y-4">
                {navItems.map((item) => (
                    <NavItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        isActive={item.page !== null && currentPage === item.page}
                        onClick={() => item.page ? setCurrentPage(item.page) : (item.action && item.action())}
                    />
                ))}
            </ul>
        </nav>
    );
};

export default Sidebar;
