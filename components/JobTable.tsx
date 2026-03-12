"use client";

import { useState } from "react";
import { Pencil, Trash2, ExternalLink, Download, Plus } from "lucide-react";
import type { Job } from "@/app/generated/prisma/client";
import JobForm from "./JobForm";

const STATUS_COLORS: Record<string, string> = {
  SAVED: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  APPLIED: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  INTERVIEWING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  OFFER: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  MEDIUM: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
  HIGH: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
};

type Props = {
  jobs: Job[];
  onRefresh: () => void;
};

export default function JobTable({ jobs, onRefresh }: Props) {
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function deleteJob(id: number) {
    if (!confirm("Delete this job entry?")) return;
    setDeleting(id);
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    setDeleting(null);
    onRefresh();
  }

  function exportCsv() {
    window.location.href = "/api/jobs/export";
  }

  return (
    <>
      {(addOpen || editJob) && (
        <JobForm
          initial={editJob ?? undefined}
          onClose={() => { setAddOpen(false); setEditJob(null); }}
          onSaved={onRefresh}
        />
      )}

      {/* Table Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {jobs.length} {jobs.length === 1 ? "result" : "results"}
        </p>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus size={14} /> Add Job
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Job Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Date Applied</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Salary</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
            {jobs.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-gray-600">
                  No jobs found. Add one!
                </td>
              </tr>
            )}
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                  <div className="flex items-center gap-1.5">
                    {job.company}
                    {job.jobUrl && (
                      <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{job.jobTitle}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[job.status]}`}>
                    {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[job.priority]}`}>
                    {job.priority.charAt(0) + job.priority.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                  {new Date(job.dateApplied).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{job.location ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{job.salaryRange ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setEditJob(job)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 dark:hover:bg-gray-800 dark:hover:text-indigo-400 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteJob(job.id)}
                      disabled={deleting === job.id}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-800 dark:hover:text-red-400 transition-colors disabled:opacity-40"
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
    </>
  );
}
