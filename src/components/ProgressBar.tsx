import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "destructive";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const variantStyles = {
  default: "bg-gradient-to-r from-[#C2185B] to-[#6A1B9A]",
  success: "bg-gradient-to-r from-emerald-500 to-emerald-600",
  warning: "bg-gradient-to-r from-[#FBC02D] to-[#F57F17]",
  destructive: "bg-gradient-to-r from-red-500 to-red-600",
};

const sizeStyles = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  max = 100,
  variant = "default",
  size = "md",
  showLabel = false,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full">
      <div className={cn("w-full bg-[#C2185B]/10 rounded-full overflow-hidden", sizeStyles[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            variantStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-muted-foreground mt-1 text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  );
}
