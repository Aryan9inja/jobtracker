import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Priority, Status } from "@/app/generated/prisma/client";

const VALID_STATUSES = new Set<string>(["SAVED", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"]);
const VALID_PRIORITIES = new Set<string>(["LOW", "MEDIUM", "HIGH"]);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? "";
    const statusRaw = searchParams.get("status");
    const priorityRaw = searchParams.get("priority");
    const status = statusRaw && VALID_STATUSES.has(statusRaw) ? (statusRaw as Status) : null;
    const priority = priorityRaw && VALID_PRIORITIES.has(priorityRaw) ? (priorityRaw as Priority) : null;
    const sort = searchParams.get("sort") ?? "dateApplied";
    const order = (searchParams.get("order") ?? "desc") as "asc" | "desc";

    const validSortFields = ["dateApplied", "company", "jobTitle", "status", "priority", "createdAt"];
    const sortField = validSortFields.includes(sort) ? sort : "dateApplied";

    const jobs = await prisma.job.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { company: { contains: search } },
                  { jobTitle: { contains: search } },
                  { location: { contains: search } },
                ],
              }
            : {},
          status ? { status } : {},
          priority ? { priority } : {},
        ],
      },
      orderBy: { [sortField]: order },
    });

    return NextResponse.json(jobs);
  } catch (e) {
    console.error("GET /api/jobs error:", e);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { company, jobTitle, status, priority, dateApplied, jobUrl, salaryRange, location, notes } = body;

  if (!company || !jobTitle) {
    return NextResponse.json({ error: "company and jobTitle are required" }, { status: 400 });
  }

  const safeStatus = status && VALID_STATUSES.has(status) ? status : "SAVED";
  const safePriority = priority && VALID_PRIORITIES.has(priority) ? priority : "MEDIUM";

  try {
    const job = await prisma.job.create({
      data: {
        company,
        jobTitle,
        status: safeStatus,
        priority: safePriority,
        dateApplied: dateApplied ? new Date(dateApplied) : new Date(),
        jobUrl: jobUrl ?? null,
        salaryRange: salaryRange ?? null,
        location: location ?? null,
        notes: notes ?? null,
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (e) {
    console.error("POST /api/jobs error:", e);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
