"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Briefcase } from "lucide-react";
import type { Job } from "@/app/generated/prisma/client";
import StatsCards from "@/components/StatsCards";
import FilterBar, { type Filters } from "@/components/FilterBar";
import JobTable from "@/components/JobTable";
import JobForm from "@/components/JobForm";

const DEFAULT_FILTERS: Filters = {
  search: "",
  status: "",
  priority: "",
  sort: "dateApplied",
  order: "desc",
};

function buildUrl(filters: Filters) {
  const p = new URLSearchParams();
  if (filters.search) p.set("search", filters.search);
  if (filters.status) p.set("status", filters.status);
  if (filters.priority) p.set("priority", filters.priority);
  p.set("sort", filters.sort);
  p.set("order", filters.order);
  return `/api/jobs?${p.toString()}`;
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(buildUrl(filters));
      if (!res.ok) throw new Error();
      const data: Job[] = await res.json();
      setJobs(data);
    } catch {
      console.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs");
      if (!res.ok) throw new Error();
      const data: Job[] = await res.json();
      setAllJobs(data);
    } catch {
      console.error("Failed to fetch all jobs");
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  function handleRefresh() {
    fetchJobs();
    fetchAll();
  }

  const stats = {
    total: allJobs.length,
    saved: allJobs.filter((j) => j.status === "SAVED").length,
    applied: allJobs.filter((j) => j.status === "APPLIED").length,
    interviewing: allJobs.filter((j) => j.status === "INTERVIEWING").length,
    offer: allJobs.filter((j) => j.status === "OFFER").length,
    rejected: allJobs.filter((j) => j.status === "REJECTED").length,
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Page header with Add Job button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track all your job applications in one place.
          </p>
        </div>
        <button
          onClick={() => { setEditJob(null); setFormOpen(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98] transition-all"
        >
          <Plus size={16} strokeWidth={2.5} /> Add Job
        </button>
      </div>

      <StatsCards stats={stats} />

      <div className="flex flex-col gap-4">
        <FilterBar filters={filters} onChange={setFilters} />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : jobs.length === 0 && !filters.search && !filters.status && !filters.priority ? (
          /* Empty state: no jobs at all */
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-16 dark:border-gray-800">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Briefcase size={28} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No jobs yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Start tracking your applications by adding your first job.
            </p>
            <button
              onClick={() => { setEditJob(null); setFormOpen(true); }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
            >
              <Plus size={16} strokeWidth={2.5} /> Add Your First Job
            </button>
          </div>
        ) : (
          <JobTable
            jobs={jobs}
            onRefresh={handleRefresh}
            onEdit={(job) => { setEditJob(job); setFormOpen(true); }}
          />
        )}
      </div>

      {/* Form modal */}
      {formOpen && (
        <JobForm
          initial={editJob ?? undefined}
          onClose={() => { setFormOpen(false); setEditJob(null); }}
          onSaved={handleRefresh}
        />
      )}
    </div>
  );
}

