/**
 * FeatureDeck — Adapted from DeckPlayer (motion-music-player)
 * Card-stack with drag-to-swipe, AnimatePresence, and background scale offsets.
 * Recoloured for the SakhiSahyog deep-dark-purple theme.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Landmark, CalendarDays, Users, HeartHandshake,
} from "lucide-react";

// ── Feature card data ─────────────────────────────────────────
interface FeatureCard {
  id: string;
  headerText: string;
  subText: string;
  icon: React.ElementType;
  stat: string;
  statLabel: string;
  gradientFrom: string;
  gradientTo: string;
  bullets: string[];
}

const CARDS: FeatureCard[] = [
  {
    id: "savings",
    headerText: "SAVINGS TRACKER",
    subText: "Automate daily collection records with real-time ledgers",
    icon: TrendingUp,
    stat: "₹2.4L+",
    statLabel: "Average group corpus",
    gradientFrom: "#C2185B",
    gradientTo: "#6A1B9A",
    bullets: ["Member-wise ledgers", "Auto EMI scheduling", "Monthly PDF reports"],
  },
  {
    id: "loans",
    headerText: "LOAN MANAGEMENT",
    subText: "Apply & track group loans with AI-powered trust scoring",
    icon: Landmark,
    stat: "3×",
    statLabel: "Max credit vs savings",
    gradientFrom: "#6A1B9A",
    gradientTo: "#0ea5e9",
    bullets: ["Document verification", "AI trust scoring", "Overdue alerts"],
  },
  {
    id: "meetings",
    headerText: "MEETING RECORDS",
    subText: "Schedule meetings & track attendance digitally",
    icon: CalendarDays,
    stat: "100%",
    statLabel: "Attendance digitised",
    gradientFrom: "#be185d",
    gradientTo: "#7c3aed",
    bullets: ["Digital attendance", "Agenda management", "Meeting minutes"],
  },
  {
    id: "members",
    headerText: "MEMBER PORTAL",
    subText: "Every member gets a personal dashboard & loan tracker",
    icon: Users,
    stat: "20+",
    statLabel: "Members per group",
    gradientFrom: "#7c3aed",
    gradientTo: "#C2185B",
    bullets: ["Repayment schedules", "Savings history", "Secure doc upload"],
  },
];

// ── Adapted from DeckPlayer swipeVariants ─────────────────────
const swipeVariants = {
  enter: () => ({
    scale: 0.95,
    y: -35,
    opacity: 0.6,
    zIndex: 2,
    x: 0,
  }),
  center: {
    zIndex: 3,
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as any },
  },
  exit: (direction: number) => ({
    zIndex: 3,
    x: direction > 0 ? 320 : -320,
    opacity: 0,
    scale: 0.95,
    rotate: direction > 0 ? 8 : -8,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as any },
  }),
};

// ── Individual card UI ─────────────────────────────────────────
function FeatureCardUI({ card, isActive }: { card: FeatureCard; isActive: boolean }) {
  const Icon = card.icon;
  const grad = `linear-gradient(135deg, ${card.gradientFrom}, ${card.gradientTo})`;
  return (
    <div
      className="relative w-full h-full rounded-[28px] overflow-hidden flex flex-col select-none"
      style={{
        background: "#0a041a",
        border: `1px solid ${isActive ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}`,
        boxShadow: isActive
          ? "0 32px 80px rgba(0,0,0,0.6), 0 0 40px rgba(194,24,91,0.12)"
          : "none",
      }}
    >
      {/* Top gradient accent bar — adapted from Card.tsx bgGradient */}
      <div className="h-1.5 w-full shrink-0" style={{ background: grad, boxShadow: isActive ? "0 0 16px rgba(194,24,91,0.45)" : "none" }} />

      <div className="flex-1 p-7 flex flex-col min-h-0">
        {/* Icon + stat — adapted from music player cover + duration layout */}
        <div className="flex items-start justify-between mb-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: grad, boxShadow: "0 0 20px rgba(194,24,91,0.35)" }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-white leading-none">{card.stat}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-0.5">{card.statLabel}</p>
          </div>
        </div>

        {/* Header — fonts adapted from Card.tsx font-display style */}
        <h2 className="text-[2rem] font-black tracking-tight text-white leading-none mb-2">
          {card.headerText}
        </h2>
        <p className="text-sm text-white/40 font-medium leading-relaxed mb-6">{card.subText}</p>

        {/* Feature bullets — replaces waveform + track info from Card.tsx */}
        <div className="mt-auto space-y-2.5">
          {card.bullets.map((b, i) => (
            <div key={b} className="flex items-center gap-3">
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: grad, opacity: 0.8 + i * 0.1 }}
              />
              <span className="text-sm text-white/45 font-medium">{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom brand section — adapted from Card.tsx player section */}
      <div className="px-7 pb-6 shrink-0">
        <div
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)" }}
          >
            <HeartHandshake className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-white leading-none">SakhiSahyog</p>
            <p className="text-[10px] text-white/30 font-medium mt-0.5">Empowering Women · Enabling Growth</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main deck — adapted from DeckPlayer ───────────────────────
export default function FeatureDeck() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  function handleNext() {
    setDirection(1);
    setCurrentIndex(prev => (prev + 1) % CARDS.length);
  }
  function handlePrev() {
    setDirection(-1);
    setCurrentIndex(prev => (prev - 1 + CARDS.length) % CARDS.length);
  }

  const active   = CARDS[currentIndex];
  const next     = CARDS[(currentIndex + 1) % CARDS.length];
  const nextNext = CARDS[(currentIndex + 2) % CARDS.length];

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* Card stack container — same perspective trick as DeckPlayer */}
      <div className="relative w-full max-w-[340px] h-[430px]">

        {/* Background Stack 2 — scale: 0.88, y: -60, opacity: 0.3 (from DeckPlayer bg2) */}
        <motion.div
          key={`bg2-${nextNext.id}`}
          className="absolute inset-0 w-full h-full pointer-events-none"
          animate={{ scale: 0.88, y: -60, opacity: 0.3, zIndex: 1 }}
          transition={{ duration: 0.4 }}
        >
          <FeatureCardUI card={nextNext} isActive={false} />
        </motion.div>

        {/* Background Stack 1 — scale: 0.94, y: -30, opacity: 0.55 (from DeckPlayer bg1) */}
        <motion.div
          key={`bg1-${next.id}`}
          className="absolute inset-0 w-full h-full pointer-events-none"
          animate={{ scale: 0.94, y: -30, opacity: 0.55, zIndex: 2 }}
          transition={{ duration: 0.4 }}
        >
          <FeatureCardUI card={next} isActive={false} />
        </motion.div>

        {/* Active card — AnimatePresence + drag, from DeckPlayer */}
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.div
            key={active.id}
            custom={direction}
            variants={swipeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full z-30"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_, { offset }) => {
              if (offset.x < -80) handleNext();
              else if (offset.x > 80) handlePrev();
            }}
          >
            <FeatureCardUI card={active} isActive={true} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="flex gap-1.5 mt-6 z-40 relative">
        {CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === currentIndex ? "22px" : "6px",
              height: "6px",
              background: i === currentIndex
                ? "linear-gradient(90deg,#C2185B,#6A1B9A)"
                : "rgba(255,255,255,0.45)",
            }}
          />
        ))}
      </div>

      <p className="text-[11px] text-white/55 font-semibold tracking-widest uppercase mt-3">
        Drag to explore features
      </p>
    </div>
  );
}
