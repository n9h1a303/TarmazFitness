import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" } },
      { status: 401 }
    )
  }

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get("page") ?? "1")
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20")

  const [sessions, total] = await Promise.all([
    prisma.workoutSession.findMany({
      where: { userId: session.user.id },
      include: {
        planDay: true,
        sets: { include: { exercise: true }, orderBy: { loggedAt: "asc" } },
      },
      orderBy: { startTime: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.workoutSession.count({ where: { userId: session.user.id } }),
  ])

  return NextResponse.json({
    data: sessions.map((s) => {
      const byExercise: Record<string, {
        exercise: { id: string; nameEn: string; nameVi: string; imageUrl: string }
        sets: Array<{ setNumber: number; reps: number; weightKg: number }>
      }> = {}
      for (const set of s.sets) {
        if (!byExercise[set.exerciseId]) {
          byExercise[set.exerciseId] = {
            exercise: {
              id: set.exercise.id,
              nameEn: set.exercise.nameEn,
              nameVi: set.exercise.nameVi,
              imageUrl: set.exercise.imageUrl,
            },
            sets: [],
          }
        }
        byExercise[set.exerciseId].sets.push({
          setNumber: set.setNumber,
          reps: set.reps,
          weightKg: set.weightKg,
        })
      }

      return {
        id: s.id,
        date: s.date.toISOString().split("T")[0],
        startTime: s.startTime.toISOString(),
        durationSeconds: s.durationSeconds ?? 0,
        isCompleted: s.isCompleted,
        focus: s.planDay?.focus ?? null,
        totalSets: s.sets.length,
        totalVolume: s.sets.reduce((acc, set) => acc + set.reps * set.weightKg, 0),
        exercises: Object.values(byExercise),
      }
    }),
    pagination: {
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    },
  })
}
