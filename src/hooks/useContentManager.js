import { useState, useEffect } from 'react';
import { initContentFromDrive, getContent } from '../utils/contentLoader';
import { saveContentToDrive, isSignedInToGoogle, signInToGoogle } from '../utils/driveContentManager';

export function useContentManager(isAdmin) {
  // Start with content from the module state to prevent blank screen
  const initialContent = getContent();
  
  const [contentState, setContentState] = useState({
    loading: true,
    error: null,
    hero: initialContent.hero || {},
    about: initialContent.about || {},
    experiences: initialContent.experiences || [],
    skillCategories: initialContent.skillCategories || [],
    projects: initialContent.projects || [],
    certificates: initialContent.certificates || [],
    contact: initialContent.contact || {},
  });
  
  // Initialize content
  useEffect(() => {
    let isMounted = true;
    
    async function loadContent() {
      try {
        console.log('useContentManager: Loading content...');
        
        const content = await initContentFromDrive();
        
        if (isMounted) {
          console.log('useContentManager: Content loaded successfully');
          setContentState({
            loading: false,
            error: null,
            hero: content.hero || {},
            about: content.about || {},
            experiences: content.experiences || [],
            skillCategories: content.skillCategories || [],
            projects: content.projects || [],
            certificates: content.certificates || [],
            contact: content.contact || {},
          });
        }
      } catch (error) {
        console.error('useContentManager: Error loading content:', error);
        if (isMounted) {
          setContentState(prev => ({
            ...prev,
            loading: false,
            error: null
          }));
        }
      }
    }
    
    loadContent();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Function to update content (for admin mode)
  const updateContent = async (section, newData) => {
    if (!isAdmin) return false;
    
    try {
      // Update local state first for immediate feedback
      setContentState(prev => ({
        ...prev,
        [section]: newData
      }));
      
      // Check if signed in to Google
      const signedIn = await isSignedInToGoogle();
      if (!signedIn) {
        await signInToGoogle();
      }
      
      // Prepare the full content for saving
      const updatedContent = {
        ...contentState,
        [section]: newData
      };
      
      // Save to Google Drive
      await saveContentToDrive(updatedContent);
      return true;
    } catch (error) {
      console.error('Failed to update content:', error);
      return false;
    }
  };
  
  return {
    content: contentState,
    updateContent,
    loading: contentState.loading,
    error: contentState.error
  };
}
