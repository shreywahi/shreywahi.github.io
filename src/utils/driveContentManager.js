import { gapi } from 'gapi-script';
import defaultContentData from '../data/content.json';
import { GOOGLE_API_CONFIG } from '../config'; // Import the configuration

/**
 * Google Drive Content Manager
 * 
 * FETCHING CONTENT (Public): Uses simple fetch() calls to public Google Drive URLs - no authentication required
 * SAVING CONTENT (Admin): Uses Google Drive API with authentication - requires gapi and user sign-in
 * 
 * This hybrid approach eliminates CORS issues for content loading while still supporting 
 * authenticated operations for content saving.
 */

// Use configuration from config.js
const API_KEY = GOOGLE_API_CONFIG.API_KEY;
const CLIENT_ID = GOOGLE_API_CONFIG.CLIENT_ID;
const INITIAL_DRIVE_FILE_ID = GOOGLE_API_CONFIG.DRIVE_FILE_ID; // Store JSON file ID
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

// Use the imported content.json as default content
const defaultContent = defaultContentData;

// Flag to track initialization state and prevent multiple logs
let isInitialized = false;
let hasLoggedSignInStatus = false;
let hasCspError = false;
let forceLocalContent = false; // New flag to completely bypass Drive

// Enhanced CSP error detection for Google authentication
const checkForCspErrors = () => {
  try {
    // Check for URL params that might force local content
    if (typeof window !== 'undefined' && window.location.search.includes('localContent=true')) {
      return true;
    }
    
    // Check localStorage for a manual override
    if (typeof window !== 'undefined' && localStorage.getItem('useLocalContent') === 'true') {
      return true;
    }
        
    // Look for CSP errors in recent console messages
    if (typeof window !== 'undefined' && window.cspErrors && window.cspErrors.length > 0) {
      return true;
    }
    
    // Check for Google-specific CSP indicators
    if (typeof window !== 'undefined' && window.googleCspBlocked) {
      return true;
    }
    
    return false;
  } catch (e) {
    // If any error occurs during check, assume no CSP error to avoid breaking functionality
    // console.warn('Error in checkForCspErrors:', e); // Optional: for debugging
    return false;
  }
};

// Enhanced CSP error listener
if (typeof window !== 'undefined') {
  // Store CSP errors for detection
  window.cspErrors = window.cspErrors || [];
  window.googleCspBlocked = false;
  
  // Listen for CSP errors with better detection
  window.addEventListener('securitypolicyviolation', (e) => {
    console.warn('CSP violation detected:', e.blockedURI, e.violatedDirective);
    window.cspErrors.push({
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      timestamp: Date.now()
    });
    
    // If this is related to Google API, set the flag immediately
    if (e.blockedURI && (
        e.blockedURI.includes('google') || 
        e.blockedURI.includes('gstatic') || 
        e.blockedURI.includes('googleapis') ||
        e.blockedURI.includes('accounts.google.com'))) {
      hasCspError = true;
      window.googleCspBlocked = true;
      forceLocalContent = true;
      console.warn('Google authentication blocked by CSP - switching to local content mode');
      
      // Store in localStorage to remember across page loads
      try {
        localStorage.setItem('useLocalContent', 'true');
      } catch (err) {
        // Ignore storage errors
      }
    }
  });
  
  // Also check for existing CSP meta tags that might be restrictive
  setTimeout(() => {
    const cspMetas = document.querySelectorAll('meta[http-equiv*="Content-Security"]');
    if (cspMetas.length > 0) {
      cspMetas.forEach(meta => {
        const content = meta.getAttribute('content') || '';
        if (content.includes('script-src') && !content.includes('googleapis.com')) {
          console.warn('Restrictive CSP detected that may block Google APIs:', content);
          window.googleCspBlocked = true;
          hasCspError = true;
          forceLocalContent = true;
          try {
            localStorage.setItem('useLocalContent', 'true');
          } catch (err) {
            // Ignore storage errors
          }
        }
      });
    }
  }, 1000);
}

