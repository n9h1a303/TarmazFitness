import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CreateMealSchema } from "@/lib/validations"

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

  const meals = await prisma.meal.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: date,
        lt: new Date(date.getTime() + 86400000),
      },
    },
    include: { food: { include: { region: true, category: true } } },
    orderBy: { createdAt: "asc" },
  })

  const entries = meals.map((m) => {
    const multiplier = m.servingMultiplier
    const isCustom = !!m.customName
    const calories = isCustom
      ? (m.customCalories ?? 0) * multiplier
      : (m.food?.calories ?? 0) * multiplier
    const proteinGrams = isCustom
      ? (m.customProtein ?? 0) * multiplier
      : (m.food?.proteinG ?? 0) * multiplier
    const carbsGrams = isCustom
      ? (m.customCarbs ?? 0) * multiplier
      : (m.food?.carbsG ?? 0) * multiplier
    const fatGrams = isCustom
      ? (m.customFat ?? 0) * multiplier
      : (m.food?.fatG ?? 0) * multiplier

    return {
      id: m.id,
      mealType: m.mealType,
      food: m.food
        ? {
            id: m.food.id,
            nameVi: m.food.nameVi,
            region: { code: m.food.region.code, name: m.food.region.name },
            category: { name: m.food.category.name, slug: m.food.category.slug },
            servingSize: m.food.servingSize,
            servingGrams: m.food.servingGrams,
            caloriesPerServing: m.food.calories,
            proteinGrams: m.food.proteinG,
            carbsGrams: m.food.carbsG,
            fatGrams: m.food.fatG,
            isVerified: m.food.isVerified,
            mealTime: m.food.mealTime,
          }
        : null,
      customName: m.customName,
      customCalories: m.customCalories,
      customProtein: m.customProtein,
      customCarbs: m.customCarbs,
      customFat: m.customFat,
      servingMultiplier: m.servingMultiplier,
      calories,
      proteinGrams,
      carbsGrams,
      fatGrams,
      createdAt: m.createdAt.toISOString(),
    }
  })

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      proteinGrams: acc.proteinGrams + e.proteinGrams,
      carbsGrams: acc.carbsGrams + e.carbsGrams,
      fatGrams: acc.fatGrams + e.fatGrams,
    }),
    { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 }
  )

  return NextResponse.json({
    data: { date: dateStr, meals: entries, totals },
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
    const parsed = CreateMealSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ" } },
        { status: 422 }
      )
    }

    const { foodId, mealType, date, servingMultiplier, customName, customCalories, customProtein, customCarbs, customFat } = parsed.data

    const meal = await prisma.meal.create({
      data: {
        userId: session.user.id,
        foodId: foodId ?? null,
        mealType,
        date: new Date(date + "T00:00:00.000Z"),
        servingMultiplier: servingMultiplier ?? 1,
        customName: customName ?? null,
        customCalories: customCalories ?? null,
        customProtein: customProtein ?? null,
        customCarbs: customCarbs ?? null,
        customFat: customFat ?? null,
      },
      include: { food: { include: { region: true, category: true } } },
    })

    return NextResponse.json({ data: meal }, { status: 201 })
  } catch (error) {
    console.error("Create meal error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Có lỗi xảy ra" } },
      { status: 500 }
    )
  }
}
