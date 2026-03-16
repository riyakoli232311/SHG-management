import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  showSparkle?: boolean;
}

export function PageHeader({ title, description, children, className, showSparkle = true }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8", className)}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          {showSparkle && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        </div>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
