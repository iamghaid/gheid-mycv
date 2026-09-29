/* eslint-disable react/no-unknown-property */
'use client';

import { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import {
    BallCollider,
    CuboidCollider,
    Physics,
    RigidBody,
    useRopeJoint,
    useSphericalJoint,
    RigidBodyProps
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

import { usePerformance } from '@/hooks/usePerformance';
import { portfolioData } from '@/data/portfolio';
import { useLocalizedPortfolio } from '@/hooks/useLocalizedPortfolio';

extend({ MeshLineGeometry, MeshLineMaterial });

// Preload assets for faster startup
useGLTF.preload('/lanyard/card.glb');
useTexture.preload('/lanyard/lanyard.webp');
useTexture.preload('/lanyard/desain-kartu.webp');

interface LanyardProps {
    position?: [number, number, number];
    gravity?: [number, number, number];
    fov?: number;
    transparent?: boolean;
    isLowPowerMode?: boolean;
}

export function Lanyard({
    position = [0, 0, 30],
    gravity = [0, -40, 0],
    fov = 20,
    transparent = true,
    isLowPowerMode: isLowPowerModeProp
}: LanyardProps) {
    // Shadows the module import so this component reads translated copy.
    const portfolioData = useLocalizedPortfolio();

    const [isMobile, setIsMobile] = useState<boolean>(false);
    const { isLowPowerMode: isLowPowerModeHook } = usePerformance();
    const isLowPowerMode = isLowPowerModeProp ?? isLowPowerModeHook;
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
        const handleResize = (): void => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isLowPowerMode) {
        return (
            <div className="w-full h-full flex items-center justify-center p-8">
                <div className="relative group transition-all duration-500 hover:scale-105">
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-blue-500/10 to-purple-500/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative w-64 aspect-[1.5/2.3] bg-[#0a0a12]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center text-center p-6">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-purple-500" />
                        <div className="relative w-32 h-32 mb-6 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl">
                            <img
                                src={portfolioData.personal.avatar}
                                alt={portfolioData.personal.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white tracking-tight">
                                {portfolioData.personal.name}
                            </h3>
                            <p className="text-sm text-zinc-400 font-medium">
                                {portfolioData.personal.title}
                            </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5 w-full">
                            <div className="flex justify-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                </div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 flex items-center">
                                    Archive Link Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

/**
 * Keeps the whole card in frame at any container size.
 *
 * The camera has a fixed field of view, so a perspective camera's visible WIDTH is
 * `visibleHeight * aspect`. In a narrow column — the contact page gives this a third
 * of the grid — the visible width shrank below the card, and the card (which also
 * swings on the physics rope) was cropped along its edge. Pulling the camera back
 * until the required world width fits keeps it whole on every screen.
 */
function FitCameraToCard({ minVisibleWidth = 4.2 }: { minVisibleWidth?: number }) {
    const camera = useThree((state) => state.camera);
    const size = useThree((state) => state.size);

    useEffect(() => {
        const perspective = camera as THREE.PerspectiveCamera;
        if (!perspective.isPerspectiveCamera) return;

        const aspect = size.width / size.height;
        if (!Number.isFinite(aspect) || aspect <= 0) return;

        const halfFovRad = (perspective.fov * Math.PI) / 360;
        // Distance at which `minVisibleWidth` world units span the viewport width.
        const requiredDistance = minVisibleWidth / (2 * Math.tan(halfFovRad) * aspect);

        perspective.position.z = Math.min(40, Math.max(perspective.position.z, requiredDistance));
        perspective.updateProjectionMatrix();
    }, [camera, size.width, size.height, minVisibleWidth]);

    return null;
}

    return (
        <div className="relative z-0 w-full h-full flex justify-center items-center transform scale-100 origin-center">
            <Canvas
                camera={{ position, fov }}
                dpr={[1, isMobile ? 1.5 : 2]}
                gl={{ alpha: transparent, antialias: false, powerPreference: 'high-performance' }}
                onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
            >
                <FitCameraToCard />
                <ambientLight intensity={Math.PI} />
                <Suspense fallback={null}>
                    <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
                        <Band isMobile={isMobile} isDark={isDark} />
                    </Physics>
                </Suspense>
                <Environment blur={0.75}>
                    <Lightformer
                        intensity={2}
                        color="white"
                        position={[0, -1, 5]}
                        rotation={[0, 0, Math.PI / 3]}
                        scale={[100, 0.1, 1]}
                    />
                    <Lightformer
                        intensity={3}
                        color="white"
                        position={[-1, -1, 1]}
                        rotation={[0, 0, Math.PI / 3]}
                        scale={[100, 0.1, 1]}
                    />
                    <Lightformer
                        intensity={3}
                        color="white"
                        position={[1, 1, 1]}
                        rotation={[0, 0, Math.PI / 3]}
                        scale={[100, 0.1, 1]}
                    />
                    <Lightformer
                        intensity={10}
                        color="white"
                        position={[-10, 0, 14]}
                        rotation={[0, Math.PI / 2, Math.PI / 3]}
                        scale={[100, 10, 1]}
                    />
                </Environment>
            </Canvas>
        </div>
    );
}

interface BandProps {
    maxSpeed?: number;
    minSpeed?: number;
    isMobile?: boolean;
    isDark?: boolean;
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false, isDark = false }: BandProps) {
    const band = useRef<any>(null);
    const fixed = useRef<any>(null);
    const j1 = useRef<any>(null);
    const j2 = useRef<any>(null);
    const j3 = useRef<any>(null);
    const card = useRef<any>(null);

    const vec = new THREE.Vector3();
    const ang = new THREE.Vector3();
    const rot = new THREE.Vector3();
    const dir = new THREE.Vector3();

    const segmentProps: any = {
        type: 'dynamic' as RigidBodyProps['type'],
        canSleep: true,
        colliders: false,
        angularDamping: 4,
        linearDamping: 4
    };

    const { nodes, materials } = useGLTF('/lanyard/card.glb') as any;
    const texture = useTexture('/lanyard/lanyard.webp');
    const customCardTexture = useTexture('/lanyard/desain-kartu.webp');

    // The GLTF model requires flipY to be false for its UV mapping
    customCardTexture.flipY = false;

    /**
     * Fit the card artwork to the card face without distorting it.
     *
     * The mesh's front face is 0.716 wide for every 1.0 tall, but the artwork is a
     * 3750x4219 image — 0.889 wide for every 1.0 tall. Because the UVs stretch the
     * whole image across the whole face, the artwork was being squeezed horizontally
     * by about 19%: the portrait on the card was visibly narrowed and the lettering
     * along with it.
     *
     * Sampling a centred sub-rectangle of the texture instead ("cover" behaviour)
     * keeps the proportions true. The 19% that falls outside the crop is the plain
     * background margin either side of the portrait frame, so nothing of the design
     * is lost. The face aspect is read from the geometry rather than hardcoded, so
     * this stays correct if the model is ever replaced.
     */
    const cardTexture = useMemo(() => {
        const image = customCardTexture.image as { width: number; height: number } | undefined;
        const geometry = nodes?.card?.geometry;
        if (!image?.width || !image?.height || !geometry) return customCardTexture;

        geometry.computeBoundingBox?.();
        const box = geometry.boundingBox;
        if (!box) return customCardTexture;

        const faceAspect = (box.max.x - box.min.x) / (box.max.y - box.min.y);
        const textureAspect = image.width / image.height;
        if (!faceAspect || !textureAspect) return customCardTexture;

        const fitted = customCardTexture.clone();
        fitted.flipY = false;
        fitted.wrapS = fitted.wrapT = THREE.ClampToEdgeWrapping;

        if (textureAspect > faceAspect) {
            // Artwork is relatively wider than the face — crop its sides.
            const visible = faceAspect / textureAspect;
            fitted.repeat.set(visible, 1);
            fitted.offset.set((1 - visible) / 2, 0);
        } else {
            // Artwork is relatively taller than the face — crop top and bottom.
            const visible = textureAspect / faceAspect;
            fitted.repeat.set(1, visible);
            fitted.offset.set(0, (1 - visible) / 2);
        }

        fitted.needsUpdate = true;
        return fitted;
    }, [customCardTexture, nodes]);

    // Use the original lanyard texture directly for light mode (black)
    // For dark mode, convert the black background to dark grey (#333333)
    const stringTexture = useMemo(() => {
        if (!texture) return null;
        if (!isDark) return texture;

        const img = texture.image;
        if (!img) return texture;

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return texture;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Target grey value for the black background in dark mode
        const greyValue = 50; // equivalent to dark grey

        for (let i = 0; i < data.length; i += 4) {
            // Check brightness to determine if it's the black background or a white star
            const brightness = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);

            // If it's dark (background), turn it to dark grey. If it's bright (star), keep it.
            if (brightness < 128) {
                data[i] = greyValue;
                data[i + 1] = greyValue;
                data[i + 2] = greyValue;
            }
        }
        ctx.putImageData(imageData, 0, 0);

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.colorSpace = texture.colorSpace;
        return tex;
    }, [texture, isDark]);
    const [curve] = useState(
        () =>
            new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
    );
    const [dragged, drag] = useState<false | THREE.Vector3>(false);
    const [hovered, hover] = useState(false);

    useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
    useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
    useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
    useSphericalJoint(j3, card, [
        [0, 0, 0],
        [0, 1.45, 0]
    ]);

    useEffect(() => {
        if (hovered) {
            document.body.style.cursor = dragged ? 'grabbing' : 'grab';
            return () => {
                document.body.style.cursor = 'auto';
            };
        }
    }, [hovered, dragged]);

    useFrame((state, delta) => {
        if (dragged && typeof dragged !== 'boolean') {
            vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
            dir.copy(vec).sub(state.camera.position).normalize();
            vec.add(dir.multiplyScalar(state.camera.position.length()));
            [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
            card.current?.setNextKinematicTranslation({
                x: vec.x - dragged.x,
                y: vec.y - dragged.y,
                z: vec.z - dragged.z
            });
        }
        if (fixed.current) {
            [j1, j2].forEach(ref => {
                if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
                const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
                ref.current.lerped.lerp(
                    ref.current.translation(),
                    delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
                );
            });
            curve.points[0].copy(j3.current.translation());
            curve.points[1].copy(j2.current.lerped);
            curve.points[2].copy(j1.current.lerped);
            curve.points[3].copy(fixed.current.translation());
            band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
            ang.copy(card.current.angvel());
            rot.copy(card.current.rotation());
            card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
        }
    });

    curve.curveType = 'chordal';
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

    return (
        <>
            <group position={[0, 4, 0]}>
                <RigidBody ref={fixed} {...segmentProps} type={'fixed' as RigidBodyProps['type']} />
                <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
                    <BallCollider args={[0.1]} />
                </RigidBody>
                <RigidBody
                    position={[2, 0, 0]}
                    ref={card}
                    {...segmentProps}
                    type={dragged ? ('kinematicPosition' as RigidBodyProps['type']) : ('dynamic' as RigidBodyProps['type'])}
                >
                    <CuboidCollider args={[0.8, 1.125, 0.01]} />
                    <group
                        scale={2.25}
                        position={[0, -1.2, -0.05]}
                        onPointerOver={() => hover(true)}
                        onPointerOut={() => hover(false)}
                        onPointerUp={(e: any) => {
                            e.target.releasePointerCapture(e.pointerId);
                            drag(false);
                        }}
                        onPointerDown={(e: any) => {
                            e.target.setPointerCapture(e.pointerId);
                            drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
                        }}
                    >
                        <mesh geometry={nodes.card.geometry}>
                            <meshBasicMaterial
                                map={cardTexture}
                                map-anisotropy={16}
                                color="#ffffff"
                                toneMapped={false}
                            />
                        </mesh>
                        <mesh geometry={nodes.clip.geometry} material={materials.metal}>
                            <meshStandardMaterial color={isDark ? "#333333" : "#111111"} roughness={0.3} metalness={0.8} />
                        </mesh>
                        <mesh geometry={nodes.clamp.geometry}>
                            <meshStandardMaterial color={isDark ? "#333333" : "#111111"} roughness={0.3} metalness={0.8} />
                        </mesh>
                    </group>
                </RigidBody>
            </group>
            <mesh ref={band}>
                <meshLineGeometry />
                <meshLineMaterial
                    color="white"
                    depthTest={false}
                    resolution={isMobile ? [1000, 2000] : [1000, 1000]}
                    useMap={1}
                    map={stringTexture}
                    repeat={[-4, 1]}
                    lineWidth={1}
                />
            </mesh>
        </>
    );
}