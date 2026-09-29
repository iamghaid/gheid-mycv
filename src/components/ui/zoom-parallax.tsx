'use client';

import Image from 'next/image';
import { useScroll, useTransform, motion, MotionValue } from 'framer-motion';
import { useRef } from 'react';

interface ZoomImage {
	src: string;
	alt?: string;
}

interface ZoomParallaxProps {
	/** Images to zoom. At most seven are shown — one per layout slot. */
	images: ZoomImage[];
	children?: React.ReactNode;
}

/**
 * The composition is laid out inside a "stage" whose proportions are fixed, rather
 * than directly against the viewport.
 *
 * The previous version sized every tile as `h-[25vh] w-[25vw]` and positioned them
 * with independent `vw` / `vh` offsets. Because the two axes came from different
 * dimensions, the whole arrangement sheared with the viewport's aspect ratio: on a
 * phone (390x844) a "25vw x 25vh" tile is 97x211 — a tall slot — while on an
 * ultrawide (2560x1080) the same tile is 640x270, a wide one. Tiles drifted off
 * screen at the extremes and the balance of the grouping was different on every
 * machine.
 *
 * Here the stage is sized to fit inside the viewport on both axes
 * (`min(100vw, 100vh * aspect)`), and every tile's size and offset is a percentage
 * of that stage. The arrangement therefore looks the same everywhere and can never
 * overflow. Only the stage's own aspect and an overall tile scale change between
 * breakpoints, so the grouping stays comfortably large on a phone without becoming
 * sparse on a desktop.
 */

/** Tile geometry as percentages of the stage; x/y are offsets from the stage centre. */
const SLOTS = [
	{ w: 25, h: 25, x: 0, y: 0, zoom: 4 },
	{ w: 35, h: 30, x: 5, y: -30, zoom: 5 },
	{ w: 20, h: 45, x: -25, y: -10, zoom: 6 },
	{ w: 25, h: 25, x: 27.5, y: 0, zoom: 5 },
	{ w: 20, h: 25, x: 5, y: 27.5, zoom: 6 },
	{ w: 30, h: 25, x: -22.5, y: 27.5, zoom: 8 },
	{ w: 15, h: 15, x: 25, y: 22.5, zoom: 9 },
];

/**
 * Which slots to fill first. Slot 0 is the centre (it carries the call to action);
 * the rest are ordered so that a short image list still reads as balanced — four
 * images land centre, left, right and bottom rather than clustering on one side.
 */
const SLOT_ORDER = [0, 2, 3, 4, 1, 5, 6];

export function ZoomParallax({ images, children }: ZoomParallaxProps) {
	const container = useRef(null);
	const { scrollYProgress } = useScroll({
		target: container,
		offset: ['start start', 'end end'],
	});

	// One transform per slot, declared unconditionally so hook order never varies.
	const zooms: MotionValue<number>[] = [
		useTransform(scrollYProgress, [0, 1], [1, SLOTS[0].zoom]),
		useTransform(scrollYProgress, [0, 1], [1, SLOTS[1].zoom]),
		useTransform(scrollYProgress, [0, 1], [1, SLOTS[2].zoom]),
		useTransform(scrollYProgress, [0, 1], [1, SLOTS[3].zoom]),
		useTransform(scrollYProgress, [0, 1], [1, SLOTS[4].zoom]),
		useTransform(scrollYProgress, [0, 1], [1, SLOTS[5].zoom]),
		useTransform(scrollYProgress, [0, 1], [1, SLOTS[6].zoom]),
	];

	const used = SLOT_ORDER.slice(0, Math.min(images.length, SLOTS.length));

	return (
		<div ref={container} className="relative h-[300vh] z-[1]">
			<div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
				{/*
				  Stage aspect and tile scale are the only things that change between
				  breakpoints. `--zp-a` keeps the stage inside the viewport on both axes;
				  `--zp-s` keeps the tiles generous on small screens.
				*/}
				<div
					className="relative [--zp-a:0.8] [--zp-s:1.3] sm:[--zp-a:1.2] sm:[--zp-s:1.15] lg:[--zp-a:1.7778] lg:[--zp-s:1]"
					style={{
						width: 'min(100vw, calc(100vh * var(--zp-a)))',
						height: 'min(100vh, calc(100vw / var(--zp-a)))',
					}}
				>
					{used.map((slotIndex, i) => {
						const slot = SLOTS[slotIndex];
						const image = images[i];
						const isCentre = slotIndex === 0;

						return (
							<motion.div
								key={image.src + i}
								style={{
									position: 'absolute',
									// Size and offset are percentages of the stage, so the whole
									// arrangement scales as one piece.
									width: `calc(${slot.w}% * var(--zp-s))`,
									height: `calc(${slot.h}% * var(--zp-s))`,
									left: `calc(${50 + slot.x}% - ${slot.w / 2}% * var(--zp-s))`,
									top: `calc(${50 + slot.y}% - ${slot.h / 2}% * var(--zp-s))`,
									scale: zooms[slotIndex],
									// The centre tile carries the call to action, so it has to sit
									// above its neighbours — on small screens the tiles are scaled up
									// and overlap, and it was being covered.
									zIndex: isCentre ? 2 : 1,
								}}
								className="overflow-hidden rounded-2xl border border-white/10 bg-muted/20 shadow-2xl"
							>
								<div className="group relative h-full w-full">
									<Image
										src={image.src}
										alt={image.alt || ''}
										fill
										sizes="(max-width: 640px) 60vw, (max-width: 1024px) 45vw, 40vw"
										className="object-cover transition-transform duration-700 group-hover:scale-105"
									/>
									{isCentre && children && (
										<>
											<div className="absolute inset-0 bg-black/40 transition-colors duration-500 group-hover:bg-black/60" />
											<div className="absolute inset-0 flex items-center justify-center p-2">
												{children}
											</div>
										</>
									)}
								</div>
							</motion.div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
