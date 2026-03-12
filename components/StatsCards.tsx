import { Briefcase, Send, MessageSquare, Award, XCircle, Bookmark } from "lucide-react";

type Stats = {
  total: number;
  saved: number;
  applied: number;
  interviewing: number;
  offer: number;
  rejected: number;
};

export default function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Total", value: stats.total, icon: Briefcase, bg: "bg-indigo-600", ring: "ring-indigo-100 dark:ring-indigo-900/40" },
    { label: "Saved", value: stats.saved, icon: Bookmark, bg: "bg-gray-500", ring: "ring-gray-100 dark:ring-gray-800" },
    { label: "Applied", value: stats.applied, icon: Send, bg: "bg-blue-600", ring: "ring-blue-100 dark:ring-blue-900/40" },
    { label: "Interviewing", value: stats.interviewing, icon: MessageSquare, bg: "bg-amber-500", ring: "ring-amber-100 dark:ring-amber-900/40" },
    { label: "Offers", value: stats.offer, icon: Award, bg: "bg-emerald-600", ring: "ring-emerald-100 dark:ring-emerald-900/40" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, bg: "bg-red-500", ring: "ring-red-100 dark:ring-red-900/40" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map(({ label, value, icon: Icon, bg, ring }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} text-white ring-4 ${ring}`}>
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
