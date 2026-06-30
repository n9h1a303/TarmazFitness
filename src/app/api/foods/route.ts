import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ListFoodsQuerySchema } from "@/lib/validations"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" } },
      { status: 401 }
    )
  }

  const url = new URL(request.url)
  const parsed = ListFoodsQuerySchema.safeParse(Object.fromEntries(url.searchParams))

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Tham số không hợp lệ" } },
      { status: 422 }
    )
  }

  const { region, category, search, mealTime, page, pageSize } = parsed.data

  const where: Record<string, unknown> = {}

  if (region) {
    const regionRecord = await prisma.region.findUnique({ where: { code: region } })
    if (regionRecord) where.regionId = regionRecord.id
  }

  if (category) {
    const cat = await prisma.category.findUnique({ where: { slug: category } })
    if (cat) where.categoryId = cat.id
  }

  if (search) {
    where.nameVi = { contains: search, mode: "insensitive" }
  }

  if (mealTime) {
    where.mealTime = { has: mealTime }
  }

  const [foods, total] = await Promise.all([
    prisma.food.findMany({
      where,
      include: { region: true, category: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { nameVi: "asc" },
    }),
    prisma.food.count({ where }),
  ])

  return NextResponse.json({
    data: foods.map((f) => ({
      id: f.id,
      nameVi: f.nameVi,
      region: { code: f.region.code, name: f.region.name },
      category: { name: f.category.name, slug: f.category.slug },
      servingSize: f.servingSize,
      servingGrams: f.servingGrams,
      caloriesPerServing: f.calories,
      proteinGrams: f.proteinG,
      carbsGrams: f.carbsG,
      fatGrams: f.fatG,
      isVerified: f.isVerified,
      mealTime: f.mealTime,
    })),
    pagination: {
      page,
      pageSize,
      totalItems: total,
      totalPages: Math.ceil(total / pageSize),
    },
  })
}
