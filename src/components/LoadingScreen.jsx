import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

// Add driveLoaded prop
const LoadingScreen = ({ onLoadLocal, onLoadDrive, driveLoaded }) => {
    const [countdown, setCountdown] = useState(null);
    const [showFallbackMessage, setShowFallbackMessage] = useState(false);
    const [manualLoadTriggered, setManualLoadTriggered] = useState(false);
    const timeoutRef = useRef(null);
    const countdownRef = useRef(null);

    useEffect(() => {
        if (onLoadDrive) {
            onLoadDrive();
        }
        // After starting drive load, wait 5 seconds before showing fallback
        timeoutRef.current = setTimeout(() => {
            if (!manualLoadTriggered) {
                setShowFallbackMessage(true);
                setCountdown(3);
            }
        }, 5000);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (countdownRef.current) {
                clearTimeout(countdownRef.current);
            }
        };
    }, []); // Empty dependency array to run only once on mount

    // Cancel fallback and countdown if driveLoaded becomes true
    useEffect(() => {
        if (driveLoaded) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (countdownRef.current) {
                clearTimeout(countdownRef.current);
            }
            setShowFallbackMessage(false);
            setCountdown(null);
        }
    }, [driveLoaded]);

    useEffect(() => {
        if (countdown !== null && countdown > 0 && !manualLoadTriggered && !driveLoaded) {
            countdownRef.current = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => {
                if (countdownRef.current) {
                    clearTimeout(countdownRef.current);
                }
            };
        } else if (countdown === 0 && !manualLoadTriggered && !driveLoaded) {
            // Auto-load local content when countdown reaches 0
            setManualLoadTriggered(true);
            onLoadLocal();
        }
    }, [countdown, onLoadLocal, manualLoadTriggered, driveLoaded]);

    const handleManualLoad = () => {
        console.log('Manual load triggered by user');
        setManualLoadTriggered(true);
        // Clear all timeouts
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (countdownRef.current) {
            clearTimeout(countdownRef.current);
        }
        // Call the load function
        onLoadLocal();
    };

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
                    Portfolio
                </h2>
                <p className="text-blue-200 mb-8">
                    Loading latest content from Resume...
                </p>
                {/* Fallback button - always visible */}
                <button
                    onClick={handleManualLoad}
                    disabled={manualLoadTriggered || driveLoaded}
                    className={`mb-6 px-6 py-3 text-white rounded-lg transition-colors duration-200 border focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900
                        ${(manualLoadTriggered || driveLoaded)
                            ? 'bg-gray-600 border-gray-600 cursor-not-allowed'
                            : 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-slate-500'
                        }
                `}>
                    {manualLoadTriggered ? 'Loading Local Content...' : (
                        driveLoaded ? 'Loaded from Drive' : 'Load from Local Files'
                    )}
                </button>
                {/* Countdown message after 5 seconds */}
                {showFallbackMessage && !manualLoadTriggered && !driveLoaded && (
                    <div className="text-center animate-fade-in">
                        <p className="text-orange-300 text-sm mb-2">
                            Taking longer than expected...
                        </p>
                        {countdown !== null && countdown > 0 && (
                            <p className="text-yellow-300 text-sm">
                                Retrieving last best content in <span className="font-mono font-bold text-lg">{countdown}</span>
                            </p>
                        )}
                        {countdown === 0 && (
                            <p className="text-green-300 text-sm">
                                Loading last updated content...
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoadingScreen;
