'use client';

import type { FC } from 'react';
import { InteractiveRobotSpline } from './interactive-3d-robot';

interface SplineSceneProps {
    scene: string;
    className?: string;
}

// Preserve touch interactions; pause offscreen rather than hiding the scene.
export const SplineScene: FC<SplineSceneProps> = ({ scene, className }) => (
    <div className={`relative w-full h-full overflow-hidden ${className || ''}`}>
        <div className="w-full h-full pt-20 relative">
            <div className="w-full h-full scale-[1.2] origin-center">
                <InteractiveRobotSpline scene={scene} className="w-full h-full" />
            </div>
        </div>
    </div>
);
