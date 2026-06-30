import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CreateSessionSchema } from "@/lib/validations"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" } },
      { status: 401 }
    )
  }

  const url = new URL(request.url)
  const dateStr = url.searchParams.get("date") ?? new Date().toISOString().split("T")[0]

  const date = new Date(dateStr + "T00:00:00.000Z")
  const nextDay = new Date(date.getTime() + 86400000)

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId: session.user.id,
      date: { gte: date, lt: nextDay },
    },
    include: {
      planDay: true,
      sets: { include: { exercise: true }, orderBy: { loggedAt: "asc" } },
    },
    orderBy: { startTime: "desc" },
  })

  return NextResponse.json({
    data: sessions.map((s) => ({
      id: s.id,
      userId: s.userId,
      planDayId: s.planDayId,
      date: s.date.toISOString().split("T")[0],
      startTime: s.startTime.toISOString(),
      endTime: s.endTime?.toISOString() ?? null,
      durationSeconds: s.durationSeconds,
      isCompleted: s.isCompleted,
      notes: s.notes,
      exercises: groupSetsByExercise(s.sets),
    })),
  })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" } },
      { status: 401 }
    )
  }

  try {
    const json = await request.json()
    const parsed = CreateSessionSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ" } },
        { status: 422 }
      )
    }

    const now = new Date()

    const workoutSession = await prisma.workoutSession.create({
      data: {
        userId: session.user.id,
        planDayId: parsed.data.planDayId ?? null,
        date: now,
        startTime: now,
        notes: parsed.data.notes ?? null,
      },
      include: {
        planDay: { include: { exercises: { include: { exercise: true }, orderBy: { sortOrder: "asc" } } } },
        sets: { include: { exercise: true } },
      },
    })

    const exercises: Array<{
      exercise: { id: string; nameEn: string; nameVi: string; targetMuscle: string; category: string; imageUrl: string; description: string | null }
      sets: unknown[]
    }> = []

    if (workoutSession.planDay?.exercises) {
      for (const pe of workoutSession.planDay.exercises) {
        exercises.push({
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
        })
      }
    }

    return NextResponse.json(
      {
        data: {
          session: {
            id: workoutSession.id,
            userId: workoutSession.userId,
            planDayId: workoutSession.planDayId,
            date: workoutSession.date.toISOString().split("T")[0],
            startTime: workoutSession.startTime.toISOString(),
            endTime: workoutSession.endTime?.toISOString() ?? null,
            durationSeconds: workoutSession.durationSeconds,
            isCompleted: workoutSession.isCompleted,
            notes: workoutSession.notes,
            exercises,
          },
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create session error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Có lỗi xảy ra" } },
      { status: 500 }
    )
  }
}

function groupSetsByExercise(sets: Array<{ id: string; sessionId: string; exerciseId: string; setNumber: number; reps: number; weightKg: number; isWarmup: boolean; loggedAt: Date; exercise: { id: string; nameEn: string; nameVi: string; targetMuscle: string; category: string; imageUrl: string; description: string | null } }>) {
  const grouped: Record<string, { exercise: { id: string; nameEn: string; nameVi: string; targetMuscle: string; category: string; imageUrl: string; description: string | null }; sets: Array<{ id: string; sessionId: string; exerciseId: string; setNumber: number; reps: number; weightKg: number; isWarmup: boolean; loggedAt: string }> }> = {}

  for (const set of sets) {
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

  return Object.values(grouped)
}
