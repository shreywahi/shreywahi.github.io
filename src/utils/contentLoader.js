import { Code, Database, Globe, Smartphone, Shield } from 'lucide-react';
import { fetchContentFromDrive } from './driveContentManager';
import defaultContentData from '../data/content.json';

// State to hold the content data - initially loaded from content.json
let contentData = defaultContentData;

// Remove the DISABLE_GOOGLE_DRIVE flag since we only use Google Drive now

// Flag to control logging
let hasLogged = false;

// Flag to track if we've tried to load from Drive
let hasTried = false;

// Function to initialize content - uses local content.json by default
export const initContentFromDrive = async () => {
  // Always start with local content as default
  contentData = defaultContentData;
  
  if (!hasLogged) {
    console.log('Initializing content with local content.json...');
    hasLogged = true;
  }
  
  // Only try to load from Drive if explicitly requested (not during normal initialization)
  return contentData;
};

// Function to load content from Drive (can be called during initialization or admin operations)
export const loadContentFromDrive = async () => {
  try {
    console.log('Loading content from Google Drive...');
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Drive request timed out after 10 seconds'));
      }, 10000);
    });
    
    const driveContentPromise = fetchContentFromDrive();
    const driveContent = await Promise.race([driveContentPromise, timeoutPromise]);
    
    if (driveContent && typeof driveContent === 'object' && Object.keys(driveContent).length > 1) {
      contentData = driveContent;
      
      // Store in localStorage as a cache
      try {
        localStorage.setItem('cachedContent', JSON.stringify(contentData));
        localStorage.setItem('contentCacheTime', Date.now().toString());
        console.log('Content cached successfully');
      } catch (e) {
        console.warn('Failed to cache content:', e.message);
      }
      
      return contentData;
    } else {
      throw new Error('Invalid or empty content received from Drive');
    }
  } catch (error) {
    console.error('Failed to load content from Drive:', error.message);
    throw error;
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
  
  // After reset, load from local content (Drive will only be used if explicitly requested)
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
