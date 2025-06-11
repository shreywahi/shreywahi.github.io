import { useState, useEffect } from 'react';
import { initContentFromDrive, getContent } from '../utils/contentLoader';
import { saveAndReplaceDriveFile, isSignedInToGoogle, signInToGoogle, updateAndReplaceDriveFile } from '../utils/driveContentManager';

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
        const content = await initContentFromDrive();
        
        if (isMounted) {
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
    
    // Update the state first for immediate UI feedback
    setContentState(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), ...newData },
    }));

    // Save to Drive using the dedicated update function
    try {
      // Check if signed in to Google
      const signedIn = await isSignedInToGoogle();
      if (!signedIn) {
        await signInToGoogle();
      }
      
      // Use the dedicated update function that fetches current content first
      await updateAndReplaceDriveFile(section, newData);
      return true;
    } catch (error) {
      console.error('Failed to update content:', error);
      // Revert the state change on error
      setContentState(prev => {
        const reverted = { ...prev };
        // Remove the failed update
        if (reverted[section]) {
          Object.keys(newData).forEach(key => {
            delete reverted[section][key];
          });
        }
        return reverted;
      });
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
