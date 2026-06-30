import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateMacroTargets } from "@/lib/tdee"
import type { Gender, ActivityLevel, Goal } from "@/types"

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
  })

  if (!user) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Không tìm thấy người dùng" } },
      { status: 404 }
    )
  }

  if (!user.gender || !user.age || !user.heightCm || !user.weightKg || !user.activityLevel || !user.goal) {
    return NextResponse.json(
      { error: { code: "INCOMPLETE_PROFILE", message: "Vui lòng nhập đầy đủ thông tin cá nhân" } },
      { status: 400 }
    )
  }

  const targets = calculateMacroTargets(
    user.gender as Gender,
    user.weightKg,
    user.heightCm,
    user.age,
    user.activityLevel as ActivityLevel,
    user.goal as Goal
  )

  return NextResponse.json({ data: targets })
}
