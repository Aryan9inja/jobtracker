"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  pointerWithin,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Job } from "@/app/generated/prisma/client";
import KanbanCard from "./KanbanCard";
import { GripVertical, Plus } from "lucide-react";
import JobForm from "./JobForm";

type Status = "SAVED" | "APPLIED" | "INTERVIEWING" | "OFFER" | "REJECTED";

const COLUMNS: { status: Status; label: string; accent: string; dot: string }[] = [
  { status: "SAVED", label: "Saved", accent: "border-t-gray-400", dot: "bg-gray-400" },
  { status: "APPLIED", label: "Applied", accent: "border-t-blue-500", dot: "bg-blue-500" },
  { status: "INTERVIEWING", label: "Interviewing", accent: "border-t-amber-500", dot: "bg-amber-500" },
  { status: "OFFER", label: "Offer", accent: "border-t-emerald-500", dot: "bg-emerald-500" },
  { status: "REJECTED", label: "Rejected", accent: "border-t-red-500", dot: "bg-red-500" },
];

function DroppableColumn({ status, children }: { status: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-1 flex-col gap-2 px-3 pb-4 min-h-[80px] rounded-b-lg transition-colors ${
        isOver ? "bg-indigo-50/60 dark:bg-indigo-950/30" : ""
      }`}
    >
      {children}
    </div>
  );
}

export default function KanbanBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<Partial<Job> | undefined>();

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs");
      if (!res.ok) throw new Error();
      const data: Job[] = await res.json();
      setJobs(data);
    } catch {
      console.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
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

  function resolveStatus(event: DragOverEvent | DragEndEvent): Status | null {
    const { over } = event;
    if (!over) return null;

    // Check if over.id directly matches a column status
    const col = COLUMNS.find((c) => c.status === over.id);
    if (col) return col.status;

    // Otherwise it's over a card — find that card's status
    const targetJob = jobs.find((j) => j.id === over.id);
    return targetJob ? (targetJob.status as Status) : null;
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveJob(null);
    const newStatus = resolveStatus(event);
    if (!newStatus) return;

    const draggedJob = jobs.find((j) => j.id === event.active.id);
    if (!draggedJob || draggedJob.status === newStatus) return;

    // Optimistic update
    const prevStatus = draggedJob.status;
    setJobs((prev) => prev.map((j) => (j.id === draggedJob.id ? { ...j, status: newStatus } : j)));

    try {
      const res = await fetch(`/api/jobs/${draggedJob.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert on failure
      setJobs((prev) => prev.map((j) => (j.id === draggedJob.id ? { ...j, status: prevStatus } : j)));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const jobsByStatus = (status: Status) => jobs.filter((j) => j.status === status);

  async function handleDelete(id: number) {
    if (!confirm("Delete this job entry?")) return;
    const prev = jobs;
    setJobs((j) => j.filter((x) => x.id !== id));
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setJobs(prev);
      alert("Failed to delete job. Please try again.");
    }
  }

  function handleEdit(job: Job) {
    setFormInitial(job);
    setFormOpen(true);
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
          {COLUMNS.map(({ status, label, accent, dot }) => {
            const colJobs = jobsByStatus(status);
            return (
              <div
                key={status}
                className={`flex w-[260px] shrink-0 flex-col rounded-xl border-t-[3px] border border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-900/80 ${accent}`}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 px-3 py-3">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                  <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {colJobs.length}
                  </span>
                  <button
                    onClick={() => {
                      setFormInitial({ status: status as Job["status"] });
                      setFormOpen(true);
                    }}
                    className="rounded-md p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-500 dark:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-400 transition-colors"
                    title={`Add to ${label}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Cards */}
                <DroppableColumn status={status}>
                  <SortableContext items={colJobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
                    {colJobs.map((job) => (
                      <KanbanCard key={job.id} job={job} onEdit={handleEdit} onDelete={handleDelete} />
                    ))}
                  </SortableContext>
                  {colJobs.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center text-xs text-gray-300 dark:border-gray-700 dark:text-gray-600">
                      Drop here
                    </div>
                  )}
                </DroppableColumn>
              </div>
            );
          })}
        </div>

        {/* Drag overlay */}
        <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
          {activeJob && (
            <div className="flex items-start gap-2 rounded-xl border border-indigo-300 bg-white p-3 shadow-xl dark:border-indigo-700 dark:bg-gray-800 rotate-2 w-[240px] scale-105">
              <GripVertical size={14} className="mt-0.5 text-gray-300" />
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{activeJob.company}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activeJob.jobTitle}</p>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {formOpen && (
        <JobForm
          initial={formInitial}
          onClose={() => { setFormOpen(false); setFormInitial(undefined); }}
          onSaved={fetchJobs}
        />
      )}
    </>
  );
}
