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
import { useLocalizedPortfolio } from '@/hooks/useLocalizedPortfolio';
import { useTranslations } from 'next-intl';
import { useSiteView } from '@/providers/ContentProvider';

extend({ MeshLineGeometry, MeshLineMaterial });

// Preload assets for faster startup
useGLTF.preload('/lanyard/card.glb');
useTexture.preload('/lanyard/lanyard.webp');

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
    const tCard = useTranslations('contact.card');
    // Name, role and photo come from the admin (Profile → Contact card).
    const card = useSiteView().card;

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
                        <div className="relative w-40 aspect-square mb-6 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl">
                            <img
                                src={card.avatar || portfolioData.personal.avatar}
                                alt={card.name}
                                className="w-full h-full object-cover object-center"
                            />
                        </div>
                        <div className="space-y-2">
                            <h3 dir="rtl" className="text-xl font-bold text-white">
                                {card.name}
                            </h3>
                            <p dir="ltr" className="text-sm text-[#8FD3B6] font-semibold tracking-wide">
                                {card.role}
                            </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5 w-full">
                            <div className="flex justify-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                </div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 flex items-center">
                                    {tCard('label')}
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
    const cardInfo = useSiteView().card;
    const portrait = useTexture(cardInfo.avatar || '/about/gheid.jpg');
    const cardTexture = useCardTexture(portrait, cardInfo.name, cardInfo.role);

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

/*
 * Card artwork, drawn at runtime onto a texture atlas that matches the model's UVs.
 *
 * card.glb does not stretch one image over the whole card: its FRONT face samples
 * only the left half of the texture (u 0–0.5) and the top 75.7% of it (v 0–0.757),
 * and the BACK face samples the right half. The old artwork was a single portrait
 * image, so the front showed just its left half — the photo looked cut down the
 * middle. Drawing the atlas here puts a centred, square-cropped portrait with the
 * name and role underneath exactly inside the front region, at the face's true
 * 0.716 : 1 proportions, so nothing is stretched or cropped.
 */
const ATLAS_W = 2048;
const ATLAS_H = 1890; // 0.5 * W / 0.757 / 0.716 ≈ 1890 keeps the face region undistorted
const FACE_W = ATLAS_W / 2;
const FACE_H = Math.round(ATLAS_H * 0.757);

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function drawCardArtwork(ctx: CanvasRenderingContext2D, portrait: THREE.Texture, name: string, role: string) {
    const inter = getComputedStyle(document.body).getPropertyValue('--font-inter').trim() || 'sans-serif';
    const accent = '#1E6B52';

    // Base fill for the whole atlas (also covers the card edges).
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, ATLAS_W, ATLAS_H);

    // ---- Front face ----
    const bg = ctx.createLinearGradient(0, 0, 0, FACE_H);
    bg.addColorStop(0, '#161616');
    bg.addColorStop(1, '#0b0b0b');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, FACE_W, FACE_H);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, FACE_W, 26);
    ctx.fillRect(0, FACE_H - 26, FACE_W, 26);

    // Square portrait, centred horizontally.
    const side = 760;
    const px = (FACE_W - side) / 2;
    const py = 170;
    ctx.save();
    roundedRect(ctx, px, py, side, side, 44);
    ctx.clip();
    const img = portrait.image as CanvasImageSource & { width: number; height: number };
    if (img?.width && img?.height) {
        // "cover" crop to a square, biased slightly toward the top of the photo
        const s = Math.min(img.width, img.height);
        const sx = (img.width - s) / 2;
        const sy = Math.max(0, (img.height - s) * 0.2);
        ctx.drawImage(img, sx, sy, s, s, px, py, side, side);
    } else {
        ctx.fillStyle = '#222';
        ctx.fillRect(px, py, side, side);
    }
    ctx.restore();
    roundedRect(ctx, px, py, side, side, 44);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.stroke();

    // Name and role, centred under the portrait.
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.direction = 'rtl';
    ctx.fillStyle = '#F5F2EA';
    ctx.font = `700 96px "thmanyah Sans", ${inter}, sans-serif`;
    ctx.fillText(name, FACE_W / 2, py + side + 150);
    ctx.direction = 'ltr';
    ctx.fillStyle = '#8FD3B6';
    ctx.font = `600 54px ${inter}, sans-serif`;
    ctx.fillText(role, FACE_W / 2, py + side + 245);

    // ---- Back face: text-free so it reads correctly from either side ----
    ctx.fillStyle = '#101010';
    ctx.fillRect(FACE_W, 0, FACE_W, FACE_H);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let y = 60; y < FACE_H; y += 48) {
        for (let x = FACE_W + 40; x < ATLAS_W; x += 48) {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.fillStyle = accent;
    ctx.fillRect(FACE_W, 0, FACE_W, 26);
    ctx.fillRect(FACE_W, FACE_H - 26, FACE_W, 26);
}

function useCardTexture(portrait: THREE.Texture, name: string, role: string) {
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = ATLAS_W;
        canvas.height = ATLAS_H;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        drawCardArtwork(ctx, portrait, name, role);

        const tex = new THREE.CanvasTexture(canvas);
        tex.flipY = false; // the GLTF UVs expect an un-flipped texture
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 16;
        tex.needsUpdate = true;
        return tex;
    }, [portrait, name, role]);

    // Canvas text only uses a web font once it has loaded. Redraw in place when it
    // has, rather than through React state: a re-render of <Band> re-creates its
    // rope joints and the physics would visibly reset.
    useEffect(() => {
        if (!texture) return;
        let cancelled = false;
        const inter = getComputedStyle(document.body).getPropertyValue('--font-inter').trim() || 'sans-serif';
        Promise.all([
            document.fonts.load(`700 96px "thmanyah Sans"`, name),
            document.fonts.load(`600 54px ${inter}`, role),
        ])
            .catch(() => undefined)
            .then(() => {
                if (cancelled) return;
                const ctx = (texture.image as HTMLCanvasElement).getContext('2d');
                if (!ctx) return;
                drawCardArtwork(ctx, portrait, name, role);
                texture.needsUpdate = true;
            });
        return () => { cancelled = true; };
    }, [texture, portrait, name, role]);

    useEffect(() => () => texture?.dispose(), [texture]);
    return texture;
}
