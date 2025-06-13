import { useState, useEffect } from 'react';

/**
 * Device detection utility based on user agent and device characteristics
 * This approach uses device type detection rather than screen size to ensure
 * proper navigation behavior across different devices and orientations
 */

export const getDeviceType = () => {
  if (typeof window === 'undefined') return 'desktop';
  
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() || '';
  
  // Check for mobile devices first - include foldable phones
  const mobileKeywords = [
    'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone',
    'mobile', 'phone', 'samsung', 'galaxy', 'nokia', 'motorola', 'lg', 'htc',
    'sony', 'huawei', 'xiaomi', 'oppo', 'vivo', 'oneplus', 'pixel', 'fold',
    'flip', 'surface duo'
  ];
  
  // Check for tablet-specific indicators (only true tablets, not phones)
  const tabletKeywords = [
    'ipad', 'kindle', 'silk', 'playbook', 'nexus 7', 'nexus 9', 'nexus 10',
    'surface pro', 'surface go', 'gt-p', 'sm-t'
  ];
  
  // Specific foldable phone patterns
  const foldablePhonePatterns = [
    /galaxy.*fold/i, /galaxy.*flip/i, /surface duo/i, /mate.*x/i, /find.*fold/i,
    /xiaomi.*fold/i, /honor.*fold/i, /oppo.*fold/i, /vivo.*fold/i
  ];
  
  // iOS detection (includes iPhone and iPad)
  const isIOS = /ipad|iphone|ipod/.test(userAgent) || 
    (platform === 'macintel' && navigator.maxTouchPoints > 1);
  
  // Android detection
  const isAndroid = /android/.test(userAgent);
  
  // Windows Mobile/Phone detection
  const isWindowsMobile = /windows phone|iemobile|wpdesktop/.test(userAgent);
  
  // Check if it's a foldable phone (treat as mobile regardless of screen size)
  const isFoldablePhone = foldablePhonePatterns.some(pattern => pattern.test(userAgent));
  
  // Check if it's specifically a tablet (exclude foldable phones)
  const isTablet = !isFoldablePhone && (
    tabletKeywords.some(keyword => userAgent.includes(keyword)) ||
    // iPad detection (only for actual iPads, not foldables)
    (isIOS && !userAgent.includes('iphone') && !userAgent.includes('mobile'))
  );
  
  // Check if it's a mobile device (including foldable phones)
  const isMobile = !isTablet && (
    isFoldablePhone ||
    mobileKeywords.some(keyword => userAgent.includes(keyword)) ||
    (isIOS && userAgent.includes('iphone')) ||
    (isAndroid && userAgent.includes('mobile')) ||
    isWindowsMobile ||
    // Touch device with mobile indicators
    (navigator.maxTouchPoints > 0 && (
      userAgent.includes('mobile') || 
      userAgent.includes('phone') ||
      isFoldablePhone
    ))
  );
  
  // Return device type
  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
};

export const isDesktopDevice = () => {
  return getDeviceType() === 'desktop';
};

export const isMobileDevice = () => {
  return getDeviceType() === 'mobile';
};

export const isTabletDevice = () => {
  return getDeviceType() === 'tablet';
};

export const isTouchDevice = () => {
  return navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
};

// Hook for React components
export const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState(() => getDeviceType());
  
  useEffect(() => {
    // Initial detection
    const currentDeviceType = getDeviceType();
    setDeviceType(currentDeviceType);
    
    // Listen for orientation changes on mobile devices
    const handleOrientationChange = () => {
      // Small delay to ensure any device state changes are settled
      setTimeout(() => {
        const newDeviceType = getDeviceType();
        setDeviceType(newDeviceType);
      }, 100);
    };
    
    // Listen for resize events only for cases where device context might actually change
    // (e.g., docking/undocking a tablet, external monitor connection)
    const handleResize = () => {
      // Re-detect device type, but it should remain stable for the same physical device
      const newDeviceType = getDeviceType();
      if (newDeviceType !== deviceType) {
        setDeviceType(newDeviceType);
      }
    };
    
    // Only listen to orientation changes for mobile/tablet devices
    if (currentDeviceType === 'mobile' || currentDeviceType === 'tablet') {
      window.addEventListener('orientationchange', handleOrientationChange);
    }
    
    // Listen to resize for potential device context changes (less frequent)
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Remove deviceType dependency to prevent unnecessary re-renders
  
  return deviceType;
};

// Debug function to help identify device detection issues
export const getDeviceInfo = () => {
  if (typeof window === 'undefined') return { deviceType: 'desktop', info: 'Server-side' };
  
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() || '';
  
  return {
    deviceType: getDeviceType(),
    userAgent: userAgent,
    platform: platform,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    maxTouchPoints: navigator.maxTouchPoints,
    orientationType: screen.orientation?.type || 'unknown',
    screenWidth: screen.width,
    screenHeight: screen.height
  };
};

export default {
  getDeviceType,
  getDeviceInfo,
  isDesktopDevice,
  isMobileDevice,
  isTabletDevice,
  isTouchDevice,
  useDeviceType
};
