// Silent CSP detection and helper functions

export const detectCspIssues = () => {
  const issues = [];
  
  try {
    // Check for CSP meta tags
    const cspMetas = document.querySelectorAll('meta[http-equiv*="Content-Security"]');
    cspMetas.forEach(meta => {
      const content = meta.getAttribute('content') || '';
      if (content.includes('script-src') && !content.includes('googleapis.com')) {
        issues.push('Restrictive script-src CSP');
      }
    });
    
    // Check for stored CSP errors
    if (window.cspErrors && window.cspErrors.length > 0) {
      issues.push('CSP violations detected');
    }
    
    if (window.googleCspBlocked) {
      issues.push('Google services blocked');
    }
  } catch (e) {
    // Silent error handling
  }
  
  return issues;
};

export const getSuggestedCspFix = () => {
  return {
    html: `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com; connect-src 'self' https://www.googleapis.com https://accounts.google.com; frame-src https://accounts.google.com;">`,
    explanation: 'This CSP policy allows Google API scripts and connections while maintaining security.'
  };
};

export const logCspSuggestion = () => {
  // Only log once and only if there are actual issues
  if (typeof window !== 'undefined' && !window.cspSuggestionLogged) {
    const issues = detectCspIssues();
    if (issues.length > 0) {
      window.cspSuggestionLogged = true;
      // Silent - don't log to console
    }
  }
};
