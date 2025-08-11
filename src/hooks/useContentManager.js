import { useState, useEffect } from 'react';

export function useContentManager(isAdmin) {
  // Start with local content only
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
  });

  // Initialize content from local file only
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { getLocalContent } = await import('../utils/contentLoader');
        const localContent = getLocalContent();
        if (!isMounted) return;
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
        });
      } catch (error) {
        console.error('Error loading local content:', error);
        if (!isMounted) return;
        setContentState(prev => ({ ...prev, loading: false, error: 'Failed to load content' }));
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Update content locally (admin only)
  const updateContent = async (section, newData) => {
    if (!isAdmin) return false;
    const arraySections = ['skillCategories', 'projects', 'certificates', 'experiences'];
    setContentState(prev => {
      if (arraySections.includes(section)) {
        return { ...prev, [section]: Array.isArray(newData) ? [...newData] : newData };
      }
      return { ...prev, [section]: { ...(prev[section] || {}), ...newData } };
    });
    return true;
  };

  return {
    content: contentState,
    updateContent,
    loading: contentState.loading,
    error: contentState.error,
  };
}
