import { cn } from "@/lib/utils";

type StatusVariant =
  | "Completed" | "Pending" | "Refunded" | "Cancelled" | "Processing"
  | "Paid" | "Unpaid"
  | "VIP" | "Active" | "Inactive"
  | "Out of Stock";

const variants: Record<StatusVariant, string> = {
  Completed:    "bg-green-50 text-green-700 border-green-200",
  Paid:         "bg-green-50 text-green-700 border-green-200",
  Active:       "bg-green-50 text-green-700 border-green-200",
  Pending:      "bg-amber-50 text-amber-700 border-amber-200",
  Unpaid:       "bg-amber-50 text-amber-700 border-amber-200",
  Processing:   "bg-blue-50 text-blue-700 border-blue-200",
  Refunded:     "bg-purple-50 text-purple-700 border-purple-200",
  Cancelled:    "bg-red-50 text-red-700 border-red-200",
  "Out of Stock": "bg-red-50 text-red-700 border-red-200",
  VIP:          "bg-violet-50 text-violet-700 border-violet-200",
  Inactive:     "bg-gray-100 text-gray-500 border-gray-200",
};

const dots: Record<StatusVariant, string> = {
  Completed:    "bg-green-500",
  Paid:         "bg-green-500",
  Active:       "bg-green-500",
  Pending:      "bg-amber-500",
  Unpaid:       "bg-amber-500",
  Processing:   "bg-blue-500",
  Refunded:     "bg-purple-500",
  Cancelled:    "bg-red-500",
  "Out of Stock": "bg-red-500",
  VIP:          "bg-violet-500",
  Inactive:     "bg-gray-400",
};

export function StatusBadge({ status }: { status: string }) {
  const variant = status as StatusVariant;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
        variants[variant] ?? "bg-gray-100 text-gray-600 border-gray-200"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dots[variant] ?? "bg-gray-400")} />
      {status}
    </span>
  );
}