// Initialize the Google API client with better error handling
export const initDriveClient = () => {
  if (isInitialized) return Promise.resolve();
  
  // Force local content mode if query param or localStorage is set
  if (checkForCspErrors()) {
    hasCspError = true;
    forceLocalContent = true;
    console.warn('Content Security Policy issues detected - forcing local content mode');
    isInitialized = true;
    return Promise.reject(new Error('CSP_ERROR'));
  }
  
  return new Promise((resolve, reject) => {
    // Set a timeout to catch hanging loads
    const timeoutId = setTimeout(() => {
      console.warn('Google API client initialization timed out - using local content');
      isInitialized = true;
      forceLocalContent = true;
      reject(new Error('TIMEOUT'));
    }, 8000); // 8 seconds timeout
    
    try {
      gapi.load('client:auth2', () => {
        clearTimeout(timeoutId);
        
        gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        }).then(() => {
          // Check if user is signed in, but only log once
          if (!gapi.auth2.getAuthInstance().isSignedIn.get() && !hasLoggedSignInStatus) {
            console.log('User not signed in to Google - authentication required for saving');
            hasLoggedSignInStatus = true;
          }
          isInitialized = true;
          resolve();
        }).catch(error => {
          // Check for specific CSP errors
          if (error.details && (
              error.details.includes('Content Security Policy') || 
              error.details.includes('blocked by CSP'))) {
            hasCspError = true;
            forceLocalContent = true;
            console.warn('Content Security Policy is blocking Google API scripts - using local content only');
            
            // Store the decision in localStorage
            try {
              localStorage.setItem('useLocalContent', 'true');
            } catch (err) {
              // Ignore storage errors
            }
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.warn('⚠️ Google API init blocked in development (CORS/CSP restriction - expected)');
            } else {
              console.error('Error initializing Google API client - using local content only', error);
            }
          }
          isInitialized = true;
          reject(error);
        });
      }, (error) => {
        clearTimeout(timeoutId);
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ Google API client load blocked in development (CORS/CSP restriction - expected)');
        } else {
          console.error('Failed to load Google API client - using local content only', error);
        }
        isInitialized = true;
        forceLocalContent = true;
        reject(error);
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Google API exception in development (CORS/CSP restriction - expected)');
      } else {
        console.error('Exception during Google API initialization - using local content only', error);
      }
      isInitialized = true;
      forceLocalContent = true;
      reject(error);
    }
  });
};

// Enhanced Google Sign-in function with CSP error detection
export const signInToGoogle = async () => {
  // If we've detected CSP issues, don't even try to sign in
  if (hasCspError || window.googleCspBlocked) {
    console.warn('Cannot sign in to Google due to Content Security Policy restrictions');
    return Promise.reject(new Error('CSP_ERROR'));
  }
  
  try {
    if (!gapi.auth2) await initDriveClient();
    
    const user = await gapi.auth2.getAuthInstance().signIn({
      prompt: 'select_account' // Force account selection each time
    });
    
    console.log('Successfully signed in to Google as:', user.getBasicProfile().getEmail());
    return user;
  } catch (error) {
    if (error.error === 'popup_closed_by_user') {
      console.log('Google sign-in canceled by user');
    } else if (error.error === 'idpiframe_initialization_failed') {
      hasCspError = true;
      window.googleCspBlocked = true;
      console.warn('Google authentication iframe blocked by Content Security Policy');
    } else {
      console.error('Google sign-in error:', error);
      // Check if this might be a CSP-related error
      if (error.message && (error.message.includes('CSP') || error.message.includes('Content Security Policy'))) {
        hasCspError = true;
        window.googleCspBlocked = true;
      }
    }
    throw error;
  }
};

// Check if signed in to Google
export const isSignedInToGoogle = async () => {
  // If we've detected CSP issues, don't try to check auth state
  if (hasCspError) {
    return false;
  }
  
  try {
    if (!gapi.auth2) await initDriveClient();
    return gapi.auth2.getAuthInstance().isSignedIn.get();
  } catch (error) {
    return false;
  }
};

