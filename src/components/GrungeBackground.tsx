import React, { useEffect, useRef } from 'react';

interface GrungeBackgroundProps {
  mousePos?: { x: number; y: number; active: boolean };
  intensity?: number;
  useDirectReferenceBg?: boolean;
}

export const GrungeBackground: React.FC<GrungeBackgroundProps> = ({
  mousePos,
  intensity = 1,
  useDirectReferenceBg = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;

    const renderTexture = () => {
      const width = (canvas.width = window.innerWidth);
      const height = (canvas.height = window.innerHeight);

      ctx.clearRect(0, 0, width, height);

      // PRNG generator for uniform distressed grunge map
      const prng = (seed: number) => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };

      // Heavy dense splatter resembling the reference image's black ink splatter
      const numDenseSpecks = Math.floor((width * height) / 180);
      ctx.fillStyle = '#020000';

      for (let i = 0; i < numDenseSpecks; i++) {
        const x = prng(i * 1.7) * width;
        const y = prng(i * 3.3) * height;
        const radius = prng(i * 5.9) * 2.6 + 0.6;
        const alpha = (prng(i * 11.1) * 0.7 + 0.2) * intensity;

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Large organic ink pools & blotches matching the reference photo
      const numBlotches = Math.floor((width * height) / 7000);
      for (let b = 0; b < numBlotches; b++) {
        const bx = prng(b * 13.7) * width;
        const by = prng(b * 19.1) * height;
        const blotchRadius = prng(b * 23.3) * 55 + 20;
        const flecks = Math.floor(prng(b * 29.7) * 35 + 15);

        ctx.fillStyle = prng(b * 31.1) > 0.25 ? '#030000' : '#220101';

        for (let f = 0; f < flecks; f++) {
          const angle = prng(b * 100 + f * 7.3) * Math.PI * 2;
          const dist = Math.pow(prng(b * 100 + f * 11.7), 0.6) * blotchRadius;
          const px = bx + Math.cos(angle) * dist;
          const py = by + Math.sin(angle) * dist;
          const size = prng(b * 100 + f * 17.1) * 4.2 + 0.8;
          const alpha = (prng(b * 100 + f * 23.9) * 0.75 + 0.25) * intensity;

          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.ellipse(
            px,
            py,
            size,
            size * (prng(f * 19.3) * 0.7 + 0.5),
            angle,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }

      // Heavy horizontal & diagonal distressed streaks
      const numCracks = Math.floor(width / 45);
      ctx.strokeStyle = '#020000';
      ctx.lineWidth = 1.6;
      for (let s = 0; s < numCracks; s++) {
        const sx = prng(s * 37.1) * width;
        const sy = prng(s * 41.3) * height;
        const len = prng(s * 43.9) * 35 + 12;
        const angle = prng(s * 47.1) * Math.PI * 2;

        ctx.globalAlpha = (prng(s * 51.7) * 0.6 + 0.2) * intensity;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        ctx.stroke();
      }

      ctx.globalAlpha = 1.0;
    };

    renderTexture();

    const handleResize = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(renderTexture);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <div
      id="grunge-background-container"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
    >
      {/* Exact Reference Blood Red Base Layer (#ba1414 with dark vignette) */}
      <div
        className="absolute inset-0 bg-[#ba1414]"
        style={{
          background: 'linear-gradient(180deg, #100101 0%, #700606 18%, #bc1313 45%, #d42222 62%, #780707 85%, #050000 100%)',
        }}
      />

      {/* Primary Radial Glow: Scarlet Center Hotspot matching reference photo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% 64%, rgba(240, 45, 45, 0.45) 0%, rgba(190, 18, 18, 0.3) 40%, rgba(80, 5, 5, 0.25) 75%, rgba(10, 0, 0, 0.20) 100%)',
        }}
      />

      {/* Interactive mouse spotlight for dynamic feel */}
      {mousePos && mousePos.active && (
        <div
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle 420px at ${mousePos.x}px ${mousePos.y}px, rgba(255, 75, 75, 0.20) 0%, rgba(210, 20, 20, 0.08) 45%, transparent 75%)`,
          }}
        />
      )}

      {/* SVG Turbulence Micro-Grit Layer */}
      <svg className="absolute inset-0 w-full h-full opacity-40 mix-blend-multiply pointer-events-none">
        <filter id="referenceGrungeFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="
              0.2 0   0   0   0
              0   0.05 0  0   0
              0   0   0.05 0  0
              0   0   0   1.2 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#referenceGrungeFilter)" />
      </svg>

      {/* Procedural High-Density Splatter Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60 mix-blend-multiply"
      />

      {/* Top Vignette Bar (Reduced to 20% shadow) */}
      <div
        className="absolute top-0 left-0 right-0 h-40 sm:h-52 md:h-64 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.12) 40%, transparent 100%)',
        }}
      />

      {/* Bottom Vignette Bar (Reduced to 20% shadow) */}
      <div
        className="absolute bottom-0 left-0 right-0 h-44 sm:h-60 md:h-72 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.12) 40%, transparent 100%)',
        }}
      />

      {/* Left/Right Edge Radial Shadows (Reduced to 20% shadow) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 95% 85% at center, transparent 60%, rgba(0, 0, 0, 0.10) 85%, rgba(0, 0, 0, 0.20) 100%)',
        }}
      />
    </div>
  );
};
