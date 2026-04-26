/**
 * MagicBento — SHG Navigation Edition
 * Matches the reference implementation exactly:
 * bg-[#060010] outer, #0a041a cards, purple glow, white text, premium grid layout.
 */
import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Users, PiggyBank, Landmark,
  CalendarCheck, BarChart3, MessageCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────
export interface SHGBentoCard {
  title: string;
  description: string;
  label: string;
  icon: React.ElementType;
  color: string;
  to?: string;
}

export interface MagicBentoProps {
  cards?: SHGBentoCard[];
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  glowColor?: string;
  disableAnimations?: boolean;
  textAutoHide?: boolean;
}

// ─── Default SHG Cards ───────────────────────────────────────────
export const SHG_BENTO_CARDS: SHGBentoCard[] = [
  { title: "Dashboard",   description: "Central overview of financial health, active loans, and monthly savings at a glance.",  label: "Overview",   icon: LayoutDashboard, color: "#C2185B", to: "/dashboard" },
  { title: "Members",     description: "Manage all group members, assign roles, and track individual contributions.",             label: "Community",  icon: Users,           color: "#7C3AED", to: "/members" },
  { title: "Savings",     description: "Record and monitor monthly savings for every Sakhi in your group.",                      label: "Finance",    icon: PiggyBank,       color: "#EF9767", to: "/savings" },
  { title: "Loans",       description: "Disburse internal loans, track outstanding balances, and review repayment schedules.",   label: "Credit",     icon: Landmark,        color: "#0288D1", to: "/loans" },
  { title: "Repayments",  description: "Track EMI schedules, mark paid installments, and find overdue accounts instantly.",      label: "EMI Tracker", icon: CalendarCheck,  color: "#10B981", to: "/repayments" },
  { title: "Reports",     description: "Generate comprehensive financial reports and export for audits or meetings.",             label: "Analytics",  icon: BarChart3,       color: "#F59E0B", to: "/reports" },
];

// ─── Particle factory ─────────────────────────────────────────────
function makeParticle(x: number, y: number, rgb: string): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cssText = `position:absolute;width:4px;height:4px;border-radius:50%;
    background:rgba(${rgb},1);box-shadow:0 0 8px rgba(${rgb},0.8);
    pointer-events:none;z-index:50;left:${x}px;top:${y}px;`;
  return el;
}

// ─── ParticleCard ─────────────────────────────────────────────────
const ParticleCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  particleCount?: number;
  glowRGB?: string;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  disabled?: boolean;
}> = ({
  children, className = "",
  particleCount = 12, glowRGB = "132, 0, 255",
  enableTilt = true, enableMagnetism = true,
  clickEffect = true, disabled = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const particles = useRef<HTMLDivElement[]>([]);
  const timers = useRef<number[]>([]);
  const hovered = useRef(false);

  const kill = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    particles.current.forEach(p =>
      gsap.to(p, { scale: 0, opacity: 0, duration: 0.25, onComplete: () => p.remove() })
    );
    particles.current = [];
  }, []);

  const spawn = useCallback(() => {
    if (!ref.current || !hovered.current) return;
    const { width, height } = ref.current.getBoundingClientRect();
    for (let i = 0; i < particleCount; i++) {
      const t = setTimeout(() => {
        if (!hovered.current || !ref.current) return;
        const p = makeParticle(Math.random() * width, Math.random() * height, glowRGB);
        ref.current.appendChild(p);
        particles.current.push(p);
        gsap.fromTo(p, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" });
        gsap.to(p, { x: (Math.random() - 0.5) * 90, y: (Math.random() - 0.5) * 90, rotation: Math.random() * 360, duration: 2.5, ease: "none", repeat: -1, yoyo: true });
      }, i * 80) as unknown as number;
      timers.current.push(t);
    }
  }, [particleCount, glowRGB]);

  useEffect(() => {
    if (disabled || !ref.current) return;
    const el = ref.current;

    const enter = () => { hovered.current = true; spawn(); };
    const leave = () => {
      hovered.current = false; kill();
      gsap.to(el, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.4, ease: "power3.out" });
    };
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const cx = r.width / 2, cy = r.height / 2;
      if (enableTilt) gsap.to(el, { rotateX: ((y - cy) / cy) * -9, rotateY: ((x - cx) / cx) * 9, duration: 0.1, ease: "power2.out", transformPerspective: 900 });
      if (enableMagnetism) gsap.to(el, { x: (x - cx) * 0.04, y: (y - cy) * 0.04, duration: 0.3, ease: "power2.out" });
    };
    const click = (e: MouseEvent) => {
      if (!clickEffect) return;
      const r = el.getBoundingClientRect();
      const rip = document.createElement("div");
      rip.style.cssText = `position:absolute;width:10px;height:10px;border-radius:50%;background:rgba(${glowRGB},0.4);
        left:${e.clientX - r.left}px;top:${e.clientY - r.top}px;pointer-events:none;z-index:999;`;
      el.appendChild(rip);
      gsap.fromTo(rip, { scale: 0, opacity: 1 }, { scale: 45, opacity: 0, duration: 0.75, ease: "power2.out", onComplete: () => rip.remove() });
    };

    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("mousemove", move);
    el.addEventListener("click", click);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("mousemove", move);
      el.removeEventListener("click", click);
      kill();
    };
  }, [spawn, kill, disabled, enableTilt, enableMagnetism, clickEffect, glowRGB]);

  return (
    <div ref={ref} className={className} style={{ position: "relative", overflow: "hidden" }}>
      {children}
    </div>
  );
};

