"use client";

import { useCallback, useEffect, useState } from "react";
import type { Job } from "@/app/generated/prisma/client";
import StatsCards from "@/components/StatsCards";
import FilterBar, { type Filters } from "@/components/FilterBar";
import JobTable from "@/components/JobTable";

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
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const res = await fetch(buildUrl(filters));
    const data: Job[] = await res.json();
    setJobs(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Stats are always computed from the unfiltered set; use a separate fetch
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  useEffect(() => {
    fetch("/api/jobs").then((r) => r.json()).then(setAllJobs);
  }, [jobs]); // re-fetch all when any mutation happens

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track all your job applications in one place.</p>
      </div>

      <StatsCards stats={stats} />

      <div className="flex flex-col gap-4">
        <FilterBar filters={filters} onChange={setFilters} />
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 dark:text-gray-600">
            Loading…
          </div>
        ) : (
          <JobTable jobs={jobs} onRefresh={fetchJobs} />
        )}
      </div>
    </div>
  );
}

