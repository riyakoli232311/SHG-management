import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  showSparkle?: boolean;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  showSparkle = false,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7",
        className
      )}
    >
      <div>
        <h1
          className="text-[26px] leading-tight text-foreground mb-0.5"
          style={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}
        >
          {title}
        </h1>
        {description && (
          <p className="text-[13.5px] text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-3 flex-shrink-0">{children}</div>
      )}
    </div>
  );
}