import React, { useState, useEffect } from 'react';
import { resetDriveMode, loadContentFromDrive } from '../utils/contentLoader';
import { detectCspIssues, getSuggestedCspFix } from '../utils/cspHelper';

const AdminPanel = ({ isAdmin, reloadFromDrive, saveContentToDrive, driveSaving, driveMessage }) => {
  const [showCspFix, setShowCspFix] = useState(false);
  const [cspIssues, setCspIssues] = useState([]);
  const [loadingFromDrive, setLoadingFromDrive] = useState(false);
  
  useEffect(() => {
    // Check for CSP issues
    const issues = detectCspIssues();
    setCspIssues(issues);
  }, []);
  
  if (!isAdmin) return null;const handleLoadFromDrive = async () => {
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
        <p className="text-xs">Content loads from Google Drive first, then falls back to local files if Drive is unavailable. Use "Save to Google Drive" to save changes.</p>
      </div>
      
      <button
        onClick={saveContentToDrive}
        disabled={driveSaving}
        className={`w-full py-2 rounded-md mb-2 text-white ${
          driveSaving ? 'bg-gray-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        {driveSaving ? 'Saving...' : 'Save to Google Drive'}
      </button>
      
      <button
        onClick={handleLoadFromDrive}
        disabled={loadingFromDrive}
        className={`w-full py-2 rounded-md mb-2 text-white ${
          loadingFromDrive 
            ? 'bg-gray-500 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
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
