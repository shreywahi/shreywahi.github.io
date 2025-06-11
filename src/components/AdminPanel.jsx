import React, { useState, useEffect } from 'react';
import { toggleLocalContentMode } from '../utils/driveContentManager';
import { resetDriveMode } from '../utils/contentLoader';
import { detectCspIssues, getSuggestedCspFix } from '../utils/cspHelper';

const AdminPanel = ({ isAdmin }) => {
  const [useLocalContent, setUseLocalContent] = useState(false);
  const [showCspFix, setShowCspFix] = useState(false);
  const [cspIssues, setCspIssues] = useState([]);
  
  useEffect(() => {
    // Check localStorage on mount
    try {
      setUseLocalContent(localStorage.getItem('useLocalContent') === 'true');
    } catch (e) {
      // Ignore storage errors
    }
    
    // Check for CSP issues
    const issues = detectCspIssues();
    setCspIssues(issues);
  }, []);
  
  if (!isAdmin) return null;
  
  const handleToggle = async () => {
    const newValue = !useLocalContent;
    console.log(`AdminPanel: Toggling to ${newValue ? 'local' : 'Drive'} content mode`);
    
    setUseLocalContent(newValue);
    toggleLocalContentMode(newValue);
    
    // Always reload the page when toggling to ensure clean state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };
  
  const handleReset = async () => {
    console.log('AdminPanel: Resetting to Drive mode');
    setUseLocalContent(false);
    
    try {
      // Clear all content-related localStorage
      localStorage.removeItem('cachedContent');
      localStorage.removeItem('contentCacheTime');
      localStorage.removeItem('useLocalContent');
      
      // Reset drive content manager flags
      const { resetContentState } = await import('../utils/driveContentManager');
      resetContentState();
      
      await resetDriveMode();
      
      // Force reload
      window.location.reload();
    } catch (e) {
      console.error('Error resetting Drive mode:', e);
      window.location.reload();
    }
  };
  
  const cspFix = getSuggestedCspFix();
  const hasCspIssues = cspIssues.length > 0 || window.googleCspBlocked;
  
  return (
    <div className="fixed bottom-20 right-4 z-50 bg-slate-800 text-white p-4 rounded-lg shadow-lg max-w-md">
      <h3 className="text-lg font-bold mb-2">Admin Content Settings</h3>
      
      {hasCspIssues && (
        <div className="mb-4 p-3 bg-red-900 rounded-md">
          <p className="text-sm font-semibold mb-1">⚠️ CSP Issues Detected</p>
          <p className="text-xs">Google Drive access is blocked by Content Security Policy.</p>
          <button
            onClick={() => setShowCspFix(!showCspFix)}
            className="text-xs underline mt-1"
          >
            {showCspFix ? 'Hide Fix' : 'Show Fix'}
          </button>
        </div>
      )}
      
      {showCspFix && (
        <div className="mb-4 p-3 bg-slate-700 rounded-md text-xs">
          <p className="font-semibold mb-2">Add this to your HTML head:</p>
          <textarea 
            readOnly 
            value={cspFix.html}
            className="w-full h-32 bg-slate-900 text-white p-2 rounded text-xs font-mono"
          />
          <button
            onClick={() => navigator.clipboard.writeText(cspFix.html)}
            className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs"
          >
            Copy to Clipboard
          </button>
        </div>
      )}
      
      <div className="flex items-center mb-4">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={useLocalContent} 
              onChange={handleToggle} 
            />
            <div className={`block w-14 h-8 rounded-full ${useLocalContent ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${useLocalContent ? 'translate-x-6' : ''}`}></div>
          </div>
          <div className="ml-3 text-sm font-medium">
            {useLocalContent ? 'Using Local Content' : 'Using Google Drive'}
          </div>
        </label>
      </div>
      
      <button
        onClick={handleReset}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md mb-2"
      >
        Reset & Try Google Drive
      </button>
    </div>
  );
};

export default AdminPanel;
