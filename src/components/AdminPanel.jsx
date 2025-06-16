import { useState } from 'react';

const AdminPanel = ({ 
  isAdmin, 
  saveContentToDrive, 
  driveSaving, 
  driveMessage, 
  screenSize = 'desktop',
  content,
  loadLocalContent,
  loadContentFromDrive,
  loading,
  onClose
}) => {
  const [switchingContent, setSwitchingContent] = useState(false);
  
  if (!isAdmin) return null;

  // Determine current content source
  const isUsingLocalContent = content?.fallbackUsed || false;

  const handleToggleContentSource = async () => {
    setSwitchingContent(true);
    try {
      if (isUsingLocalContent) {
        // Currently using local, switch to Drive
        console.log('Switching from local to Drive content...');
        // Force fresh load from Drive by clearing all caches first
        try {
          const { clearContentCache } = await import('../utils/contentLoader');
          clearContentCache(); // Clear module cache
          
          // Use simple public fetch method
          await loadContentFromDrive(false);
          
          console.log('Successfully loaded fresh Drive content for admin');
        } catch (importError) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Using fallback method in development mode');
          } else {
            console.warn('Could not import load functions, using standard method');
          }
          await loadContentFromDrive(false);
        }
      } else {
        // Currently using Drive, switch to Local
        console.log('Switching from Drive to local content...');
        await loadLocalContent(false); // Pass false to prevent loading screen
      }
    } catch (error) {
      console.error('Error switching content source:', error);
      alert('Failed to switch content source: ' + error.message);
    } finally {
      setSwitchingContent(false);
    }
  };
  
  const handleRefreshContent = async () => {
    console.log('AdminPanel: Refreshing current content source');
    setSwitchingContent(true);
    try {
      if (isUsingLocalContent) {
        // Currently using local content, refresh local
        console.log('Refreshing local content...');
        await loadLocalContent(false); // Pass false to prevent loading screen
      } else {
        // Currently using Drive content, refresh from Drive
        console.log('Refreshing Drive content...');
        // Force fresh load from Drive by clearing caches first
        try {
          const { clearContentCache } = await import('../utils/contentLoader');
          clearContentCache(); // Clear module cache
          await loadContentFromDrive(false); // Pass false to prevent loading screen
        } catch (importError) {
          console.warn('Could not import fresh load functions, using standard method');
          await loadContentFromDrive(false);
        }
      }
      console.log('Successfully refreshed content');
    } catch (error) {
      console.error('Error refreshing content:', error);
      alert('Failed to refresh content: ' + error.message);
    } finally {
      setSwitchingContent(false);
    }
  };
  
  // Mobile/Tablet - admin buttons are now in the Sidebar popup menu
  if (screenSize === 'mobile' || screenSize === 'tablet') {
    return null; // No separate admin panel for mobile, integrated into sidebar
  }

  // Desktop layout (original full panel)
  return (
    <div className="fixed top-8 right-8 z-50 bg-slate-800 text-white p-4 rounded-lg shadow-lg max-w-md">
      {/* Close button for desktop floating panel */}
      {typeof onClose === 'function' && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-300 hover:text-red-500 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Close Admin Panel"
        >
          ×
        </button>
      )}
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
      
      <div className="mb-4 p-3 bg-slate-700 rounded-md">
        <p className="text-sm font-semibold mb-1">📂 Content Source</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs">
              Currently using: <span className={`font-semibold ${isUsingLocalContent ? 'text-yellow-300' : 'text-blue-300'}`}>
                {isUsingLocalContent ? 'Local Files' : 'Google Drive'}
              </span>
            </p>
            {loading && <p className="text-xs text-gray-400 mt-1">Loading content...</p>}
          </div>
        </div>
      </div>

      {/* Content Management Buttons */}
      <div className="mb-4 flex gap-2 flex-col">
        <div className="flex gap-2">
          <button
            onClick={handleRefreshContent}
            disabled={switchingContent || loading}
            className={`flex-1 py-2 rounded-md text-white text-sm ${
              switchingContent || loading
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {switchingContent ? 'Refreshing...' : 'Refresh Content'}
          </button>
          <button
            onClick={saveContentToDrive}
            disabled={driveSaving || loading}
            className={`flex-1 py-2 rounded-md text-white text-sm ${
              driveSaving || loading
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {driveSaving ? 'Saving...' : 'Save to Drive'}
          </button>
        </div>        <button
          onClick={handleToggleContentSource}
          disabled={switchingContent || loading}
          className={`w-full py-2 rounded-md text-white text-sm ${
            switchingContent || loading
              ? 'bg-gray-500 cursor-not-allowed' 
              : isUsingLocalContent 
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-orange-600 hover:bg-orange-700'
          }`}
        >
          {switchingContent 
            ? 'Switching...' 
            : isUsingLocalContent 
              ? '🌐 Load from Google Drive' 
              : '📁 Load from Local Files'
          }
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
