import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = ({ onLoadLocal, onLoadDrive }) => {
    const [countdown, setCountdown] = useState(null);
    const [showFallbackMessage, setShowFallbackMessage] = useState(false);
    const [manualLoadTriggered, setManualLoadTriggered] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [driveLoadStarted, setDriveLoadStarted] = useState(false);
    const timeoutRef = useRef(null);
    const countdownRef = useRef(null);
    const initialLoadRef = useRef(null);
  
    useEffect(() => {
        // Initial 3-second delay before starting to load from Drive
        initialLoadRef.current = setTimeout(() => {
            setInitialLoading(false);
            setDriveLoadStarted(true);
            
            // Start loading from Google Drive
            if (onLoadDrive) {
                onLoadDrive();
            }
            
            // After starting drive load, wait 5 more seconds before showing fallback
            timeoutRef.current = setTimeout(() => {
                if (!manualLoadTriggered) {
                setShowFallbackMessage(true);
                setCountdown(3);
                }
            }, 5000);
        }, 3000);

        return () => {
            if (initialLoadRef.current) {
                clearTimeout(initialLoadRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (countdownRef.current) {
                clearTimeout(countdownRef.current);
            }
        };
    }, []); // Empty dependency array to run only once on mount

    useEffect(() => {
            if (countdown !== null && countdown > 0 && !manualLoadTriggered) {
                countdownRef.current = setTimeout(() => {
                    setCountdown(countdown - 1);
                }, 1000);
                return () => {
                    if (countdownRef.current) {
                    clearTimeout(countdownRef.current);
                    }
                };
            } else if (countdown === 0 && !manualLoadTriggered) {
                // Auto-load local content when countdown reaches 0
                setManualLoadTriggered(true);
                onLoadLocal();
            }
        }, [countdown, onLoadLocal, manualLoadTriggered]);
        const handleManualLoad = () => {
            console.log('Manual load triggered by user');
            setManualLoadTriggered(true);
            
            // Clear all timeouts
            if (initialLoadRef.current) {
                clearTimeout(initialLoadRef.current);
            }
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
                </div>        {/* Loading text */}
                <h2 className="text-2xl font-semibold text-white mb-2">
                    Portfolio
                </h2>        {initialLoading ? (
                    <p className="text-blue-200 mb-8">
                        Preparing to load content ...
                    </p>
                ) : driveLoadStarted ? (
                    <p className="text-blue-200 mb-8">
                        Loading latest content ...
                    </p>
                ) : (
                    <p className="text-blue-200 mb-8">
                        Fetching latest content from Google Drive ...
                    </p>
                )}{/* Fallback button - always visible */}
                <button
                    onClick={handleManualLoad}
                    disabled={manualLoadTriggered}
                    className={`mb-6 px-6 py-3 text-white rounded-lg transition-colors duration-200 border focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900
                        ${manualLoadTriggered 
                            ? 'bg-gray-600 border-gray-600 cursor-not-allowed' 
                            : 'bg-slate-700 hover:bg-slate-600 border-slate-600 hover:border-slate-500'
                        }
                `}>
                    {manualLoadTriggered ? 'Loading Local Content...' : (
                        'Load from Local Files'
                    )}
                </button>{/* Countdown message after 5 seconds */}
                {showFallbackMessage && !manualLoadTriggered && (
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
                                Loading local content...
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoadingScreen;
