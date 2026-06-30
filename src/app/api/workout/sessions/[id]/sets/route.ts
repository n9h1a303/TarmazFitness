import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CreateSetSchema } from "@/lib/validations"

export async function POST(
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

  const { id: sessionId } = await params

  const workoutSession = await prisma.workoutSession.findUnique({
    where: { id: sessionId },
  })

  if (!workoutSession || workoutSession.userId !== session.user.id) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Không tìm thấy buổi tập" } },
      { status: 404 }
    )
  }

  try {
    const json = await request.json()
    const parsed = CreateSetSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ" } },
        { status: 422 }
      )
    }

    const set = await prisma.workoutSet.create({
      data: {
        sessionId,
        exerciseId: parsed.data.exerciseId,
        setNumber: parsed.data.setNumber,
        reps: parsed.data.reps,
        weightKg: parsed.data.weightKg,
        isWarmup: parsed.data.isWarmup ?? false,
      },
    })

    const allSets = await prisma.workoutSet.findMany({
      where: { sessionId },
    })

    const totalVolume = allSets.reduce((acc, s) => acc + s.reps * s.weightKg, 0)

    return NextResponse.json(
      {
        data: {
          set: {
            id: set.id,
            sessionId: set.sessionId,
            exerciseId: set.exerciseId,
            setNumber: set.setNumber,
            reps: set.reps,
            weightKg: set.weightKg,
            isWarmup: set.isWarmup,
            loggedAt: set.loggedAt.toISOString(),
          },
          totalVolume,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create set error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Có lỗi xảy ra" } },
      { status: 500 }
    )
  }
}
