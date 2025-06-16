import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = ({ onLoadLocal, onLoadDrive, driveLoaded }) => {
    const [showFallbackMessage, setShowFallbackMessage] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (onLoadDrive) {
            onLoadDrive();
        }
        // After starting drive load, wait 5 seconds before showing fallback
        timeoutRef.current = setTimeout(() => {
            setShowFallbackMessage(true);
        }, 5000);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []); // Empty dependency array to run only once on mount

    // Cancel fallback if driveLoaded becomes true
    useEffect(() => {
        if (driveLoaded) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            setShowFallbackMessage(false);
        }
    }, [driveLoaded]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-gray-950">
            <div className="text-center max-w-md mx-auto px-6">
                {/* Spinning loader */}
                <div className="relative mb-8">
                    <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto" />
                    <div className="absolute inset-0 w-16 h-16 border-2 border-blue-400/20 rounded-full mx-auto"></div>
                </div>
                {/* Loading text */}
                <h2 className="text-2xl font-semibold text-white mb-2">
                    Welcome to my Portfolio!
                </h2>
                <p className="text-blue-200 mb-8">
                    Loading latest content...
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;
