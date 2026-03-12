"use client";

import { useState } from "react";
import { Pencil, Trash2, ExternalLink, Download, Search } from "lucide-react";
import type { Job } from "@/app/generated/prisma/client";

const STATUS_COLORS: Record<string, string> = {
  SAVED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  APPLIED: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
  INTERVIEWING: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
  OFFER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300",
};

const PRIORITY_BADGE: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  MEDIUM: "bg-orange-100 text-orange-600 dark:bg-orange-900/60 dark:text-orange-400",
  HIGH: "bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-400",
};

type Props = {
  jobs: Job[];
  onRefresh: () => void;
  onEdit: (job: Job) => void;
};

export default function JobTable({ jobs, onRefresh, onEdit }: Props) {
  const [deleting, setDeleting] = useState<number | null>(null);

  async function deleteJob(id: number) {
    if (!confirm("Delete this job entry?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onRefresh();
    } catch {
      alert("Failed to delete job. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  function exportCsv() {
    window.location.href = "/api/jobs/export";
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-700 dark:text-gray-200">{jobs.length}</span>{" "}
          {jobs.length === 1 ? "application" : "applications"}
        </p>
        <button
          onClick={exportCsv}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Job Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Salary</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800/60 dark:bg-gray-950">
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Search size={20} className="mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                    <p className="text-sm text-gray-400 dark:text-gray-600">No matching jobs found. Try different filters.</p>
                  </td>
                </tr>
              )}
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="group hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors cursor-pointer"
                  onClick={() => onEdit(job)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[140px]">{job.company}</span>
                      {job.jobUrl && (
                        <a
                          href={job.jobUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 text-gray-300 hover:text-indigo-600 dark:text-gray-600 dark:hover:text-indigo-400"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    <span className="truncate max-w-[160px] block">{job.jobTitle}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[job.status]}`}>
                      {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_BADGE[job.priority]}`}>
                      {job.priority.charAt(0) + job.priority.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(job.dateApplied).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{job.location || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{job.salaryRange || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(job); }}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-950 dark:hover:text-indigo-400 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteJob(job.id); }}
                        disabled={deleting === job.id}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