// ─── MagicBento ──────────────────────────────────────────────────
export const MagicBento: React.FC<MagicBentoProps> = ({
  cards = SHG_BENTO_CARDS,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  spotlightRadius = 300,
  particleCount = 12,
  glowColor = "132, 0, 255",
  disableAnimations = false,
  textAutoHide = true,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const shouldDisable = disableAnimations || isMobile;

  useEffect(() => {
    if (!enableSpotlight || shouldDisable) return;
    const fn = (e: MouseEvent) => {
      gridRef.current?.querySelectorAll<HTMLElement>(".bento-card").forEach(card => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mouse-x", `${e.clientX - r.left}px`);
        card.style.setProperty("--mouse-y", `${e.clientY - r.top}px`);
        card.style.setProperty("--spotlight-radius", `${spotlightRadius}px`);
        card.style.setProperty("--glow-color", `rgba(${glowColor}, 0.15)`);
      });
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, [enableSpotlight, shouldDisable, spotlightRadius, glowColor]);

  // Exact grid from reference: 4-col, 2-row, card-0 spans 2 cols, card-2 spans 2 rows, card-4 spans 2 cols
  const colClasses = ["card-0", "card-1", "card-2", "card-3", "card-4", "card-5"];

  const CardInner = ({ card }: { card: SHGBentoCard }) => (
    <div className="bento-card h-full w-full p-6 flex flex-col justify-between group" style={{ minHeight: 180 }}>
      <div className="spotlight-overlay" />
      {enableBorderGlow && <div className="border-glow" />}

      <div className="relative z-10">
        <span className="text-xs font-semibold tracking-widest uppercase opacity-60 group-hover:opacity-100 transition-opacity duration-300" style={{ color: card.color }}>
          {card.label}
        </span>
        <h3 className="text-xl font-semibold text-white mt-2 leading-tight">
          {card.title}
        </h3>
      </div>

      <div className="relative z-10 mt-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
          style={{ backgroundColor: `${card.color}18`, boxShadow: `0 0 14px ${card.color}22` }}>
          <card.icon className="w-5 h-5" style={{ color: card.color }} />
        </div>
        <p className={`text-sm text-gray-400 leading-relaxed ${textAutoHide ? "line-clamp-2" : ""}`}>
          {card.description}
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full" style={{ background: "#060010" }}>
      <style>{`
        .bento-grid {
          display: grid;
          gap: 1rem;
          width: 100%;
          grid-template-columns: repeat(1, 1fr);
        }
        @media (min-width: 640px) {
          .bento-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .bento-grid {
            grid-template-columns: repeat(4, 1fr);
            grid-template-rows: repeat(2, 200px);
          }
          .card-0 { grid-column: span 2; grid-row: span 1; }
          .card-1 { grid-column: span 1; grid-row: span 1; }
          .card-2 { grid-column: span 1; grid-row: span 2; }
          .card-3 { grid-column: span 1; grid-row: span 1; }
          .card-4 { grid-column: span 2; grid-row: span 1; }
          .card-5 { grid-column: span 1; grid-row: span 1; }
        }
        .bento-card {
          background: #0a041a;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s ease;
          cursor: pointer;
        }
        .bento-card:hover {
          border-color: rgba(${glowColor}, 0.35);
        }
        .spotlight-overlay {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(
            var(--spotlight-radius, 300px) circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            var(--glow-color, transparent), transparent 80%
          );
          opacity: 0; transition: opacity 0.3s ease; border-radius: inherit;
        }
        .bento-card:hover .spotlight-overlay { opacity: 1; }
        .border-glow {
          position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
          padding: 1px;
          background: radial-gradient(
            var(--spotlight-radius, 300px) circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(${glowColor}, 0.8), transparent 40%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          opacity: 0; transition: opacity 0.3s ease;
        }
        .bento-card:hover .border-glow { opacity: 1; }
      `}</style>

      <div ref={gridRef} className="bento-grid p-6">
        {cards.map((card, i) => {
          const cls = `${colClasses[i] ?? ""} h-full`;
          const inner = enableStars ? (
            <ParticleCard
              className="h-full"
              particleCount={particleCount}
              glowRGB={glowColor}
              enableTilt={enableTilt}
              enableMagnetism={enableMagnetism}
              clickEffect={clickEffect}
              disabled={shouldDisable}
            >
              <CardInner card={card} />
            </ParticleCard>
          ) : <CardInner card={card} />;

          return card.to ? (
            <Link key={i} to={card.to} className={cls} style={{ textDecoration: "none" }}>
              {inner}
            </Link>
          ) : (
            <div key={i} className={cls}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
};

export default MagicBento;
