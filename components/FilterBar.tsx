"use client";

import { Search, SlidersHorizontal } from "lucide-react";

export type Filters = {
  search: string;
  status: string;
  priority: string;
  sort: string;
  order: "asc" | "desc";
};

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

const STATUS_OPTIONS = ["", "SAVED", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"];
const PRIORITY_OPTIONS = ["", "LOW", "MEDIUM", "HIGH"];
const SORT_OPTIONS = [
  { value: "dateApplied", label: "Date Applied" },
  { value: "company", label: "Company" },
  { value: "jobTitle", label: "Job Title" },
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
];

export default function FilterBar({ filters, onChange }: Props) {
  function set(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 min-w-45 max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search company, title…"
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
        />
      </div>

      {/* Status */}
      <select
        value={filters.status}
        onChange={(e) => set("status", e.target.value)}
        className="rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
      >
        <option value="">All Statuses</option>
        {STATUS_OPTIONS.filter(Boolean).map((s) => (
          <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
        ))}
      </select>

      {/* Priority */}
      <select
        value={filters.priority}
        onChange={(e) => set("priority", e.target.value)}
        className="rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
      >
        <option value="">All Priorities</option>
        {PRIORITY_OPTIONS.filter(Boolean).map((p) => (
          <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
        ))}
      </select>

      {/* Sort */}
      <div className="flex items-center gap-1">
        <SlidersHorizontal size={15} className="text-gray-400" />
        <select
          value={filters.sort}
          onChange={(e) => set("sort", e.target.value)}
          className="rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          onClick={() => set("order", filters.order === "asc" ? "desc" : "asc")}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          title="Toggle sort order"
        >
          {filters.order === "asc" ? "↑" : "↓"}
        </button>
      </div>
    </div>
  );
}
