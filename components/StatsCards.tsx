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
    { label: "Total", value: stats.total, icon: Briefcase, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400" },
    { label: "Saved", value: stats.saved, icon: Bookmark, color: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
    { label: "Applied", value: stats.applied, icon: Send, color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400" },
    { label: "Interviewing", value: stats.interviewing, icon: MessageSquare, color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400" },
    { label: "Offers", value: stats.offer, icon: Award, color: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, color: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
            <Icon size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
