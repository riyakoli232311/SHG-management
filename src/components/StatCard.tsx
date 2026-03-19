import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  variant?: "default" | "primary" | "success" | "warning" | "info" | "danger";
}

const variantMap = {
  default: {
    card:  "bg-white",
    icon:  "bg-rose-50   text-rose-400",
    sub:   "text-rose-400",
    trend: { pos: "bg-emerald-50 text-emerald-600", neg: "bg-red-50 text-red-500" },
  },
  primary: {
    card:  "bg-gradient-to-br from-rose-50/80 to-white",
    icon:  "bg-rose-100  text-rose-500",
    sub:   "text-rose-500",
    trend: { pos: "bg-emerald-50 text-emerald-600", neg: "bg-red-50 text-red-500" },
  },
  success: {
    card:  "bg-gradient-to-br from-emerald-50/70 to-white",
    icon:  "bg-emerald-100 text-emerald-500",
    sub:   "text-emerald-500",
    trend: { pos: "bg-emerald-50 text-emerald-600", neg: "bg-red-50 text-red-500" },
  },
  warning: {
    card:  "bg-gradient-to-br from-amber-50/70 to-white",
    icon:  "bg-amber-100  text-amber-500",
    sub:   "text-amber-500",
    trend: { pos: "bg-emerald-50 text-emerald-600", neg: "bg-red-50 text-red-500" },
  },
  info: {
    card:  "bg-gradient-to-br from-violet-50/70 to-white",
    icon:  "bg-violet-100 text-violet-500",
    sub:   "text-violet-500",
    trend: { pos: "bg-emerald-50 text-emerald-600", neg: "bg-red-50 text-red-500" },
  },
  danger: {
    card:  "bg-gradient-to-br from-red-50/60 to-white",
    icon:  "bg-red-100    text-red-400",
    sub:   "text-red-400",
    trend: { pos: "bg-emerald-50 text-emerald-600", neg: "bg-red-50 text-red-500" },
  },
};

export function StatCard({
  title, value, subtitle, icon: Icon, trend, variant = "default",
}: StatCardProps) {
  const cfg = variantMap[variant];

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 p-5 transition-all duration-200 hover:-translate-y-1 animate-fade-up",
        cfg.card
      )}
      style={{ boxShadow: "var(--shadow-card)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card)";
      }}
    >
      {/* Top row: icon + trend */}
      <div className="flex items-start justify-between mb-3.5">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", cfg.icon)}>
          <Icon className="w-[18px] h-[18px]" />
        </div>

        {trend && trend.value > 0 && (
          <span
            className={cn(
              "flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full",
              trend.positive ? cfg.trend.pos : cfg.trend.neg
            )}
          >
            {trend.positive
              ? <TrendingUp className="w-2.5 h-2.5" />
              : <TrendingDown className="w-2.5 h-2.5" />
            }
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {/* Value */}
      <p className="text-[22px] font-bold text-foreground leading-none mb-1 tracking-tight">
        {value}
      </p>

      {/* Title */}
      <p className="text-[13px] text-muted-foreground font-medium">{title}</p>

      {/* Subtitle */}
      {subtitle && (
        <p className={cn("text-[12px] font-medium mt-1", cfg.sub)}>{subtitle}</p>
      )}
    </div>
  );
}