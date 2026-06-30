import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UpdateProfileSchema } from "@/lib/validations"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" } },
      { status: 401 }
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      gender: true,
      age: true,
      heightCm: true,
      weightKg: true,
      activityLevel: true,
      goal: true,
      experienceLevel: true,
      mealsPerDay: true,
      workoutsPerWeek: true,
      goalDurationMonths: true,
      goalStartDate: true,
      goalEndDate: true,
      hasOnboarded: true,
    },
  })

  if (!user) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Không tìm thấy người dùng" } },
      { status: 404 }
    )
  }

  return NextResponse.json({ data: { user } })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" } },
      { status: 401 }
    )
  }

  try {
    const json = await request.json()
    const parsed = UpdateProfileSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ", details: parsed.error.flatten() } },
        { status: 422 }
      )
    }

    const data: Record<string, unknown> = { ...parsed.data }

    // if goal + duration set, calculate dates
    if (data.goal && data.goalDurationMonths) {
      const existing = await prisma.user.findUnique({ where: { id: session.user.id } })
      const goalChanged = existing?.goal !== data.goal || existing?.goalDurationMonths !== data.goalDurationMonths
      if (goalChanged || !existing?.goalStartDate) {
        const now = new Date()
        data.goalStartDate = now.toISOString()
        const endDate = new Date(now)
        endDate.setMonth(endDate.getMonth() + (data.goalDurationMonths as number))
        data.goalEndDate = endDate.toISOString()
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        gender: true,
        age: true,
        heightCm: true,
        weightKg: true,
        activityLevel: true,
        goal: true,
        experienceLevel: true,
        mealsPerDay: true,
        workoutsPerWeek: true,
        goalDurationMonths: true,
        goalStartDate: true,
        goalEndDate: true,
        hasOnboarded: true,
      },
    })

    return NextResponse.json({ data: { user } })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Có lỗi xảy ra" } },
      { status: 500 }
    )
  }
}
