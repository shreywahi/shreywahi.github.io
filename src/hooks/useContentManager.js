import { useState, useEffect } from 'react';
import { initContentFromDrive, getContent, loadContentFromDrive } from '../utils/contentLoader';

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
    let isMounted = true;      async function loadContent() {
      try {
        // Check if we should load from Drive (only after explicit admin reset)
        const shouldLoadFromDrive = localStorage.getItem('loadFromDriveOnStart') === 'true';
        
        let content;
        if (shouldLoadFromDrive) {
          console.log('Loading content from Drive due to admin reset flag');
          // Clear the flag first
          localStorage.removeItem('loadFromDriveOnStart');
          
          try {
            content = await loadContentFromDrive();
            console.log('Successfully loaded content from Drive after admin reset');
          } catch (driveError) {
            console.error('Failed to load from Drive after reset, falling back to local:', driveError);
            content = await initContentFromDrive();
          }
        } else {
          // Normal initialization - uses local content only (no automatic Drive loading)
          content = await initContentFromDrive();
        }
        
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
        console.error('Error during content loading:', error);
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
  }, []);  // Function to update content (for admin mode)
  const updateContent = async (section, newData) => {
    if (!isAdmin) return false;
    
    // Update the state first for immediate UI feedback
    setContentState(prev => ({
      ...prev,
      [section]: { ...(prev[section] || {}), ...newData },
    }));

    // For individual edits, we don't save to Drive immediately
    // Saving happens only when the save button is clicked
    return true;
  };
  
  // Function to save all content to Drive (called when save button is clicked)
  const saveContentToDrive = async () => {
    if (!isAdmin) return false;
      try {
      // Check if signed in to Google - authenticate only when saving
      const { isSignedInToGoogle, signInToGoogle, saveAndReplaceDriveFile } = await import('../utils/driveContentManager');
      const signedIn = await isSignedInToGoogle();
      if (!signedIn) {
        await signInToGoogle();
      }
      
      // Prepare the complete content data
      const dataToSave = {
        hero: contentState.hero || {},
        about: contentState.about || {},
        skillCategories: contentState.skillCategories || [],
        experiences: contentState.experiences || [],
        projects: contentState.projects || [],
        certificates: contentState.certificates || [],
        contact: contentState.contact || {},
        // Include static data that should be preserved
        colorMap: getContent().colorMap || {},
        iconColorMap: getContent().iconColorMap || {}
      };

      await saveAndReplaceDriveFile(dataToSave);
      return true;
    } catch (error) {
      console.error('Failed to save content to Drive:', error);
      return false;
    }
  };
  // Function to reload content from Drive (for admin use)
  const reloadFromDrive = async () => {
    if (!isAdmin) return false;
    
    try {
      setContentState(prev => ({ ...prev, loading: true }));
      
      const content = await loadContentFromDrive();
      
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
      
      return true;
    } catch (error) {
      console.error('Failed to reload content from Drive:', error);
      setContentState(prev => ({ ...prev, loading: false }));
      return false;
    }
  };

  return {
    content: contentState,
    updateContent,
    saveContentToDrive,
    reloadFromDrive,
    loading: contentState.loading,
    error: contentState.error
  };
}
