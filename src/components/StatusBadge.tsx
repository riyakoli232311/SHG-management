import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "Paid" | "Pending" | "Overdue" | "Active" | "Completed" | "Defaulted";
}

const statusStyles = {
  Paid: "status-paid",
  Pending: "status-pending",
  Overdue: "status-overdue",
  Active: "status-active",
  Completed: "status-paid",
  Defaulted: "status-overdue",
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
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusStyles[status]
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
