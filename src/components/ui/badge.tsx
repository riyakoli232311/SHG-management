import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-[3px] text-[11.5px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent text-white",
        secondary:
          "border-violet-100 bg-violet-50 text-violet-600 hover:bg-violet-100",
        destructive:
          "border-red-100 bg-red-50 text-red-600 hover:bg-red-100",
        outline:
          "border-border text-foreground",
        success:
          "border-emerald-100 bg-emerald-50 text-emerald-600",
        warning:
          "border-amber-100 bg-amber-50 text-amber-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, style, ...props }: BadgeProps) {
  const gradientStyle =
    variant === "default" || variant === undefined
      ? { background: "linear-gradient(135deg, #CC6279 0%, #9E81C3 100%)", ...style }
      : style;

  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={gradientStyle}
      {...props}
    />
  );
}

export { Badge, badgeVariants };