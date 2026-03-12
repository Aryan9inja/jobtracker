import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Priority, Status } from "@/app/generated/prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") as Status | null;
  const priority = searchParams.get("priority") as Priority | null;
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
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { company, jobTitle, status, priority, dateApplied, jobUrl, salaryRange, location, notes } = body;

  if (!company || !jobTitle) {
    return NextResponse.json({ error: "company and jobTitle are required" }, { status: 400 });
  }

  const job = await prisma.job.create({
    data: {
      company,
      jobTitle,
      status: status ?? "SAVED",
      priority: priority ?? "MEDIUM",
      dateApplied: dateApplied ? new Date(dateApplied) : new Date(),
      jobUrl: jobUrl ?? null,
      salaryRange: salaryRange ?? null,
      location: location ?? null,
      notes: notes ?? null,
    },
  });

  return NextResponse.json(job, { status: 201 });
}
