
import React from 'react';
import { MicrophoneIcon } from './Icons';

interface VoiceSearchModalProps {
    transcript: string;
    onClose: () => void;
}

const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({ transcript, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={onClose}>
            <div className="text-center text-white" onClick={(e) => e.stopPropagation()}>
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center mx-auto mb-5 animate-pulse">
                    <MicrophoneIcon className="w-12 h-12" />
                </div>
                <p className="text-2xl font-medium mb-2">Listening...</p>
                <p className="text-lg text-gray-300 min-h-[28px]">{transcript}</p>
            </div>
        </div>
    );
};

export default VoiceSearchModal;
