"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ExternalLink } from "lucide-react";
import type { Job } from "@/app/generated/prisma/client";

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  MEDIUM: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
  HIGH: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
};

export default function KanbanCard({ job }: { job: Job }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <button
        {...listeners}
        {...attributes}
        className="mt-0.5 cursor-grab touch-none text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-sm text-gray-900 dark:text-white">{job.company}</p>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{job.jobTitle}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_COLORS[job.priority]}`}>
            {job.priority.charAt(0) + job.priority.slice(1).toLowerCase()}
          </span>
          {job.location && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              {job.location}
            </span>
          )}
          {job.jobUrl && (
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-gray-300 hover:text-indigo-500 dark:text-gray-600 dark:hover:text-indigo-400"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
