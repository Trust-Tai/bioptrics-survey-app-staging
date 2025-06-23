/**
 * Device detection utility for tracking survey usage across different devices
 */

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

/**
 * Detects the user's device type based on screen size and user agent
 * @returns The detected device type: 'desktop', 'tablet', or 'mobile'
 */
export const detectDeviceType = (): DeviceType => {
  // Only run this on the client
  if (typeof window === 'undefined') {
    return 'desktop'; // Default for server-side rendering
  }

  // Check if the userAgent contains mobile-specific keywords
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  // Get the screen width
  const width = window.innerWidth;

  // Tablet detection - check for iPad specifically or screen size typical of tablets
  const isTablet = 
    /ipad/i.test(userAgent) || 
    (/android/i.test(userAgent) && !/mobile/i.test(userAgent)) ||
    (width >= 768 && width <= 1024);
  
  if (isTablet) {
    return 'tablet';
  } else if (isMobileAgent || width < 768) {
    return 'mobile';
  } else {
    return 'desktop';
  }
};

/**
 * Gets the current device type and logs it for debugging
 * @returns The current device type
 */
export const getCurrentDeviceType = (): DeviceType => {
  const deviceType = detectDeviceType();
  console.log(`Detected device type: ${deviceType}`);
  return deviceType;
};
