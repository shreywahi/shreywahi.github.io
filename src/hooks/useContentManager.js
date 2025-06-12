import { useState, useEffect } from 'react';

export function useContentManager(isAdmin) {  // Start with empty content initially
  const [contentState, setContentState] = useState({
    loading: true,
    error: null,
    hero: {},
    about: {},
    experiences: [],
    skillCategories: [],
    projects: [],
    certificates: [],
    contact: {},
    contentSource: 'local', // Track current content source
    fallbackUsed: false,
    driveAttempted: false,
  });
  // Initialize content with local data only - let LoadingScreen handle Drive loading
  useEffect(() => {
    let isMounted = true;
    
    async function loadInitialContent() {
      try {
        // Import content loader functions dynamically
        const { getContent } = await import('../utils/contentLoader');
        
        // Get initial local content to prevent blank screen
        const initialContent = getContent();
        
        if (isMounted) {
          setContentState({
            loading: true, // Keep loading=true so LoadingScreen is shown
            error: null,
            hero: initialContent.hero || {},
            about: initialContent.about || {},
            experiences: initialContent.experiences || [],
            skillCategories: initialContent.skillCategories || [],
            projects: initialContent.projects || [],
            certificates: initialContent.certificates || [],
            contact: initialContent.contact || {},
            contentSource: 'local',
            fallbackUsed: false,
            driveAttempted: false,
          });
        }
      } catch (error) {
        console.error('Error loading initial content:', error);
        if (isMounted) {
          setContentState(prev => ({
            ...prev,
            loading: true, // Keep loading state for LoadingScreen
            error: null
          }));
        }
      }
    }
    
    loadInitialContent();
    
    return () => {
      isMounted = false;
    };
  }, []);// Function to update content (for admin mode)
  const updateContent = async (section, newData) => {
    if (!isAdmin) return false;
    // For array sections, replace the array directly
    const arraySections = ['skillCategories', 'projects', 'certificates', 'experiences'];
    setContentState(prev => {
      if (arraySections.includes(section)) {
        return { ...prev, [section]: Array.isArray(newData) ? [...newData] : newData };
      }
      return { ...prev, [section]: { ...(prev[section] || {}), ...newData } };
    });
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
      const { getContent } = await import('../utils/contentLoader');
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
      
      // After successful save, automatically switch to Drive mode to show the saved content
      console.log('Successfully saved to Drive, switching to Drive mode...');
      await loadContentFromDrive(false); // Load the saved content from Drive
      
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
      // Import content loader functions dynamically
      const { loadContentFromDrive } = await import('../utils/contentLoader');
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
  // Function to manually load local content (for LoadingScreen and admin panel)
  const loadLocalContent = async (showLoadingScreen = true) => {
    try {
      console.log('Manual local content load requested');
      
      if (showLoadingScreen) {
        setContentState(prev => ({ ...prev, loading: true }));
      }
      
      const { getLocalContent } = await import('../utils/contentLoader');
      const localContent = getLocalContent();
      
      setContentState({
        loading: false,
        error: null,
        hero: localContent.hero || {},
        about: localContent.about || {},
        experiences: localContent.experiences || [],
        skillCategories: localContent.skillCategories || [],
        projects: localContent.projects || [],
        certificates: localContent.certificates || [],
        contact: localContent.contact || {},
        contentSource: 'local',
        fallbackUsed: true,
        driveAttempted: false,
      });
      
      console.log('Successfully loaded local content manually');
      return true;
    } catch (error) {
      console.error('Failed to load local content:', error);
      setContentState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load content',
      }));
      return false;
    }
  };
  // Function to manually load content from Drive (for LoadingScreen and admin panel)
  const loadContentFromDrive = async (showLoadingScreen = true) => {
    try {
      console.log('Manual Drive content load requested');
      
      if (showLoadingScreen) {
        setContentState(prev => ({ ...prev, loading: true }));
      }
      
      // Clear any cached data to ensure fresh content
      try {
        localStorage.removeItem('cachedContent');
        localStorage.removeItem('driveContentCache');
        localStorage.removeItem('lastDriveContent');
        localStorage.removeItem('driveContentTimestamp');
      } catch (e) {
        // Ignore localStorage errors
      }
        // Try simple public fetch - no authentication required
      const { fetchContentFromDrive } = await import('../utils/driveContentManager');
      
      let content;
      try {
        content = await fetchContentFromDrive();
        console.log('Successfully loaded content from public Drive');
      } catch (publicError) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Public Drive blocked in development, using local fallback...');
        } else {
          console.log('Public Drive access failed, using local fallback...');
        }
        // Just throw the error to trigger fallback
        throw publicError;
      }
      
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
        contentSource: 'drive',
        fallbackUsed: false,
        driveAttempted: true,
      });
      
      console.log('Successfully loaded Drive content manually');
      return true;    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Manual Drive load failed in development (expected):', error.message);
      } else {
        console.error('Failed to load Drive content:', error);
      }
      
      // Fall back to local content
      const { getLocalContent } = await import('../utils/contentLoader');
      const localContent = getLocalContent();
      
      setContentState({
        loading: false,
        error: null,
        hero: localContent.hero || {},
        about: localContent.about || {},
        experiences: localContent.experiences || [],
        skillCategories: localContent.skillCategories || [],
        projects: localContent.projects || [],
        certificates: localContent.certificates || [],
        contact: localContent.contact || {},
        contentSource: 'local',
        fallbackUsed: true,
        driveAttempted: true,      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Using local content (development mode)');
      } else {
        console.log('Fell back to local content after Drive failure');
      }
      return false;
    }
  };
  return {
    content: contentState,
    updateContent,
    saveContentToDrive,
    reloadFromDrive,
    loadLocalContent,
    loadContentFromDrive,
    loading: contentState.loading,
    error: contentState.error
  };
}
