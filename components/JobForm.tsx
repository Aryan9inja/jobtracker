"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Job } from "@/app/generated/prisma/client";

type Props = {
  initial?: Partial<Job>;
  onClose: () => void;
  onSaved: () => void;
};

const STATUSES = ["SAVED", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

export default function JobForm({ initial, onClose, onSaved }: Props) {
  const isEdit = Boolean(initial?.id);

  const [form, setForm] = useState({
    company: initial?.company ?? "",
    jobTitle: initial?.jobTitle ?? "",
    status: initial?.status ?? "SAVED",
    priority: initial?.priority ?? "MEDIUM",
    dateApplied: initial?.dateApplied
      ? new Date(initial.dateApplied).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    jobUrl: initial?.jobUrl ?? "",
    salaryRange: initial?.salaryRange ?? "",
    location: initial?.location ?? "",
    notes: initial?.notes ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim() || !form.jobTitle.trim()) {
      setError("Company and Job Title are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `/api/jobs/${initial!.id}` : "/api/jobs";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      if (!res.ok) throw new Error("Failed to save");
      onSaved();
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? "Edit Job" : "Add New Job"}
          </h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Row: Company + Job Title */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Company *">
              <input name="company" value={form.company} onChange={handleChange} placeholder="Acme Inc." className={inputCls} required />
            </Field>
            <Field label="Job Title *">
              <input name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="Software Engineer" className={inputCls} required />
            </Field>
          </div>

          {/* Row: Status + Priority */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Status">
              <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select name="priority" value={form.priority} onChange={handleChange} className={inputCls}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
              </select>
            </Field>
          </div>

          {/* Row: Date + Salary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Date Applied">
              <input type="date" name="dateApplied" value={form.dateApplied} onChange={handleChange} className={inputCls} />
            </Field>
            <Field label="Salary Range">
              <input name="salaryRange" value={form.salaryRange} onChange={handleChange} placeholder="e.g. $80k–$100k" className={inputCls} />
            </Field>
          </div>

          {/* Row: Location + URL */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Location / Remote">
              <input name="location" value={form.location} onChange={handleChange} placeholder="Remote / New York" className={inputCls} />
            </Field>
            <Field label="Job URL">
              <input type="url" name="jobUrl" value={form.jobUrl} onChange={handleChange} placeholder="https://..." className={inputCls} />
            </Field>
          </div>

          {/* Notes */}
          <Field label="Notes">
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Add notes…" className={`${inputCls} resize-none`} />
          </Field>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 w-full";
