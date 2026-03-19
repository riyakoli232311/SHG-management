import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "Paid" | "Pending" | "Overdue" | "Active" | "Completed" | "Defaulted";
}

const statusMap: Record<
  StatusBadgeProps["status"],
  { cls: string; dot: string; label: string }
> = {
  Paid: {
    cls:   "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot:   "bg-emerald-400",
    label: "Paid",
  },
  Pending: {
    cls:   "bg-amber-50 text-amber-700 border-amber-100",
    dot:   "bg-amber-400",
    label: "Pending",
  },
  Overdue: {
    cls:   "bg-red-50 text-red-600 border-red-100",
    dot:   "bg-red-400",
    label: "Overdue",
  },
  Active: {
    cls:   "bg-rose-50 text-rose-600 border-rose-100",
    dot:   "bg-rose-400",
    label: "Active",
  },
  Completed: {
    cls:   "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot:   "bg-emerald-400",
    label: "Completed",
  },
  Defaulted: {
    cls:   "bg-red-50 text-red-600 border-red-100",
    dot:   "bg-red-400",
    label: "Defaulted",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = statusMap[status] ?? statusMap.Pending;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[12px] font-semibold border",
        cfg.cls
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}