'use client';

import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import type { Application } from '@splinetool/runtime';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
const Spline = lazy(() => import('@splinetool/react-spline'));

interface InteractiveRobotSplineProps {
  scene: string;
  className?: string;
}

export function InteractiveRobotSpline({ scene, className }: InteractiveRobotSplineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const applicationRef = useRef<Application | null>(null);
  const visibleRef = useRef(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const syncPlayback = useCallback(() => {
    const application = applicationRef.current;
    if (!application) return;
    const shouldPlay = visibleRef.current && !document.hidden;
    if (shouldPlay && application.isStopped) application.play();
    if (!shouldPlay && !application.isStopped) application.stop();
  }, []);
  const handleLoad = useCallback((application: Application) => {
    applicationRef.current = application;
    syncPlayback();
  }, [syncPlayback]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Fetch ahead of scrolling into view, then retain the scene so returning
    // to the robot never requires downloading or constructing it again.
    const preloadObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true);
        preloadObserver.disconnect();
      }
    }, { rootMargin: '400px' });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      syncPlayback();
    });
    preloadObserver.observe(container);
    visibilityObserver.observe(container);
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      preloadObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      applicationRef.current = null;
    };
  }, [syncPlayback]);
  // The scene streams from Spline's CDN. If that request fails (network, an ad
  // blocker, a CDN outage) the runtime throws, and without a boundary the error
  // reached the route and replaced the whole Projects page with the error screen.
  // The robot is decoration, so it simply drops out instead.
  return (
    <div ref={containerRef} className={className}>
    {shouldLoad && (
    <ErrorBoundary fallback={null}>
    <Suspense
      fallback={
        <div className={`w-full h-full flex items-center justify-center bg-transparent text-foreground ${className}`}>
          <svg className="animate-spin h-5 w-5 text-current mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"></path>
          </svg>
        </div>
      }
    >
      
      <Spline
        scene={scene}
        className={className} 
        onLoad={handleLoad}
        renderOnDemand
      />
    </Suspense>
    </ErrorBoundary>
    )}
    </div>
  );
}
