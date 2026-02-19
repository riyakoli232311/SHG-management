import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning" | "info";
}

const variantStyles = {
  default: "bg-white border-[#C2185B]/10",
  primary: "bg-gradient-to-br from-[#C2185B]/5 to-[#6A1B9A]/5 border-[#C2185B]/20",
  success: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200",
  warning: "bg-gradient-to-br from-[#FBC02D]/10 to-[#F57F17]/10 border-[#FBC02D]/30",
  info: "bg-gradient-to-br from-[#6A1B9A]/5 to-[#C2185B]/5 border-[#6A1B9A]/20",
};

const iconStyles = {
  default: "bg-[#C2185B]/10 text-[#C2185B]",
  primary: "bg-[#C2185B] text-white",
  success: "bg-emerald-500 text-white",
  warning: "bg-[#FBC02D] text-[#F57F17]",
  info: "bg-[#6A1B9A] text-white",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-1",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && trend.value > 0 && (
            <p
              className={cn(
                "text-sm font-medium flex items-center gap-1",
                trend.positive ? "text-emerald-600" : "text-red-500"
              )}
            >
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
              <span className="text-muted-foreground font-normal">vs last month</span>
            </p>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-sm", iconStyles[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
