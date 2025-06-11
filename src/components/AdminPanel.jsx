import React, { useState, useEffect } from 'react';
import { resetDriveMode, loadContentFromDrive } from '../utils/contentLoader';
import { detectCspIssues, getSuggestedCspFix } from '../utils/cspHelper';
import { toggleLocalContentMode } from '../utils/driveContentManager';

const AdminPanel = ({ isAdmin, reloadFromDrive, saveContentToDrive, driveSaving, driveMessage, screenSize = 'desktop' }) => {
  const [showCspFix, setShowCspFix] = useState(false);
  const [cspIssues, setCspIssues] = useState([]);
  const [loadingFromDrive, setLoadingFromDrive] = useState(false);
  const [usingLocalContent, setUsingLocalContent] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('useLocalContent') === 'true';
    }
    return false;
  });
  
  useEffect(() => {
    // Check for CSP issues
    const issues = detectCspIssues();
    setCspIssues(issues);
    
    // Check current content source
    const isUsingLocal = localStorage.getItem('useLocalContent') === 'true';
    setUsingLocalContent(isUsingLocal);
  }, []);
  
  if (!isAdmin) return null;
  const handleLoadFromDrive = async () => {
    console.log('AdminPanel: Loading latest content from Drive');
    setLoadingFromDrive(true);
    
    try {
      if (reloadFromDrive) {
        // Use the hook's reload function if available
        const success = await reloadFromDrive();
        if (success) {
          console.log('Successfully reloaded content from Drive');
        } else {
          throw new Error('Failed to reload content');
        }
      } else {
        // Fallback to direct load and reload
        await loadContentFromDrive();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error loading from Drive:', error);
      alert('Failed to load content from Drive: ' + error.message);
    } finally {
      setLoadingFromDrive(false);
    }
  };

  const handleSwitchToLocal = async () => {
    console.log('AdminPanel: Switching to local content');
    
    try {
      // Enable local content mode
      toggleLocalContentMode(true);
      setUsingLocalContent(true);
      
      // Force reload to use local content
      window.location.reload();
    } catch (error) {
      console.error('Error switching to local content:', error);
      alert('Failed to switch to local content: ' + error.message);
    }
  };

  const handleSwitchToDrive = async () => {
    console.log('AdminPanel: Switching back to Drive content');
    
    try {
      // Disable local content mode
      toggleLocalContentMode(false);
      setUsingLocalContent(false);
      
      // Force reload to try Drive content again
      window.location.reload();
    } catch (error) {
      console.error('Error switching to Drive content:', error);
      alert('Failed to switch to Drive content: ' + error.message);
    }
  };

  const handleReset = async () => {
    console.log('AdminPanel: Resetting Drive content cache');
    
    try {
      // Clear all content-related localStorage
      localStorage.removeItem('cachedContent');
      localStorage.removeItem('contentCacheTime');
      localStorage.removeItem('useLocalContent');
      
      // Reset drive content manager flags
      const { resetContentState } = await import('../utils/driveContentManager');
      resetContentState();
      
      await resetDriveMode();
      
      // Set a flag to indicate we want to load from Drive on next load
      localStorage.setItem('loadFromDriveOnStart', 'true');
      
      // Force reload
      window.location.reload();
    } catch (e) {
      console.error('Error resetting Drive mode:', e);
      // Set the flag even if reset fails, then reload
      localStorage.setItem('loadFromDriveOnStart', 'true');
      window.location.reload();
    }
  };  
  const cspFix = getSuggestedCspFix();
  const hasCspIssues = cspIssues.length > 0 || window.googleCspBlocked;
  
  const handleToggleLocalContent = () => {
    const newValue = !usingLocalContent;
    setUsingLocalContent(newValue);
    localStorage.setItem('useLocalContent', newValue);
    toggleLocalContentMode(newValue);
    
    if (newValue) {
      alert('Switched to local content. Please reload the page.');
    } else {
      alert('Switched to Google Drive content. Please reload the page.');
    }
  };
  // Mobile/Tablet layout with 2x2 grid
  if (screenSize === 'mobile' || screenSize === 'tablet') {
    return (
      <div className="fixed top-8 right-4 z-50 pt-4">
        <div className="grid grid-cols-2 gap-2 w-64">          {/* Use Local / Switch to Drive */}
          {usingLocalContent ? (
            <button
              onClick={handleSwitchToDrive}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium"
            >
              Switch to Drive
            </button>
          ) : (
            <button
              onClick={handleSwitchToLocal}
              className="px-2 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-xs font-medium"
            >
              Use Local
            </button>
          )}
          
          {/* Save to Drive */}
          <button
            onClick={saveContentToDrive}
            disabled={driveSaving || usingLocalContent}
            className={`px-2 py-1 rounded-md text-xs font-medium ${
              driveSaving || usingLocalContent 
                ? 'bg-gray-500 cursor-not-allowed text-gray-300' 
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
            title={usingLocalContent ? 'Cannot save to Drive while in local content mode' : ''}
          >
            {driveSaving ? 'Saving...' : 'Save to Drive'}
          </button>
          
          {/* Reset/Reload */}
          <button
            onClick={handleReset}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium"
          >
            Reset/Reload
          </button>
          
          {/* Load from Drive */}
          <button
            onClick={handleLoadFromDrive}
            disabled={loadingFromDrive || usingLocalContent}
            className={`px-2 py-1 rounded-md text-xs font-medium ${
              loadingFromDrive || usingLocalContent
                ? 'bg-gray-500 cursor-not-allowed text-gray-300' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            title={usingLocalContent ? 'Cannot load from Drive while in local content mode' : ''}
          >
            {loadingFromDrive ? 'Loading...' : 'Load from Drive'}
          </button>
        </div>
      </div>
    );
  }

  // Desktop layout (original full panel)
  return (
    <div className="fixed top-8 right-8 z-50 bg-slate-800 text-white p-4 rounded-lg shadow-lg max-w-md">
      <h3 className="text-lg font-bold mb-2">Admin Content Settings</h3>
      
      {/* Drive Message */}
      {driveMessage && (
        <div className={`mb-4 p-3 rounded-md ${
          driveMessage.type === 'error' ? 'bg-red-900' : 
          driveMessage.type === 'success' ? 'bg-green-900' : 
          'bg-blue-900'
        }`}>
          <p className="text-sm">{driveMessage.text}</p>
        </div>
      )}
      
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
          </button>        </div>
      )}      <div className="mb-4 p-3 bg-slate-700 rounded-md">
        <p className="text-sm font-semibold mb-1">📂 Content Source</p>
        <p className="text-xs">
          Currently using: <span className="font-semibold text-yellow-300">
            {usingLocalContent ? 'Local Files (content.json)' : 'Google Drive (with local fallback)'}
          </span>
        </p>
        <p className="text-xs mt-1">
          {usingLocalContent 
            ? 'Content loads from local files. Switch to Drive mode to sync with Google Drive.'
            : 'Content loads from Google Drive first, then falls back to local files if Drive is unavailable.'
          }
        </p>
      </div>
      
      {/* Content Source Toggle Buttons */}
      <div className="mb-4 flex gap-2">
        {usingLocalContent ? (
          <button
            onClick={handleSwitchToDrive}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
          >
            Switch to Drive Mode
          </button>
        ) : (
          <button
            onClick={handleSwitchToLocal}
            className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md text-sm"
          >
            Use Local Content
          </button>
        )}
      </div>
      
      <button
        onClick={saveContentToDrive}
        disabled={driveSaving || usingLocalContent}
        className={`w-full py-2 rounded-md mb-2 text-white ${
          driveSaving || usingLocalContent 
            ? 'bg-gray-500 cursor-not-allowed' 
            : 'bg-purple-600 hover:bg-purple-700'
        }`}
        title={usingLocalContent ? 'Cannot save to Drive while in local content mode' : ''}
      >
        {driveSaving ? 'Saving...' : 'Save to Google Drive'}
      </button>
      
      <button
        onClick={handleLoadFromDrive}
        disabled={loadingFromDrive || usingLocalContent}
        className={`w-full py-2 rounded-md mb-2 text-white ${
          loadingFromDrive || usingLocalContent
            ? 'bg-gray-500 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
        title={usingLocalContent ? 'Cannot load from Drive while in local content mode' : ''}
      >
        {loadingFromDrive ? 'Loading from Drive...' : 'Load Latest from Drive'}
      </button>
      
      <button
        onClick={handleReset}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md mb-2"
      >
        Reset Drive Cache & Reload
      </button>
    </div>
  );
};

export default AdminPanel;
