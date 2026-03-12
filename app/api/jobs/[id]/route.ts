import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Priority, Status } from "@/app/generated/prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id: Number(id) } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const { company, jobTitle, status, priority, dateApplied, jobUrl, salaryRange, location, notes } = body;

  const job = await prisma.job.update({
    where: { id: Number(id) },
    data: {
      ...(company !== undefined && { company }),
      ...(jobTitle !== undefined && { jobTitle }),
      ...(status !== undefined && { status: status as Status }),
      ...(priority !== undefined && { priority: priority as Priority }),
      ...(dateApplied !== undefined && { dateApplied: new Date(dateApplied) }),
      ...(jobUrl !== undefined && { jobUrl }),
      ...(salaryRange !== undefined && { salaryRange }),
      ...(location !== undefined && { location }),
      ...(notes !== undefined && { notes }),
    },
  });

  return NextResponse.json(job);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.job.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}
