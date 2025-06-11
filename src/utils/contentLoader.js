import { Code, Database, Globe, Smartphone, Shield } from 'lucide-react';
import { fetchContentFromDrive } from './driveContentManager';

// State to hold the content data - will be populated from Drive
let contentData = {};

// Remove the DISABLE_GOOGLE_DRIVE flag since we only use Google Drive now

// Flag to control logging
let hasLogged = false;

// Flag to track if we've tried to load from Drive
let hasTried = false;

// Function to initialize content from Drive only
export const initContentFromDrive = async () => {
  try {
    // Fetch from Drive with a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('TIMEOUT'));
      }, 10000); // 10 seconds timeout
    });
    
    const driveContentPromise = fetchContentFromDrive();
    
    // Race the fetch against the timeout
    const driveContent = await Promise.race([
      driveContentPromise,
      timeoutPromise
    ]);
    
    // Mark that we've tried to load from Drive
    hasTried = true;
    
    // Check if we got valid content from Drive
    if (driveContent && typeof driveContent === 'object' && Object.keys(driveContent).length > 1) {
      // We got real Drive content
      contentData = driveContent;
      
      hasLogged = true;
      
      // Store in localStorage as a cache
      try {
        localStorage.setItem('cachedContent', JSON.stringify(contentData));
        localStorage.setItem('contentCacheTime', Date.now().toString());
      } catch (e) {
        // Ignore cache errors
      }
    } else {
      // Drive access failed - throw error
      throw new Error('Failed to load content from Google Drive');
    }
    
    return contentData;
  } catch (error) {
    hasLogged = true;
    
    // Try to load from localStorage cache if available as last resort
    try {
      const cachedContent = localStorage.getItem('cachedContent');
      if (cachedContent) {
        contentData = JSON.parse(cachedContent);
        console.warn('Using cached content due to Drive loading error:', error.message);
        return contentData;
      }
    } catch (e) {
      // Ignore cache errors
    }
    
    // If no cache available, throw the error
    throw new Error(`Failed to load content from Google Drive: ${error.message}`);
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

// Add a function to reset Drive mode
export const resetDriveMode = async () => {
  console.log('Resetting Drive mode...');
    // Reset all local flags
  hasLogged = false;
  hasTried = false;
  
  // Reset contentData to trigger fresh load
  contentData = {};
  
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
  contentData = {};
  
  try {
    const freshContent = await initContentFromDrive();
    // Update all the exported content references
    Object.assign(contentData, freshContent);
    return freshContent;
  } catch (error) {
    console.error('Error reloading content:', error);
    throw error;
  }
};
