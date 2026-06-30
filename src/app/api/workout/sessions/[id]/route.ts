import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" } },
      { status: 401 }
    )
  }

  const { id } = await params

  const workoutSession = await prisma.workoutSession.findUnique({
    where: { id },
    include: {
      planDay: { include: { exercises: { include: { exercise: true }, orderBy: { sortOrder: "asc" } } } },
      sets: { include: { exercise: true }, orderBy: { loggedAt: "asc" } },
    },
  })

  if (!workoutSession || workoutSession.userId !== session.user.id) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Không tìm thấy buổi tập" } },
      { status: 404 }
    )
  }

  const grouped: Record<string, {
    exercise: { id: string; nameEn: string; nameVi: string; targetMuscle: string; category: string; imageUrl: string; description: string | null }
    sets: Array<{ id: string; sessionId: string; exerciseId: string; setNumber: number; reps: number; weightKg: number; isWarmup: boolean; loggedAt: string }>
  }> = {}

  // Seed with planned exercises from the plan day (so exercises show even before logging sets)
  if (workoutSession.planDay?.exercises) {
    for (const pe of workoutSession.planDay.exercises) {
      grouped[pe.exerciseId] = {
        exercise: {
          id: pe.exercise.id,
          nameEn: pe.exercise.nameEn,
          nameVi: pe.exercise.nameVi,
          targetMuscle: pe.exercise.targetMuscle,
          category: pe.exercise.category,
          imageUrl: pe.exercise.imageUrl,
          description: pe.exercise.description,
        },
        sets: [],
      }
    }
  }

  for (const set of workoutSession.sets) {
    if (!grouped[set.exerciseId]) {
      grouped[set.exerciseId] = {
        exercise: {
          id: set.exercise.id,
          nameEn: set.exercise.nameEn,
          nameVi: set.exercise.nameVi,
          targetMuscle: set.exercise.targetMuscle,
          category: set.exercise.category,
          imageUrl: set.exercise.imageUrl,
          description: set.exercise.description,
        },
        sets: [],
      }
    }
    grouped[set.exerciseId].sets.push({
      id: set.id,
      sessionId: set.sessionId,
      exerciseId: set.exerciseId,
      setNumber: set.setNumber,
      reps: set.reps,
      weightKg: set.weightKg,
      isWarmup: set.isWarmup,
      loggedAt: set.loggedAt.toISOString(),
    })
  }

  return NextResponse.json({
    data: {
      id: workoutSession.id,
      userId: workoutSession.userId,
      planDayId: workoutSession.planDayId,
      date: workoutSession.date.toISOString().split("T")[0],
      startTime: workoutSession.startTime.toISOString(),
      endTime: workoutSession.endTime?.toISOString() ?? null,
      durationSeconds: workoutSession.durationSeconds,
      isCompleted: workoutSession.isCompleted,
      notes: workoutSession.notes,
      exercises: Object.values(grouped),
    },
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" } },
      { status: 401 }
    )
  }

  const { id } = await params

  const existing = await prisma.workoutSession.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Không tìm thấy buổi tập" } },
      { status: 404 }
    )
  }

  try {
    const json = await request.json()

    const data: Record<string, unknown> = {}
    if (json.isCompleted !== undefined) data.isCompleted = json.isCompleted
    if (json.notes !== undefined) data.notes = json.notes

    if (json.endTime) {
      data.endTime = new Date(json.endTime)
      data.durationSeconds = Math.round(
        (new Date(json.endTime).getTime() - existing.startTime.getTime()) / 1000
      )
    }

    const updated = await prisma.workoutSession.update({
      where: { id },
      data,
      include: { planDay: true, sets: { include: { exercise: true } } },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error("Update session error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Có lỗi xảy ra" } },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" } },
      { status: 401 }
    )
  }

  const { id } = await params

  const existing = await prisma.workoutSession.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Không tìm thấy buổi tập" } },
      { status: 404 }
    )
  }

  await prisma.workoutSession.delete({ where: { id } })

  return NextResponse.json({ data: { success: true } })
}
