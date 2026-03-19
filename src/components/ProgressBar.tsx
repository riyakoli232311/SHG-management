import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "destructive";
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

const trackStyles = {
  default:     "bg-rose-100",
  success:     "bg-emerald-100",
  warning:     "bg-amber-100",
  destructive: "bg-red-100",
};

const fillStyles = {
  default:     "bg-gradient-to-r from-rose-400 to-pink-300",
  success:     "bg-gradient-to-r from-emerald-400 to-teal-300",
  warning:     "bg-gradient-to-r from-amber-400 to-orange-300",
  destructive: "bg-gradient-to-r from-red-400 to-rose-400",
};

const sizeStyles = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({
  value,
  max = 100,
  variant = "default",
  size = "md",
  showLabel = false,
  animated = true,
}: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full">
      <div
        className={cn(
          "w-full rounded-full overflow-hidden",
          sizeStyles[size],
          trackStyles[variant]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full",
            fillStyles[variant],
            animated && "transition-all duration-700 ease-out"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-[12px] text-muted-foreground mt-1 text-right font-medium">
          {Math.round(pct)}%
        </p>
      )}
    </div>
  );
}