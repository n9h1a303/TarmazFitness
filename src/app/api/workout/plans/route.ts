import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getWorkoutPlan } from "@/lib/workout-planner"
import type { Goal, ExperienceLevel, ExerciseLibraryItem, WorkoutPlanOutput, WorkoutPlanDay } from "@/types"

function buildPlanResponse(
  template: WorkoutPlanOutput,
  dbPlan: { id: string; days: Array<{ id: string; dayIndex: number; focus: string; exercises: Array<{ exercise: { id: string; nameEn: string; nameVi: string; targetMuscle: string; category: string; imageUrl: string; description: string | null }; targetSets: number; targetReps: string; sortOrder: number }> }> }
): WorkoutPlanOutput {
  const dayMap = new Map(dbPlan.days.map((d) => [d.dayIndex, d]))

  return {
    ...template,
    id: dbPlan.id,
    weeklySchedule: template.weeklySchedule.map((day) => {
      const dbDay = dayMap.get(day.dayIndex)
      return {
        ...day,
        id: dbDay?.id ?? day.id,
        exercises: day.exercises.map((ex, i) => ({
          ...ex,
          exercise: ex.exercise,
          targetSets: dbDay?.exercises[i]?.targetSets ?? ex.targetSets,
          targetReps: dbDay?.exercises[i]?.targetReps ?? ex.targetReps,
        })),
      }
    }),
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" } },
      { status: 401 }
    )
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.goal || !user.experienceLevel || !user.workoutsPerWeek) {
    return NextResponse.json(
      { error: { code: "INCOMPLETE_PROFILE", message: "Vui lòng nhập đầy đủ thông tin" } },
      { status: 400 }
    )
  }

  const exercises = await prisma.exercise.findMany()
  const exerciseLibrary: ExerciseLibraryItem[] = exercises.map((e) => ({
    id: e.id,
    nameEn: e.nameEn,
    nameVi: e.nameVi,
    targetMuscle: e.targetMuscle,
    category: e.category as "compound" | "isolation",
    imageUrl: e.imageUrl,
    description: e.description,
  }))

  const plan = getWorkoutPlan(
    user.workoutsPerWeek,
    user.goal as Goal,
    user.experienceLevel as ExperienceLevel,
    exerciseLibrary
  )

  let dbPlan = await prisma.workoutPlan.findFirst({
    where: { userId: session.user.id, isActive: true },
    include: {
      days: {
        include: {
          exercises: { include: { exercise: true } },
        },
      },
    },
  })

  if (!dbPlan) {
    dbPlan = await prisma.workoutPlan.create({
      data: {
        userId: session.user.id,
        splitType: plan.splitType,
        daysPerWeek: plan.daysPerWeek,
        isActive: true,
        days: {
          create: plan.weeklySchedule.map((day) => ({
            dayIndex: day.dayIndex,
            focus: day.focus,
            exercises: {
              create: day.exercises.map((ex) => ({
                exerciseId: ex.exercise.id,
                targetSets: ex.targetSets,
                targetReps: ex.targetReps,
                sortOrder: ex.sortOrder,
              })),
            },
          })),
        },
      },
      include: {
        days: {
          include: {
            exercises: { include: { exercise: true } },
          },
        },
      },
    })
  }

  return NextResponse.json({ data: buildPlanResponse(plan, dbPlan) })
}
