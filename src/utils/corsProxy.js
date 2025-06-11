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
    console.log('Direct fetch failed, trying CORS proxies...');
  }
  
  // Try CORS proxies for localhost development
  for (const proxy of CORS_PROXIES) {
    try {
      console.log(`Trying CORS proxy: ${proxy}`);
      const proxiedUrl = proxy + encodeURIComponent(url);
      
      const response = await fetch(proxiedUrl, {
        ...options,
        mode: 'cors',
      });
      
      if (response.ok) {
        console.log(`Success with proxy: ${proxy}`);
        return response;
      }
    } catch (proxyError) {
      console.log(`Proxy ${proxy} failed:`, proxyError.message);
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
