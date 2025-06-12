import { Code, Database, Globe, Smartphone, Shield } from 'lucide-react';
import defaultContentData from '../data/content.json';

// State to hold the content data - initially loaded from content.json
let contentData = defaultContentData;

// Remove the DISABLE_GOOGLE_DRIVE flag since we only use Google Drive now

// Flag to control logging
let hasLogged = false;

// Flag to track if we've tried to load from Drive
let hasTried = false;

// Function to initialize content - uses local content only on localhost, attempts public fetch in production
export const initContentFromDrive = async (forcePublicFetch = false) => {
  // Always start with local content as default
  contentData = defaultContentData;
  
  // Check if we're running on localhost/development
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' || 
                     window.location.hostname.includes('local');
  
  if (!hasLogged) {
    if (isLocalhost && !forcePublicFetch) {
      console.log('Initializing content with local data (localhost detected)');
    } else {
      console.log('Initializing content - attempting to load from public sources...');
    }
    hasLogged = true;
  }
  
  // Only attempt public fetch if NOT on localhost OR if explicitly forced
  if (!isLocalhost || forcePublicFetch) {
    try {
      const driveContent = await loadContentFromDrivePublic();
      if (driveContent && typeof driveContent === 'object' && Object.keys(driveContent).length > 1) {
        contentData = driveContent;
        console.log('Successfully initialized with content from public source');
        return contentData;
      }
    } catch (error) {
      console.log('Failed to load from public sources during initialization:', error.message);
      console.log('Using local content as fallback');
    }
  }
  
  // Return local content (default for localhost or when public fetch fails)
  console.log('Using local content for initialization');
  return contentData;
};

// Function to load content from Drive without authentication
export const loadContentFromDrive = async () => {
  try {
    console.log('Loading fresh content from Google Drive...');
    
    // Clear any cached localStorage content to ensure fresh data
    try {
      localStorage.removeItem('cachedContent');
      localStorage.removeItem('driveContentCache');
      localStorage.removeItem('lastDriveContent');
      localStorage.removeItem('driveContentTimestamp');
    } catch (e) {
      // Ignore localStorage errors
    }
      // Try Drive access regardless of environment (development or production)
    try {
      const driveContent = await loadContentFromDrivePublic();
      if (driveContent && typeof driveContent === 'object' && Object.keys(driveContent).length > 1) {
        contentData = driveContent;
        console.log('Successfully loaded fresh content from public Google Drive');
        return contentData;
      }
    } catch (publicError) {
      console.log('Public access failed:', publicError.message);
      console.log('Falling back to local content');
    }
    
    // Always fallback to local content
    contentData = defaultContentData;
    console.log('Using local content as fallback');
    return contentData;  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Drive load failed in development (expected):', error.message);
    } else {
      console.error('Failed to load content from Drive:', error.message);
    }
    // Always fallback to local content
    contentData = defaultContentData;
    console.log('Using local content due to Drive access failure');
    return contentData;
  }
};

