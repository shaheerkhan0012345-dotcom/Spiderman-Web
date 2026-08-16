import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { GrungeBackground } from './GrungeBackground.tsx';
import spidermanImg from '/spiderman.png';
import shaheerImg from '/shaheer.png';

interface HeroSectionProps {
  initialTitle?: string;
  initialQuoteLines?: string[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  initialTitle = 'SPIDERMAN',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const spidermanRef = useRef<HTMLDivElement | null>(null);
  const shaheerRef = useRef<HTMLDivElement | null>(null);

  // Mouse & Mask State
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [revealRadius, setRevealRadius] = useState<number>(0);

  // Smooth lerped coords for spotlight & HUD ring
  const targetPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetRadius = useRef<number>(0);
  const currentRadius = useRef<number>(0);
  const animFrameId = useRef<number | null>(null);

  // Initial Entrance Animation
  useEffect(() => {
    if (!spidermanRef.current) return;
    gsap.fromTo(
      [spidermanRef.current, shaheerRef.current],
      { opacity: 0, y: '100vh' },
      { opacity: 1, y: '0vh', duration: 1.6, delay: 0.15, ease: 'power3.out' }
    );
  }, []);

  // Smooth 60fps Lerp Loop for natural cursor physics
  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const updatePosition = () => {
      // Lerp positions (0.18 gives snappy yet silky smooth feel)
      currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.18);
      currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.18);
      currentRadius.current = lerp(currentRadius.current, targetRadius.current, 0.14);

      setMousePos({
        x: Math.round(currentPos.current.x * 10) / 10,
        y: Math.round(currentPos.current.y * 10) / 10,
      });
      setRevealRadius(Math.round(currentRadius.current * 10) / 10);

