import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "Paid" | "Pending" | "Overdue" | "Active" | "Completed" | "Defaulted";
}

const statusStyles = {
  Paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Pending: "bg-[#FBC02D]/20 text-[#F57F17] border-[#FBC02D]/30",
  Overdue: "bg-red-100 text-red-700 border-red-200",
  Active: "bg-[#C2185B]/10 text-[#C2185B] border-[#C2185B]/20",
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Defaulted: "bg-red-100 text-red-700 border-red-200",
};

const statusLabels = {
  Paid: "Paid",
  Pending: "Pending",
  Overdue: "Overdue",
  Active: "Active",
  Completed: "Completed",
  Defaulted: "Defaulted",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border",
        statusStyles[status]
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
