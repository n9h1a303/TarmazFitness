import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ListExercisesQuerySchema } from "@/lib/validations"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" } },
      { status: 401 }
    )
  }

  const url = new URL(request.url)
  const parsed = ListExercisesQuerySchema.safeParse(Object.fromEntries(url.searchParams))

  const where: Record<string, unknown> = {}

  if (parsed.success) {
    if (parsed.data.targetMuscle) where.targetMuscle = parsed.data.targetMuscle
    if (parsed.data.category) where.category = parsed.data.category
    if (parsed.data.search) {
      where.OR = [
        { nameEn: { contains: parsed.data.search, mode: "insensitive" } },
        { nameVi: { contains: parsed.data.search, mode: "insensitive" } },
      ]
    }
  }

  const exercises = await prisma.exercise.findMany({
    where,
    orderBy: { nameEn: "asc" },
  })

  return NextResponse.json({
    data: exercises.map((e) => ({
      id: e.id,
      nameEn: e.nameEn,
      nameVi: e.nameVi,
      targetMuscle: e.targetMuscle,
      category: e.category,
      imageUrl: e.imageUrl,
      description: e.description,
    })),
  })
}