// Function to load content from public Google Drive URL (no authentication required)
export const loadContentFromDrivePublic = async () => {
  const DRIVE_FILE_ID = '1PuRF7QqOICzAo-NGiJA56HOVAdS2pDIn';
  const timestamp = Date.now(); // Cache busting
  
  // Check if we're in development mode
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.hostname.includes('local');    try {
      if (!isDevelopment) {
        console.log('Fetching fresh content from public source...');
      } else {
        console.log('🔄 Development mode: Attempting external fetch (CORS errors expected)');
      }
    
    // Option 1: GitHub raw content (RECOMMENDED - most reliable)
    // Replace with your actual GitHub raw URL
    const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/shreywahi/portfolio-content/main/content.json';
    
    try {
      const response = await fetch(`${GITHUB_RAW_URL}?_=${timestamp}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const content = await response.json();
        console.log('Successfully loaded content from GitHub');
        return content;
      }
    } catch (githubError) {      // Suppress expected CORS errors in development
      if (isDevelopment && githubError.message.includes('CORS')) {
        // Silent in development - no console output for expected CORS errors
      } else {
          console.log('GitHub method failed, trying Google Drive...');
      }
    }
    
    // Option 2: Try Google Drive public sharing (if properly configured)
    const publicShareUrl = `https://drive.google.com/uc?id=${DRIVE_FILE_ID}&export=download&_=${timestamp}`;
      try {
      const response = await fetch(publicShareUrl, {
        method: 'GET',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const text = await response.text();
        try {
          const jsonContent = JSON.parse(text);
          console.log('Successfully loaded content from public Drive share URL');
          return jsonContent;
        } catch (parseError) {
          console.log('Response is not JSON format');
        }
      }
    } catch (shareError) {      // Suppress expected CORS errors in development
      if (isDevelopment && shareError.message.includes('CORS')) {
        // Silent in development - no console output for expected CORS errors
      } else {
        console.log('Public share URL failed:', shareError.message);
      }
    }
      // If all methods fail, throw an error
    if (isDevelopment) {
      throw new Error('All public access methods failed - using local content (normal in development due to CORS)');
    } else {
      throw new Error('All public access methods failed - content source not publicly accessible');
    }
      } catch (error) {
    if (isDevelopment) {
      // In development, this is expected - just show a clean message
      console.log('🔄 External sources blocked in development, using local content');
    } else if (error.message.includes('CORS')) {
      console.log('Development mode: External content blocked by CORS (expected behavior)');
    } else {
      console.error('Failed to fetch from public sources:', error);
    }
    throw error;
  }
};

// Function to get local content from content.json
export const getLocalContent = () => {
  return defaultContentData;
};

// Function to get the latest content
export const getContent = () => contentData;

// Icon mapping function
export const getIconComponent = (iconName) => {
  const iconMap = {
    Globe,
    Database,
    Code,
    Smartphone,
    Shield
  };
  return iconMap[iconName] || Globe; // Default to Globe if icon not found
};

// Get color classes
export const getColorClasses = (color) => {
  return contentData.colorMap?.[color] || contentData.colorMap?.blue || '';
};

// Get icon color
export const getIconColor = (color) => {
  return contentData.iconColorMap?.[color] || contentData.iconColorMap?.blue || '';
};

// Export all content data
export const content = contentData;

// Individual exports for convenience
export const hero = contentData.hero || {};
export const about = contentData.about || {};
export const experiences = contentData.experiences || [];
export const skillCategories = contentData.skillCategories || [];
export const projects = contentData.projects || [];
export const certificates = contentData.certificates || [];
export const contact = contentData.contact || {};

// Default values for components with safe fallbacks
export const defaultHeroName = hero.name || 'Shrey Wahi';
export const defaultHeroDesc = hero.description || 'Software Engineer';
export const defaultAboutText = about.text || 'About me text';
export const defaultContactHeading = contact.heading || 'Contact Me';
export const defaultContactIntro = contact.intro || 'Get in touch';

// Export certificates with the same name as in the original file
export const certs = certificates;

// Function to clear cached content and reset to default
export const clearContentCache = () => {
  contentData = defaultContentData;
  console.log('Content cache cleared, reset to default');
};

// Function to force fresh content load (clears all caches)
export const forceFreshLoad = async () => {
  // Clear module-level cache
  clearContentCache();
  
  // Clear browser caches
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cachedContent');
      localStorage.removeItem('driveContentCache');
      localStorage.removeItem('lastDriveContent');
      localStorage.removeItem('driveContentTimestamp');
    }
  } catch (e) {
    // Ignore localStorage errors
  }
  
  // Load fresh content
  return await loadContentFromDrive();
};

// Function to load content from Drive (simple public fetch)
export const loadContentFromDriveAuthenticated = async () => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      console.log('Loading content from Google Drive with authentication...');
    }
    
    // Clear caches for fresh data
    try {
      localStorage.removeItem('cachedContent');
      localStorage.removeItem('driveContentCache');
      localStorage.removeItem('lastDriveContent');
      localStorage.removeItem('driveContentTimestamp');
    } catch (e) {
      // Ignore localStorage errors
    }    // Use simple public fetch via CORS proxy (only working method)
    const DRIVE_FILE_ID = '1PuRF7QqOICzAo-NGiJA56HOVAdS2pDIn';
    const timestamp = Date.now();
    
    // Only use the CORS proxy format that works
    const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://drive.google.com/uc?id=${DRIVE_FILE_ID}&export=download`)}&_=${timestamp}`;
    
    try {
      console.log('Loading content from Drive via CORS proxy...');
      
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`CORS proxy failed with status ${response.status}`);
      }
      
      const contentText = await response.text();
      
      // Validate content
      if (!contentText || contentText.trim().length === 0 || 
          contentText.trim().startsWith('<') || contentText.includes('<!DOCTYPE')) {
        throw new Error('CORS proxy returned invalid content');
      }
      
      const driveContent = JSON.parse(contentText);
      
      if (driveContent && typeof driveContent === 'object' && Object.keys(driveContent).length > 1) {
        console.log('✅ Successfully loaded content from Drive via CORS proxy');
        
        // Cache the content with timestamp
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('cachedContent', JSON.stringify(driveContent));
            localStorage.setItem('driveContentTimestamp', timestamp.toString());
            console.log('📦 Content cached successfully');
          } catch (cacheError) {
            console.warn('Failed to cache content:', cacheError);
          }
        }
        
        return {
          ...driveContent,
          contentSource: 'drive',
          fallbackUsed: false,
          driveAttempted: true,
          lastUpdated: new Date().toISOString()
        };
      } else {
        throw new Error('Invalid content structure from CORS proxy');
      }
      
    } catch (error) {
      console.error('CORS proxy fetch failed:', error.message);
      throw error;
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Drive load failed in development (expected):', error.message);
    } else {
      console.error('Failed to load content from Drive:', error.message);
    }
    throw error;
  }
};

// Alternative: Function to load from a simple JSON endpoint (if you set one up)
export const loadContentFromJsonEndpoint = async () => {
  try {
    // You can replace this URL with your own JSON endpoint
    // For example: https://your-domain.com/api/content.json
    // Or use GitHub raw content: https://raw.githubusercontent.com/username/repo/main/content.json
    const CONTENT_ENDPOINT = 'https://api.jsonbin.io/v3/b/YOUR_BIN_ID/latest'; // Example service
    
    const response = await fetch(CONTENT_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Handle different response formats from different services
    const content = data.record || data.data || data; // Adjust based on your endpoint
    
    console.log('Successfully loaded content from JSON endpoint');
    return content;  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ JSON endpoint load failed in development (expected):', error.message);
    } else {
      console.error('Failed to load from JSON endpoint:', error);
    }
    throw error;
  }
};
