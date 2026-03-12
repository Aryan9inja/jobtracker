"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Job } from "@/app/generated/prisma/client";
import KanbanCard from "./KanbanCard";
import { GripVertical } from "lucide-react";

type Status = "SAVED" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED";

const COLUMNS: { status: Status; label: string; color: string }[] = [
  { status: "SAVED", label: "Saved", color: "border-t-gray-400" },
  { status: "APPLIED", label: "Applied", color: "border-t-blue-500" },
  { status: "INTERVIEWING", label: "Interviewing", color: "border-t-yellow-500" },
  { status: "OFFER", label: "Offer", color: "border-t-green-500" },
  { status: "REJECTED", label: "Rejected", color: "border-t-red-500" },
];

export default function KanbanBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/jobs");
    const data: Job[] = await res.json();
    setJobs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const job = jobs.find((j) => j.id === event.active.id);
    setActiveJob(job ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveJob(null);
    if (!over || active.id === over.id) return;

    // over.id may be a job id or a column status string
    const targetJobId = over.id as number | string;
    const targetJob = jobs.find((j) => j.id === targetJobId);

    // Determine target column status
    let newStatus: Status | null = null;
    if (typeof targetJobId === "string" && COLUMNS.some((c) => c.status === targetJobId)) {
      newStatus = targetJobId as Status;
    } else if (targetJob) {
      newStatus = targetJob.status as Status;
    }

    if (!newStatus) return;

    const draggedJob = jobs.find((j) => j.id === active.id);
    if (!draggedJob || draggedJob.status === newStatus) return;

    // Optimistic update
    setJobs((prev) => prev.map((j) => (j.id === draggedJob.id ? { ...j, status: newStatus! } : j)));

    await fetch(`/api/jobs/${draggedJob.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 dark:text-gray-600">
        Loading…
      </div>
    );
  }

  const jobsByStatus = (status: Status) => jobs.filter((j) => j.status === status);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(({ status, label, color }) => {
          const colJobs = jobsByStatus(status);
          return (
            <div
              key={status}
              className={`flex w-64 shrink-0 flex-col rounded-xl border-t-4 border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60 ${color}`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {colJobs.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-1 flex-col gap-2 px-3 pb-4">
                <SortableContext items={colJobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
                  {colJobs.map((job) => (
                    <KanbanCard key={job.id} job={job} />
                  ))}
                </SortableContext>
                {colJobs.length === 0 && (
                  <div className="rounded-lg border-2 border-dashed border-gray-200 py-6 text-center text-xs text-gray-300 dark:border-gray-700 dark:text-gray-600">
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeJob && (
          <div className="flex items-start gap-2 rounded-lg border border-indigo-300 bg-white p-3 shadow-lg dark:border-indigo-700 dark:bg-gray-800 rotate-1 w-64">
            <GripVertical size={14} className="mt-0.5 text-gray-300" />
            <div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">{activeJob.company}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{activeJob.jobTitle}</p>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
