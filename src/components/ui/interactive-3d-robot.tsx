'use client';

import { Suspense, lazy } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
const Spline = lazy(() => import('@splinetool/react-spline'));

interface InteractiveRobotSplineProps {
  scene: string;
  className?: string;
}

export function InteractiveRobotSpline({ scene, className }: InteractiveRobotSplineProps) {
  // The scene streams from Spline's CDN. If that request fails (network, an ad
  // blocker, a CDN outage) the runtime throws, and without a boundary the error
  // reached the route and replaced the whole Projects page with the error screen.
  // The robot is decoration, so it simply drops out instead.
  return (
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
      />
    </Suspense>
    </ErrorBoundary>
  );
}