// Replace the fetchContentFromDrive function with this simple public fetch version
export const fetchContentFromDrive = async () => {
  const timestamp = Date.now();
  
  // Only use the CORS proxy format that works
  const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://drive.google.com/uc?id=${INITIAL_DRIVE_FILE_ID}&export=download`)}&_=${timestamp}`;
  
  console.log('Fetching content from public Google Drive file via CORS proxy...');
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-cache'
    });
    
    if (!response.ok) {
      throw new Error(`CORS proxy fetch failed with status ${response.status}`);
    }
    
    const contentText = await response.text();
    
    // Validate that we got JSON content, not an error page
    if (!contentText || contentText.trim().length === 0) {
      throw new Error('CORS proxy returned empty content');
    }
    
    // Check if we got HTML error page instead of JSON
    if (contentText.trim().startsWith('<') || contentText.includes('<!DOCTYPE')) {
      throw new Error('CORS proxy returned HTML instead of JSON');
    }
    
    try {
      const driveContent = JSON.parse(contentText);
      
      // Check if the response is an error object
      if (driveContent.error) {
        throw new Error('Google Drive returned error: ' + driveContent.error);
      }
      
      // Validate that we have actual content
      if (!driveContent || typeof driveContent !== 'object' || Object.keys(driveContent).length === 0) {
        throw new Error('CORS proxy returned invalid content structure');
      }
      
      console.log('✅ Successfully loaded content via CORS proxy');
      return driveContent;
      
    } catch (parseError) {
      throw new Error('Failed to parse JSON from CORS proxy: ' + parseError.message);
    }
    
  } catch (fetchError) {
    throw new Error('CORS proxy fetch failed: ' + fetchError.message);
  }
};

// Authenticated fetch using gapi client
// Removed fetchFromDriveAuthenticated - no longer needed since we use simple public fetch
// Removed fetchFromDriveDirect - no longer needed since we use simple public fetch

// Enhanced save function that first fetches current content, then updates it
export const updateAndReplaceDriveFile = async (sectionName, newSectionData, fileName = 'content.json') => {
  try {
    if (!gapi.client || !gapi.client.drive) {
      await initDriveClient();
      if (!gapi.client || !gapi.client.drive) {
        throw new Error('Google Drive client could not be initialized.');
      }
    }
    
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
      await signInToGoogle();
    }
    
    if (!authInstance.isSignedIn.get()) {
      console.error('Failed to sign in or user is still not signed in after attempt.');
      throw new Error('User not signed in after attempting to sign in.');
    }// First, fetch the current content from Drive
    let currentContent;
    try {
      currentContent = await fetchContentFromDrive();
      
      // Validate that we didn't get an error response
      if (currentContent && currentContent.error) {
        console.warn('Received error response from Drive, using default content');
        currentContent = defaultContent;
      }
      
      // Ensure we have valid content structure
      if (!currentContent || typeof currentContent !== 'object' || Object.keys(currentContent).length === 0) {
        console.warn('Invalid or empty content received, using default content');
        currentContent = defaultContent;
      }
      
    } catch (error) {
      console.warn('Failed to fetch current content, using default:', error);
      currentContent = defaultContent;
    }

    // Update the specific section
    const updatedContent = {
      ...currentContent,
      [sectionName]: { ...(currentContent[sectionName] || {}), ...newSectionData }
    };

    // Validate the updated content before saving
    if (updatedContent.error) {
      console.error('Content contains error - not saving');
      throw new Error('Cannot save content that contains error data');
    }

    // Now save the updated content
    return await saveAndReplaceDriveFile(updatedContent, fileName);

  } catch (error) {
    console.error('Error in updateAndReplaceDriveFile:', error);
    throw error;
  }
};

