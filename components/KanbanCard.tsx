"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ExternalLink, MapPin } from "lucide-react";
import type { Job } from "@/app/generated/prisma/client";

const PRIORITY_DOT: Record<string, string> = {
  LOW: "bg-slate-400",
  MEDIUM: "bg-amber-500",
  HIGH: "bg-red-500",
};

export default function KanbanCard({ job }: { job: Job }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-2 rounded-xl border border-gray-200/80 bg-white p-3 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700/80 dark:bg-gray-800"
    >
      <button
        {...listeners}
        {...attributes}
        className="mt-0.5 cursor-grab touch-none text-gray-200 opacity-0 group-hover:opacity-100 hover:text-gray-400 dark:text-gray-700 dark:hover:text-gray-500 active:cursor-grabbing transition-opacity"
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOT[job.priority]}`} title={job.priority} />
          <p className="truncate font-semibold text-sm text-gray-900 dark:text-white">{job.company}</p>
        </div>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400 mt-0.5">{job.jobTitle}</p>
        {(job.location || job.jobUrl) && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            {job.location && (
              <span className="flex items-center gap-0.5 truncate">
                <MapPin size={10} />
                {job.location}
              </span>
            )}
            {job.jobUrl && (
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="ml-auto shrink-0 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
              >
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
