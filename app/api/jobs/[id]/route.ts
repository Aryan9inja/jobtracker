import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Priority, Status } from "@/app/generated/prisma/client";

type Params = { params: Promise<{ id: string }> };

const VALID_STATUSES = new Set<string>(["SAVED", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"]);
const VALID_PRIORITIES = new Set<string>(["LOW", "MEDIUM", "HIGH"]);

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const job = await prisma.job.findUnique({ where: { id: Number(id) } });
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(job);
  } catch (e) {
    console.error("GET /api/jobs/[id] error:", e);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { company, jobTitle, status, priority, dateApplied, jobUrl, salaryRange, location, notes } = body;

    const job = await prisma.job.update({
      where: { id: Number(id) },
      data: {
        ...(company !== undefined && { company }),
        ...(jobTitle !== undefined && { jobTitle }),
        ...(status !== undefined && VALID_STATUSES.has(status) && { status: status as Status }),
        ...(priority !== undefined && VALID_PRIORITIES.has(priority) && { priority: priority as Priority }),
        ...(dateApplied !== undefined && { dateApplied: new Date(dateApplied) }),
        ...(jobUrl !== undefined && { jobUrl }),
        ...(salaryRange !== undefined && { salaryRange }),
        ...(location !== undefined && { location }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json(job);
  } catch (e) {
    console.error("PUT /api/jobs/[id] error:", e);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.job.delete({ where: { id: Number(id) } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("DELETE /api/jobs/[id] error:", e);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
