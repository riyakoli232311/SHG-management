/**
 * Dark UI — Shared dark-first primitives matching the SHG premium dark theme.
 * Import from this file to keep every page consistent.
 */
import React from "react";
import { motion } from "framer-motion";

// ── Animations ───────────────────────────────────────────────
export const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
export const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

// ── Dark Card ─────────────────────────────────────────────────
export function DCard({
  children,
  className = "",
  style = {},
  id,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background: "#0a041a",
        border: "1px solid rgba(255,255,255,0.07)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Dark Card Header ──────────────────────────────────────────
export function DCardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`px-6 py-4 flex items-center justify-between ${className}`}
      style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      {children}
    </div>
  );
}

// ── Page Header ───────────────────────────────────────────────
export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
    >
      <div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-[#ff6bc1] to-[#b56bff] bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-white/40 mt-1 font-medium">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </motion.div>
  );
}

// ── Dark Badge ────────────────────────────────────────────────
type BadgeVariant = "pink" | "purple" | "green" | "red" | "amber" | "blue" | "gray";

const BADGE_STYLES: Record<BadgeVariant, { bg: string; color: string }> = {
  pink:   { bg: "rgba(194,24,91,0.15)",   color: "#f472b6" },
  purple: { bg: "rgba(124,58,237,0.15)",  color: "#c4b5fd" },
  green:  { bg: "rgba(16,185,129,0.15)",  color: "#34d399" },
  red:    { bg: "rgba(239,68,68,0.15)",   color: "#f87171" },
  amber:  { bg: "rgba(245,158,11,0.15)",  color: "#fbbf24" },
  blue:   { bg: "rgba(2,136,209,0.15)",   color: "#60d8ff" },
  gray:   { bg: "rgba(255,255,255,0.08)", color: "#94a3b8" },
};

export function DBadge({
  children,
  variant = "gray",
  className = "",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  const { bg, color } = BADGE_STYLES[variant];
  return (
    <span
      className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${className}`}
      style={{ background: bg, color }}
    >
      {children}
    </span>
  );
}

// ── Dark Input ────────────────────────────────────────────────
export function DInput({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl px-4 py-2.5 text-sm text-white font-medium placeholder:text-white/25 outline-none focus:ring-1 transition-all ${className}`}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.09)",
      }}
      onFocus={e => (e.currentTarget.style.borderColor = "rgba(194,24,91,0.5)")}
      onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)")}
      {...props}
    />
  );
}

// ── Dark Select ───────────────────────────────────────────────
export function DSelect({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select
      className={`rounded-xl px-4 py-2.5 text-sm text-white font-medium outline-none transition-all appearance-none cursor-pointer ${className}`}
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.09)",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

// ── Dark Table ────────────────────────────────────────────────
export function DTable({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: React.ReactNode;
  empty?: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {headers.map(h => (
              <th
                key={h}
                className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-white/30"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children ?? empty}</tbody>
      </table>
    </div>
  );
}

export function DTr({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      className={`transition-colors hover:bg-white/3 ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function DTd({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-3.5 text-sm text-white/80 ${className}`}>{children}</td>
  );
}

// ── Dark Button ───────────────────────────────────────────────
type DButtonVariant = "primary" | "ghost" | "danger" | "success" | "outline";

const BTN: Record<DButtonVariant, { bg: string; color: string; border: string }> = {
  primary: { bg: "linear-gradient(135deg,#C2185B,#6A1B9A)", color: "#fff",      border: "none" },
  ghost:   { bg: "rgba(255,255,255,0.07)",                  color: "#fff",      border: "1px solid rgba(255,255,255,0.1)" },
  danger:  { bg: "rgba(239,68,68,0.12)",                    color: "#f87171",   border: "1px solid rgba(239,68,68,0.2)" },
  success: { bg: "rgba(16,185,129,0.15)",                   color: "#34d399",   border: "1px solid rgba(16,185,129,0.2)" },
  outline: { bg: "transparent",                             color: "#C2185B",   border: "1px solid rgba(194,24,91,0.35)" },
};

export function DBtn({
  children,
  variant = "ghost",
  className = "",
  size = "md",
  disabled = false,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  variant?: DButtonVariant;
  className?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}) {
  const { bg, color, border } = BTN[variant];
  const pad = size === "sm" ? "px-3 py-1.5 text-xs" : size === "lg" ? "px-7 py-3 text-base" : "px-4 py-2 text-sm";
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed ${pad} ${className}`}
      style={{ background: bg, color, border, boxShadow: variant === "primary" ? "0 0 20px rgba(194,24,91,0.25)" : "none" }}
    >
      {children}
    </button>
  );
}

// ── Avatar (initial letter) ───────────────────────────────────
export function DAvatar({ name, size = 10 }: { name?: string; size?: number }) {
  return (
    <div
      className={`w-${size} h-${size} rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0`}
      style={{ background: "linear-gradient(135deg,#C2185B,#6A1B9A)", boxShadow: "0 0 12px rgba(194,24,91,0.3)" }}
    >
      {name?.charAt(0)?.toUpperCase()}
    </div>
  );
}

// ── Info Row ──────────────────────────────────────────────────
export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-0.5">{label}</p>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

// ── Loading spinner ───────────────────────────────────────────
export function DSpinner() {
  return (
    <div className="flex justify-center items-center py-24">
      <div className="w-10 h-10 rounded-full border-4 border-[#C2185B]/20 border-t-[#C2185B] animate-spin" />
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
export function DEmpty({ icon: Icon, title, subtitle }: { icon?: any; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon className="w-12 h-12 text-white/10 mb-4" />}
      <p className="text-base font-bold text-white/40">{title}</p>
      {subtitle && <p className="text-sm text-white/25 mt-1">{subtitle}</p>}
    </div>
  );
}