      animFrameId.current = requestAnimationFrame(updatePosition);
    };

    animFrameId.current = requestAnimationFrame(updatePosition);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  // Pointer Handlers
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    targetPos.current = { x, y };

    if (!isHovering) {
      setIsHovering(true);
      targetRadius.current = 180; // default reveal radius
    }
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  }, [isHovering, hasInteracted]);

  const handlePointerEnter = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    targetPos.current = { x, y };
    currentPos.current = { x, y }; // snap on enter for immediate response
    setIsHovering(true);
    targetRadius.current = 180;
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovering(false);
    targetRadius.current = 0;
  }, []);

  const handlePointerDown = useCallback(() => {
    // Expand spotlight slightly on click/tap for impact
    targetRadius.current = 230;
  }, []);

  const handlePointerUp = useCallback(() => {
    targetRadius.current = isHovering ? 180 : 0;
  }, [isHovering]);

  // Mask string for Shaheer reveal layer
  const maskStyle: React.CSSProperties = {
    WebkitMaskImage: revealRadius > 0.5
      ? `radial-gradient(circle ${revealRadius}px at ${mousePos.x}px ${mousePos.y}px, black 35%, rgba(0,0,0,0.85) 65%, transparent 100%)`
      : 'none',
    maskImage: revealRadius > 0.5
      ? `radial-gradient(circle ${revealRadius}px at ${mousePos.x}px ${mousePos.y}px, black 35%, rgba(0,0,0,0.85) 65%, transparent 100%)`
      : 'none',
    opacity: revealRadius > 0.5 ? 1 : 0,
    transition: 'opacity 0.2s ease-out',
  };

  return (
    <div
      ref={containerRef}
      id="hero-section"
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="relative w-full h-screen min-h-[580px] overflow-hidden bg-black select-none cursor-crosshair"
    >
      {/* ── LAYER 1 ── Background: Grunge & Vignette */}
      <GrungeBackground intensity={1} />

      {/* ── LAYER 2 ── Floating Ember / Ash Particles  z-10 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              backgroundColor: i % 2 === 0 ? 'rgba(255, 120, 80, 0.75)' : 'rgba(255, 230, 180, 0.65)',
              boxShadow: '0 0 8px rgba(255, 80, 20, 0.8)',
              left: `${(i * 4.3 + 2) % 100}%`,
              top: `${(i * 7.1 + 5) % 100}%`,
            }}
            animate={{
              y: [0, -120 - (i * 8)],
              x: [0, (i % 2 === 0 ? 1 : -1) * (20 + (i * 3))],
              opacity: [0, 0.8, 0],
              scale: [0.8, 1.2, 0.6],
            }}
            transition={{
              duration: 4 + (i % 4),
              repeat: Infinity,
              delay: (i * 0.25) % 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* ── LAYER 3 ── SPIDERMAN Typography  z-15  (text sits BEHIND Spider-Man) */}
      <motion.div
        id="hero-title-container"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute w-full left-0 flex items-center justify-center pointer-events-none select-none px-2 sm:px-4 md:px-6"
        style={{
          zIndex: 15,
          top: 'clamp(100px, 26vh, 195px)',
        }}
      >
        <h1
          id="hero-title"
          className="text-white text-center select-none uppercase drop-shadow-[0_6px_20px_rgba(0,0,0,0.35)] w-full inline-block whitespace-nowrap"
          style={{
            fontFamily: "'Impact', 'Anton', 'League Gothic', sans-serif",
            fontWeight: 400,
            fontSize: 'clamp(88px, 20.8vw, 268px)',
            lineHeight: 0.86,
            letterSpacing: '-0.032em',
            color: '#ffffff',
            transform: 'scale(1.07, 0.91)',
            transformOrigin: 'center center',
          }}
        >
          {initialTitle}
        </h1>
      </motion.div>

      {/* ── LAYER 4A ── Spider-Man Base Foreground  z-20 */}
      <div
        ref={spidermanRef}
        id="spiderman-foreground"
        className="spiderman-foreground absolute inset-0 pointer-events-none select-none flex items-end justify-center"
        style={{ zIndex: 20, opacity: 0 }}
      >
        <img
          src={spidermanImg}
          alt="Spider-Man"
          draggable={false}
          style={{
            display: 'block',
            height: '210vh',
            width: 'auto',
            transform: 'rotate(-90deg)',
            transformOrigin: 'center center',
            marginBottom: '-52vh',
            imageRendering: 'high-quality' as React.CSSProperties['imageRendering'],
            willChange: 'transform',
            backfaceVisibility: 'hidden' as React.CSSProperties['backfaceVisibility'],
            filter: 'contrast(1.12) brightness(1.03) saturate(1.05)',
          }}
        />
      </div>

      {/* ── LAYER 4B ── Shaheer Reveal Foreground z-22 (Masked dynamic spotlight) */}
      <div
        ref={shaheerRef}
        id="shaheer-foreground"
        className="shaheer-foreground absolute inset-0 pointer-events-none select-none flex items-end justify-center"
        style={{
          zIndex: 22,
          ...maskStyle,
        }}
      >
        <img
          src={shaheerImg}
          alt="Shaheer"
          draggable={false}
          style={{
            display: 'block',
            height: '92vh',
            maxHeight: '92vh',
            width: 'auto',
            objectFit: 'contain',
            objectPosition: 'bottom center',
            transform: 'none',
            transformOrigin: 'center bottom',
            marginBottom: '0',
            imageRendering: 'high-quality' as React.CSSProperties['imageRendering'],
            willChange: 'transform',
            backfaceVisibility: 'hidden' as React.CSSProperties['backfaceVisibility'],
            filter: 'contrast(1.08) brightness(1.05) saturate(1.08) drop-shadow(0 0 35px rgba(255,40,40,0.4))',
          }}
        />
      </div>

      {/* ── LAYER 4C ── Spider-Sense Glowing Portal Lens / Reticle HUD z-25 */}
      {revealRadius > 2 && (
        <div
          className="pointer-events-none absolute"
          style={{
            zIndex: 25,
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: 'translate(-50%, -50%)',
            width: `${revealRadius * 2}px`,
            height: `${revealRadius * 2}px`,
          }}
        >
          {/* Luminous Outer Energy Ring */}
          <div
            className="absolute inset-0 rounded-full border border-red-500/70 animate-pulse"
            style={{
              boxShadow: '0 0 25px 4px rgba(239, 68, 68, 0.6), inset 0 0 25px 2px rgba(239, 68, 68, 0.35)',
              borderWidth: '1.5px',
            }}
          />

          {/* Secondary Golden Electric Ring */}
          <div
            className="absolute inset-1 rounded-full border border-amber-400/40"
            style={{
              borderStyle: 'dashed',
              animation: 'spin 12s linear infinite',
            }}
          />

          {/* Center Web/Reticle Marker */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
            <div className="w-6 h-6 border border-white/50 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_#ff2020]" />
            </div>
          </div>

          {/* Identity Tag Badge floating by cursor */}
          <div
            className="absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/60 backdrop-blur-md text-[10px] tracking-widest font-mono uppercase text-red-200 whitespace-nowrap shadow-lg flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            <span>IDENTITY REVEALED // SHAHEER</span>
          </div>
        </div>
      )}

      {/* ── LAYER 5 ── Quote  z-12  (behind Spider-Man, anchored lower-left) */}
      <motion.div
        id="hero-quote-block"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="absolute pointer-events-none select-none"
        style={{
          zIndex: 12,
          position: 'absolute',
          left: 'clamp(24px, 4.5vw, 58px)',
          bottom: 'clamp(28px, 6vh, 56px)',
          width: 'clamp(220px, 23.5vw, 290px)',
          transform: 'scaleX(1.18)',
          transformOrigin: 'left bottom',
        }}
      >
        <div
          className="text-white uppercase select-none text-left drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] flex flex-col items-start"
          style={{
            fontFamily: "'Bebas Neue', 'Roboto Condensed', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(26px, 5.83vh, 42px)',
            lineHeight: 1.05,
            color: '#ffffff',
            letterSpacing: '0.01em',
            textAlign: 'left',
          }}
        >
          <p className="m-0 p-0 tracking-tight text-left w-full">GREAT POWER</p>
          <p className="m-0 p-0 tracking-tight text-left w-full">COMES FROM</p>
          <p className="m-0 p-0 tracking-tight text-left w-full">GREAT</p>
          <p className="m-0 p-0 tracking-tight text-left w-full">RESPONSIBILITY</p>
        </div>
      </motion.div>

      {/* ── LAYER 6 ── Interactive Instruction Pill (auto fades out once user interacts) */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="absolute bottom-6 right-6 z-30 pointer-events-none select-none hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 border border-white/20 backdrop-blur-md text-xs font-mono tracking-wider text-neutral-300 shadow-2xl"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>MOVE CURSOR OVER SPIDER-MAN TO REVEAL</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