// Save content by creating a new file, deleting the old one, and updating the file ID reference.
// Save content by updating the existing file instead of creating a new one
export const saveAndReplaceDriveFile = async (contentData, fileName = 'content.json') => {
  try {
    if (!gapi.client || !gapi.client.drive) {
      console.log('saveAndReplaceDriveFile: gapi.client.drive not ready, calling initDriveClient...');
      await initDriveClient();
      if (!gapi.client || !gapi.client.drive) {
        throw new Error('Google Drive client could not be initialized.');
      }
    }
    
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance.isSignedIn.get()) {
      console.log('saveAndReplaceDriveFile: User not signed in, calling signInToGoogle...');
      await signInToGoogle();
    }
    
    if (!authInstance.isSignedIn.get()) {
      console.error('saveAndReplaceDriveFile: Failed to sign in or user is still not signed in after attempt.');
      throw new Error('User not signed in after attempting to sign in.');    }
    
    const stringifiedContent = JSON.stringify(contentData, null, 2);
    
    // Validate content before upload
    if (!contentData || Object.keys(contentData).length === 0 || stringifiedContent === '{}' || stringifiedContent.length < 10) { 
      console.error('[saveAndReplaceDriveFile] CRITICAL: contentData is empty or minimal. Aborting problematic upload.');
      throw new Error('Attempted to save empty or invalid content. Please check the data source.');
    }
    
    // Check if content contains error data
    if (contentData.error) {
      console.error('[saveAndReplaceDriveFile] CRITICAL: contentData contains error response. Aborting upload.');
      throw new Error('Attempted to save error response as content. Please check the data source.');
    }
    
    // Use the resumable upload method to update the existing file
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";
    
    const metadata = {
      'name': fileName,
      'mimeType': 'application/json'
    };
    
    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      stringifiedContent +
      close_delim;    const request = gapi.client.request({
      'path': `https://www.googleapis.com/upload/drive/v3/files/${INITIAL_DRIVE_FILE_ID}`,
      'method': 'PATCH',
      'params': {'uploadType': 'multipart'},
      'headers': {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      'body': multipartRequestBody
    });
    
    console.log('Updating Drive file with ID:', INITIAL_DRIVE_FILE_ID);
    
    const updateResponse = await request;
      const updatedFile = updateResponse.result;
    if (!updatedFile || !updatedFile.id) {
      console.error('Failed to update existing file, response:', updateResponse);
      throw new Error('Failed to update existing file on Google Drive.');
    }


    return updatedFile;
  } catch (error) {
    console.error('Error in saveAndReplaceDriveFile:', error);      // If the update failed because the file doesn't exist, try creating a new one
    if (error.result && error.result.error && error.result.error.code === 404) {
      console.warn('Original file not found, creating a new file instead...');
      try {
        // Recreate the multipart body for the fallback
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        
        const metadata = {
          'name': fileName,
          'mimeType': 'application/json'
        };
        
        const fallbackMultipartBody =
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          stringifiedContent +
          close_delim;
        
        const createRequest = gapi.client.request({
          'path': 'https://www.googleapis.com/upload/drive/v3/files',
          'method': 'POST',
          'params': {'uploadType': 'multipart'},
          'headers': {
            'Content-Type': 'multipart/related; boundary="' + boundary + '"'
          },
          'body': fallbackMultipartBody
        });
        
        const createResponse = await createRequest;
        const newFile = createResponse.result;
          if (newFile) {
          console.log(`Successfully created new file: ${newFile.name}`);
          return newFile;
        }
      } catch (createError) {
        console.error('Failed to create fallback file:', createError);
      }
    }
    
    if (error.result && error.result.error) {
      console.error('Detailed error from API:', error.result.error);
      const apiError = new Error(error.result.error.message || `Drive API operation failed. Status: ${error.status || 'unknown'}`);
      apiError.details = error.result.error;
      throw apiError;
    }    // If it's the custom error from the check above, rethrow it as is.
    if (error.message === 'Attempted to save empty or invalid content. Please check the data source.') {
      throw error;
    }
    throw error; // Re-throw other errors
  }
};

// Expose Google Auth status check for UI components
export const getGoogleAuthStatus = async () => {
  try {
    if (!gapi.auth2) await initDriveClient();
    const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get();
    const user = isSignedIn ? gapi.auth2.getAuthInstance().currentUser.get() : null;
    
    return {
      isSignedIn,
      email: user ? user.getBasicProfile().getEmail() : null,
      name: user ? user.getBasicProfile().getName() : null
    };
  } catch (error) {
    return { isSignedIn: false, email: null, name: null };
  }
};

// Add a utility function to toggle local content mode
export const toggleLocalContentMode = (useLocalContent) => {
  forceLocalContent = useLocalContent;
  
  try {
    if (useLocalContent) {
      localStorage.setItem('useLocalContent', 'true');
    } else {
      localStorage.removeItem('useLocalContent');
      // Reset ALL flags to allow retrying Drive
      hasCspError = false;
      forceLocalContent = false;
      isInitialized = false;
      hasLoggedSignInStatus = false;
      if (typeof window !== 'undefined') {
        window.googleCspBlocked = false;
        window.cspErrors = [];
      }
    }
  } catch (e) {
    // Ignore storage errors
  }
  
  return forceLocalContent;
};

// Add a function to force refresh content state
export const resetContentState = () => {
  console.log('Resetting Drive content manager state...');
  isInitialized = false;
  hasLoggedSignInStatus = false;
  hasCspError = false;
  forceLocalContent = false; 
  if (typeof window !== 'undefined') {
    window.googleCspBlocked = false;
    if (window.cspErrors) {
      window.cspErrors = [];
    }
    localStorage.removeItem('useLocalContent');
    localStorage.removeItem('dynamicDriveFileId'); // Reset dynamic file ID
  }
};