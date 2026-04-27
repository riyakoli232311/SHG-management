/**
 * MagicBento — SHG Admin Dashboard Edition
 * Interactive bento grid with spotlight, particle stars, 3D tilt, magnetism & border glow.
 * Adapted from the MagicBento reference component with SHG-specific card data + theming.
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { LucideIcon } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface BentoStatCard {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub: string;
  accent: string; // CSS color string
}

export interface MagicBentoProps {
  cards: BentoStatCard[];
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  glowColor?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const DEFAULT_PARTICLE_COUNT = 8;
const DEFAULT_SPOTLIGHT_RADIUS = 280;
const DEFAULT_GLOW_COLOR = '194, 24, 91'; // #C2185B pink
const MOBILE_BREAKPOINT = 768;

// ── Particle factory ──────────────────────────────────────────────────────────
function createParticle(x: number, y: number, color: string): HTMLDivElement {
  const el = document.createElement('div');
  el.style.cssText = `
    position:absolute;width:3px;height:3px;border-radius:50%;
    background:rgba(${color},1);box-shadow:0 0 5px rgba(${color},0.7);
    pointer-events:none;z-index:100;left:${x}px;top:${y}px;
  `;
  return el;
}

// ── ParticleCard ──────────────────────────────────────────────────────────────
const ParticleCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  disableAnimations?: boolean;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
}> = ({
  children,
  className = '',
  style,
  disableAnimations = false,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  enableMagnetism = false,
  clickEffect = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const hoveredRef = useRef(false);

  const clearParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    particlesRef.current.forEach(p => {
      gsap.to(p, {
        scale: 0, opacity: 0, duration: 0.3, ease: 'back.in(1.7)',
        onComplete: () => p.parentNode?.removeChild(p),
      });
    });
    particlesRef.current = [];
  }, []);

  const spawnParticles = useCallback(() => {
    if (!cardRef.current || !hoveredRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    for (let i = 0; i < particleCount; i++) {
      const id = setTimeout(() => {
        if (!hoveredRef.current || !cardRef.current) return;
        const p = createParticle(Math.random() * width, Math.random() * height, glowColor);
        cardRef.current.appendChild(p);
        particlesRef.current.push(p);
        gsap.fromTo(p, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' });
        gsap.to(p, {
          x: (Math.random() - 0.5) * 80, y: (Math.random() - 0.5) * 80,
          rotation: Math.random() * 360, duration: 2 + Math.random() * 2,
          ease: 'none', repeat: -1, yoyo: true,
        });
      }, i * 80) as unknown as number;
      timeoutsRef.current.push(id);
    }
  }, [particleCount, glowColor]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    const el = cardRef.current;

    const onEnter = () => { hoveredRef.current = true; spawnParticles(); };
    const onLeave = () => {
      hoveredRef.current = false;
      clearParticles();
      gsap.to(el, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
    };
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.width / 2, cy = rect.height / 2;
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      if (enableTilt) {
        gsap.to(el, {
          rotateX: ((y - cy) / cy) * -8, rotateY: ((x - cx) / cx) * 8,
          duration: 0.1, ease: 'power2.out', transformPerspective: 1000,
        });
      }
      if (enableMagnetism) {
        gsap.to(el, { x: (x - cx) * 0.04, y: (y - cy) * 0.04, duration: 0.3, ease: 'power2.out' });
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!clickEffect) return;
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position:absolute;width:8px;height:8px;border-radius:50%;
        background:rgba(${glowColor},0.45);
        left:${e.clientX - rect.left}px;top:${e.clientY - rect.top}px;
        pointer-events:none;z-index:1000;
      `;
      el.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, {
        scale: 45, opacity: 0, duration: 0.7, ease: 'power2.out',
        onComplete: () => ripple.remove(),
      });
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('click', onClick);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('click', onClick);
      clearParticles();
    };
  }, [spawnParticles, clearParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return (
    <div ref={cardRef} className={className} style={{ ...style, position: 'relative', overflow: 'hidden' }}>
      {children}
    </div>
  );
};

// ── MagicBento ────────────────────────────────────────────────────────────────
export const MagicBento: React.FC<MagicBentoProps> = ({
  cards,
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const noAnim = disableAnimations || isMobile;

  // Spotlight: update CSS custom properties on each card
  useEffect(() => {
    if (!enableSpotlight || noAnim) return;
    const handle = (e: MouseEvent) => {
      if (!gridRef.current) return;
      gridRef.current.querySelectorAll<HTMLElement>('.mb-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        card.style.setProperty('--my', `${e.clientY - rect.top}px`);
        card.style.setProperty('--sr', `${spotlightRadius}px`);
        card.style.setProperty('--gc', `rgba(${glowColor},0.15)`);
      });
    };
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, [enableSpotlight, noAnim, spotlightRadius, glowColor]);

  // Grid layout: maps 6 cards into an asymmetric bento
  const gridClass = (i: number) => {
    const spans = [
      'sm:col-span-2 lg:col-span-2 lg:row-span-1',
      'sm:col-span-1 lg:col-span-1 lg:row-span-1',
      'sm:col-span-1 lg:col-span-1 lg:row-span-2',
      'sm:col-span-1 lg:col-span-1 lg:row-span-1',
      'sm:col-span-2 lg:col-span-2 lg:row-span-1',
      'sm:col-span-1 lg:col-span-1 lg:row-span-1',
    ];
    return spans[i] ?? '';
  };

  return (
    <div className="w-full">
      <style>{`
        .mb-card {
          background: #0c0520;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          transition: border-color 0.3s ease;
          min-height: 120px;
        }
        .mb-card:hover { border-color: rgba(${glowColor},0.35); }
        .mb-spotlight {
          position:absolute;inset:0;pointer-events:none;
          background: radial-gradient(var(--sr,280px) circle at var(--mx,50%) var(--my,50%), var(--gc,transparent), transparent 80%);
          opacity:0;transition:opacity 0.3s ease;border-radius:inherit;
        }
        .mb-card:hover .mb-spotlight { opacity:1; }
        .mb-border-glow {
          position:absolute;inset:0;pointer-events:none;border-radius:inherit;padding:1px;
          background: radial-gradient(var(--sr,280px) circle at var(--mx,50%) var(--my,50%), rgba(${glowColor},0.8), transparent 40%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity:0;transition:opacity 0.3s ease;
        }
        .mb-card:hover .mb-border-glow { opacity:1; }
      `}</style>

      <div
        ref={gridRef}
        className="grid gap-3 grid-cols-1 sm:grid-cols-3 lg:grid-cols-4"
        style={{ gridAutoRows: '140px' }}
      >
        {cards.map((card, i) => {
          const Icon = card.icon;
          const inner = (
            <div className={`mb-card h-full w-full p-5 flex flex-col justify-between group ${gridClass(i)}`}>
              {enableSpotlight && <div className="mb-spotlight" />}
              {enableBorderGlow && <div className="mb-border-glow" />}

              {/* Top: icon + label */}
              <div className="relative z-10 flex items-start justify-between">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${card.accent}22` }}
                >
                  <Icon className="w-4 h-4" style={{ color: card.accent }} />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ color: card.accent, background: `${card.accent}18` }}
                >
                  {card.label}
                </span>
              </div>

              {/* Bottom: value + sub */}
              <div className="relative z-10">
                <p className="text-2xl font-black text-white leading-none">{card.value}</p>
                <p className={`text-xs mt-1 text-white/40 ${textAutoHide ? 'line-clamp-1' : ''}`}>
                  {card.sub}
                </p>
              </div>
            </div>
          );

          if (enableStars) {
            return (
              <ParticleCard
                key={i}
                className={`mb-card ${gridClass(i)}`}
                particleCount={particleCount}
                glowColor={glowColor}
                enableTilt={enableTilt}
                enableMagnetism={enableMagnetism}
                clickEffect={clickEffect}
                disableAnimations={noAnim}
              >
                {/* Re-render inner without the outer mb-card class since ParticleCard wraps it */}
                <div className="h-full w-full p-5 flex flex-col justify-between group">
                  {enableSpotlight && <div className="mb-spotlight" />}
                  {enableBorderGlow && <div className="mb-border-glow" />}
                  <div className="relative z-10 flex items-start justify-between">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${card.accent}22` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: card.accent }} />
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ color: card.accent, background: `${card.accent}18` }}
                    >
                      {card.label}
                    </span>
                  </div>
                  <div className="relative z-10">
                    <p className="text-2xl font-black text-white leading-none">{card.value}</p>
                    <p className={`text-xs mt-1 text-white/40 ${textAutoHide ? 'line-clamp-1' : ''}`}>
                      {card.sub}
                    </p>
                  </div>
                </div>
              </ParticleCard>
            );
          }

          return <div key={i} className={`mb-card ${gridClass(i)}`}>{inner}</div>;
        })}
      </div>
    </div>
  );
};

export default MagicBento;
