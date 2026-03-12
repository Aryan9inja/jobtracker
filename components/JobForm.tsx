"use client";

import { useEffect, useState } from "react";
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

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-[10vh] backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800 animate-in fade-in slide-in-from-bottom-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? "Edit Job" : "Add New Job"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
          {/* Company + Job Title */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Company" required>
              <input name="company" value={form.company} onChange={handleChange} placeholder="Acme Inc." className={inputCls} required />
            </Field>
            <Field label="Job Title" required>
              <input name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="Software Engineer" className={inputCls} required />
            </Field>
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Status">
              <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select name="priority" value={form.priority} onChange={handleChange} className={inputCls}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Date + Salary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Date Applied">
              <input type="date" name="dateApplied" value={form.dateApplied} onChange={handleChange} className={inputCls} />
            </Field>
            <Field label="Salary Range">
              <input name="salaryRange" value={form.salaryRange} onChange={handleChange} placeholder="$80k \u2013 $100k" className={inputCls} />
            </Field>
          </div>

          {/* Location + URL */}
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
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Interview notes, contacts, deadlines\u2026" className={`${inputCls} resize-none`} />
          </Field>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-60 active:scale-[0.98] transition-all"
            >
              {saving ? "Saving\u2026" : isEdit ? "Save Changes" : "Add Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 w-full transition-colors";
