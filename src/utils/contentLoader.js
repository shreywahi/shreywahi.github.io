import { Code, Database, Globe, Smartphone, Shield } from 'lucide-react';
import { fetchContentFromDrive, toggleLocalContentMode } from './driveContentManager';
import defaultContentData from '../data/content.json';

// Initial default content from local JSON
const defaultContent = defaultContentData;

// State to hold the content data
let contentData = { ...defaultContent };

// ENABLE Google Drive integration (can be disabled for troubleshooting)
const DISABLE_GOOGLE_DRIVE = false; // Set to false to enable Google Drive

// Flag to control logging
let hasLogged = false;

// Flag to track if we've tried to load from Drive
let hasTried = false;

// Function to initialize content from Drive or local file
export const initContentFromDrive = async () => {
  // Always check localStorage first - this is the key fix
  if (typeof window !== 'undefined' && localStorage.getItem('useLocalContent') === 'true') {
    console.log('Using local content (localStorage setting)');
    contentData = { ...defaultContent };
    hasLogged = true;
    return contentData;
  }

  try {
    if (DISABLE_GOOGLE_DRIVE) {
      console.log('Google Drive disabled in config');
      contentData = { ...defaultContent };
      hasLogged = true;
      return contentData;
    }
    
    console.log('Attempting to load content from Google Drive...');
    
    // Increase timeout and add better error handling
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        console.log('Google Drive request timed out after 10 seconds');
        reject(new Error('TIMEOUT'));
      }, 10000); // Increased to 10 seconds
    });
    
    // Fetch from Drive with a timeout
    const driveContentPromise = fetchContentFromDrive();
    
    // Race the fetch against the timeout
    const driveContent = await Promise.race([
      driveContentPromise,
      timeoutPromise
    ]);
    
    // Mark that we've tried to load from Drive
    hasTried = true;
    
    // Check if we got real content or just the default fallback
    if (driveContent && driveContent !== defaultContent && typeof driveContent === 'object' && Object.keys(driveContent).length > 1) {
      // We got real Drive content
      console.log('Successfully received Drive content with keys:', Object.keys(driveContent));
      
      contentData = { 
        ...defaultContent,
        ...driveContent,
        // Ensure nested objects are also merged correctly
        colorMap: { ...defaultContent.colorMap, ...(driveContent.colorMap || {}) },
        iconColorMap: { ...defaultContent.iconColorMap, ...(driveContent.iconColorMap || {}) }
      };
      
      console.log('Successfully loaded and merged content from Google Drive');
      hasLogged = true;
      
      // Store in localStorage as a cache
      try {
        localStorage.setItem('cachedContent', JSON.stringify(contentData));
        localStorage.setItem('contentCacheTime', Date.now().toString());
        console.log('Cached Drive content to localStorage');
      } catch (e) {
        console.warn('Failed to cache content:', e);
      }
    } else {
      // We got the default content back, means Drive access failed
      console.log('Received default content - Drive access failed or returned empty');
      contentData = { ...defaultContent };
      hasLogged = true;
      
      // Try to load from localStorage cache if available
      try {
        const cachedContent = localStorage.getItem('cachedContent');
        const cacheTime = localStorage.getItem('contentCacheTime');
        
        if (cachedContent && cacheTime) {
          const cacheAge = Date.now() - parseInt(cacheTime, 10);
          const cacheValid = cacheAge < 24 * 60 * 60 * 1000; // 24 hours
          
          if (cacheValid) {
            const parsedCache = JSON.parse(cachedContent);
            contentData = parsedCache;
            console.log('Using cached Drive content from localStorage (age:', Math.round(cacheAge / 1000 / 60), 'minutes)');
            return contentData;
          } else {
            console.log('Cached content expired (age:', Math.round(cacheAge / 1000 / 60 / 60), 'hours)');
          }
        }
      } catch (e) {
        console.warn('Failed to load cached content:', e);
      }
    }
    
    return contentData;
  } catch (error) {
    console.warn('Error during content loading:', error.message);
    
    if (error.message === 'TIMEOUT') {
      console.log('Google Drive access timed out - using local content');
    }
    
    contentData = { ...defaultContent };
    hasLogged = true;
    
    // Try to load from localStorage cache if available
    try {
      const cachedContent = localStorage.getItem('cachedContent');
      if (cachedContent) {
        contentData = JSON.parse(cachedContent);
        console.log('Using cached content from localStorage after error');
        return contentData;
      }
    } catch (e) {
      console.warn('Failed to load cached content after error:', e);
    }
    
    return contentData;
  }
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
export const hero = contentData.hero || defaultContent.hero;
export const about = contentData.about || defaultContent.about;
export const experiences = contentData.experiences || defaultContent.experiences;
export const skillCategories = contentData.skillCategories || defaultContent.skillCategories;
export const projects = contentData.projects || defaultContent.projects;
export const certificates = contentData.certificates || defaultContent.certificates;
export const contact = contentData.contact || defaultContent.contact;

// Default values for components with safe fallbacks
export const defaultHeroName = hero.name || 'Shrey Wahi';
export const defaultHeroDesc = hero.description || 'Software Engineer';
export const defaultAboutText = about.text || 'About me text';
export const defaultContactHeading = contact.heading || 'Contact Me';
export const defaultContactIntro = contact.intro || 'Get in touch';

// Export certificates with the same name as in the original file
export const certs = certificates;

// Add a function to reset local content mode
export const resetDriveMode = async () => {
  console.log('Resetting Drive mode...');
  
  // Reset the drive content manager state first
  toggleLocalContentMode(false);
  
  // Reset all local flags
  hasLogged = false;
  hasTried = false;
  
  // Reset contentData to trigger fresh load
  contentData = { ...defaultContent };
  
  // Clear the cache to force a fresh load
  try {
    localStorage.removeItem('cachedContent');
    localStorage.removeItem('contentCacheTime');
    localStorage.removeItem('useLocalContent');
  } catch (e) {
    // Ignore storage errors
  }
  
  // Import and call the reset function from driveContentManager
  try {
    const { resetContentState } = await import('./driveContentManager');
    resetContentState();
  } catch (e) {
    console.warn('Could not reset drive content state:', e);
  }
  
  // Force a fresh load
  return await initContentFromDrive();
};

// Add a function to force content reload
export const forceContentReload = async () => {
  hasLogged = false;
  hasTried = false;
  contentData = { ...defaultContent };
  
  try {
    const freshContent = await initContentFromDrive();
    // Update all the exported content references
    Object.assign(contentData, freshContent);
    return freshContent;
  } catch (error) {
    console.error('Error reloading content:', error);
    return defaultContent;
  }
};
