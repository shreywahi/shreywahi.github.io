// CORS proxy solutions for Google Drive access

const CORS_PROXIES = [
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

export const fetchWithCorsProxy = async (url, options = {}) => {
  // First try direct access (works in production/deployed apps)
  try {
    const response = await fetch(url, {
      ...options,
      mode: 'cors',
    });
    
    if (response.ok) {
      return response;
    }
  } catch (directError) {
    // Silent fallback to proxies
  }
  
  // Try CORS proxies for localhost development
  for (const proxy of CORS_PROXIES) {
    try {
      const proxiedUrl = proxy + encodeURIComponent(url);
      
      const response = await fetch(proxiedUrl, {
        ...options,
        mode: 'cors',
      });
      
      if (response.ok) {
        return response;
      }
    } catch (proxyError) {
      continue;
    }
  }
  
  throw new Error('All CORS proxies failed');
};

export const generatePublicGoogleDriveUrl = (fileId) => {
  // Try multiple URL formats that might work
  return [
    `https://drive.google.com/uc?export=download&id=${fileId}`,
    `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
    `https://docs.google.com/document/d/${fileId}/export?format=txt`,
  ];
};
