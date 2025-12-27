import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';

// AdMob types for mobile
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

// AdSense configuration
const ADSENSE_CLIENT = 'ca-pub-4410866538083227'; // Your AdSense Publisher ID
const ADSENSE_SLOT = '2228175379'; // Ad Unit Slot ID

/**
 * AdBanner Component
 * - Uses AdMob for native mobile apps (iOS/Android)
 * - Uses Google AdSense for web browsers
 * - Standard banner sizes per Google's guidelines:
 *   - Mobile: 320x50
 *   - Desktop: 728x90
 */
export function AdBanner() {
  const adRef = useRef<HTMLDivElement>(null);
  const isAdLoaded = useRef(false);
  const isNative = Capacitor.isNativePlatform();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Track window width for responsive sizing
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Mobile: Use AdMob
    if (isNative) {
      const setupAdMob = async () => {
        try {
          const { AdMob, BannerAdPosition, BannerAdSize } = await import('@capacitor-community/admob');
          await AdMob.initialize();
          await AdMob.showBanner({
            adId: 'ca-app-pub-4410866538083227/2228175379',
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
          });
        } catch (e) {
          console.log('AdMob not available:', e);
        }
      };
      setupAdMob();
      
      return () => {
        import('@capacitor-community/admob').then(({ AdMob }) => {
          try { AdMob.removeBanner(); } catch { }
        });
      };
    }
    
    // Web: Use AdSense
    if (!isNative && !isAdLoaded.current) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        isAdLoaded.current = true;
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [isNative]);

  // For native apps, return null (AdMob handles the banner natively)
  if (isNative) {
    return null;
  }

  // Standard Google AdSense banner sizes
  // Mobile (<728px): 320x50
  // Desktop (>=728px): 728x90
  const isMobileScreen = windowWidth < 728;
  const adWidth = isMobileScreen ? 320 : 728;
  const adHeight = isMobileScreen ? 50 : 90;

  return (
    <div 
      ref={adRef}
      className="fixed bottom-0 left-0 right-0 z-[60] bg-background border-t border-border flex justify-center items-center"
      style={{ height: `${adHeight}px` }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: 'inline-block',
          width: `${adWidth}px`,
          height: `${adHeight}px`,
        }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
      />
    </div>
  );
}

export default AdBanner;
