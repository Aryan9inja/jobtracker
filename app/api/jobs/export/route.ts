import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const jobs = await prisma.job.findMany({ orderBy: { dateApplied: "desc" } });

  const header = ["ID", "Company", "Job Title", "Status", "Priority", "Date Applied", "Salary Range", "Location", "Job URL", "Notes"];
  const rows = jobs.map((j) => [
    j.id,
    csvEscape(j.company),
    csvEscape(j.jobTitle),
    j.status,
    j.priority,
    j.dateApplied.toISOString().split("T")[0],
    csvEscape(j.salaryRange ?? ""),
    csvEscape(j.location ?? ""),
    csvEscape(j.jobUrl ?? ""),
    csvEscape(j.notes ?? ""),
  ]);

  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="jobs-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
