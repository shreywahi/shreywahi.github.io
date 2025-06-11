import { gapi } from 'gapi-script';
import defaultContentData from '../data/content.json';
import { logCspSuggestion } from './cspHelper';
import { fetchWithCorsProxy, generatePublicGoogleDriveUrl } from './corsProxy';

// Replace with your actual Google API credentials
const API_KEY = 'AIzaSyA0XN9LpLvaFKOEINnOOVYnfOQe59fZ0vs'; // The API Key you created
const CLIENT_ID = '936180176580-tkbp6kt3q1pp2o6urobfu9aa163bpcrt.apps.googleusercontent.com'; // The OAuth Client ID you created
const DRIVE_FILE_ID = '1VmYPnA5Mp8pPurA9Dk4XERG7xGRBwU2p'; // The ID from your Drive file URL
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
            console.error('Error initializing Google API client - using local content only', error);
          }
          isInitialized = true;
          reject(error);
        });
      }, (error) => {
        clearTimeout(timeoutId);
        console.error('Failed to load Google API client - using local content only', error);
        isInitialized = true;
        forceLocalContent = true;
        reject(error);
      });
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Exception during Google API initialization - using local content only', error);
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
    logCspSuggestion(); // Show CSP fix suggestion
    return Promise.reject(new Error('CSP_ERROR'));
  }
  
  try {
    if (!gapi.auth2) await initDriveClient();
    
    console.log('Starting Google authentication flow...');
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
      logCspSuggestion();
    } else {
      console.error('Google sign-in error:', error);
      // Check if this might be a CSP-related error
      if (error.message && (error.message.includes('CSP') || error.message.includes('Content Security Policy'))) {
        hasCspError = true;
        window.googleCspBlocked = true;
        logCspSuggestion();
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

// Replace the fetchContentFromDrive function with this CORS-proxy version
export const fetchContentFromDrive = async () => {
  // Check if we should skip Drive entirely - check localStorage first
  if (typeof window !== 'undefined' && localStorage.getItem('useLocalContent') === 'true') {
    return defaultContent;
  }
  
  // Check if we should skip Drive entirely
  if (forceLocalContent || checkForCspErrors()) {
    return defaultContent;
  }
  
  // Check if we're on localhost
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' || 
     window.location.hostname === '');
  
  if (isLocalhost) {
    return await fetchFromDriveWithProxy();
  } else {
    return await fetchFromDriveDirect();
  }
};

// Direct fetch for production
const fetchFromDriveDirect = async () => {
  try {
    const apiUrl = `https://www.googleapis.com/drive/v3/files/${DRIVE_FILE_ID}?alt=media&key=${API_KEY}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentText = await response.text();
    const driveContent = JSON.parse(contentText);
    return driveContent;
  } catch (error) {
    return defaultContent;
  }
};

// CORS proxy fetch for localhost
const fetchFromDriveWithProxy = async () => {
  try {
    // Try the public download URL first
    const publicUrl = `https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`;
    
    const response = await fetchWithCorsProxy(publicUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentText = await response.text();
    
    // Check if the response looks like HTML (Google's download page)
    if (contentText.trim().startsWith('<!DOCTYPE html') || contentText.trim().startsWith('<html')) {
      // Try alternative approach with manual file URL
      return await tryAlternativeUrls();
    }
    
    try {
      const driveContent = JSON.parse(contentText);
      return driveContent;
    } catch (parseError) {
      return await tryAlternativeUrls();
    }
    
  } catch (error) {
    return await tryAlternativeUrls();
  }
};

// Try alternative URLs and approaches
const tryAlternativeUrls = async () => {
  // Check if there's cached content available
  try {
    const cachedContent = localStorage.getItem('cachedContent');
    if (cachedContent) {
      return JSON.parse(cachedContent);
    }
  } catch (e) {
    // Ignore cache errors
  }
  
  // Automatically switch to local content mode for localhost
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1')) {
    toggleLocalContentMode(true);
  }
  
  return defaultContent;
};

// Save content to Google Drive
export const saveContentToDrive = async (contentData) => {
  try {
    if (!gapi.client) await initDriveClient();
    
    // Check if signed in
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
      await signInToGoogle();
    }
    
    // Convert content to JSON string
    const contentBlob = new Blob([JSON.stringify(contentData, null, 2)], {
      type: 'application/json'
    });
    
    // Create a form data object for the file
    const metadata = {
      name: 'content.json',
      mimeType: 'application/json',
    };
    
    // Use the Drive API to update the file
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', contentBlob);
    
    // Execute the update request
    const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${DRIVE_FILE_ID}?uploadType=multipart`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: form
    });
    
    const result = await response.json();
    console.log('Content updated successfully', result);
    return result;
  } catch (error) {
    console.error('Error saving content to Drive:', error);
    throw error;
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
  hasCspError = false;
  forceLocalContent = false;
  isInitialized = false;
  hasLoggedSignInStatus = false;
  if (typeof window !== 'undefined') {
    window.googleCspBlocked = false;
    window.cspErrors = [];
  }
};
