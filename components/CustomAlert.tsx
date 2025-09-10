
import React, { useEffect } from 'react';

interface CustomAlertProps {
    message: string;
    onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[101]">
            <div className="bg-gradient-to-br from-[#414345] to-[#232526] p-6 rounded-2xl shadow-xl max-w-sm w-11/12 text-center border border-[var(--border)]">
                <p className="text-white text-base mb-5">{message}</p>
                <button onClick={onClose} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-2 px-6 rounded-lg transition-transform hover:scale-105">
                    OK
                </button>
            </div>
        </div>
    );
};

export default CustomAlert;
