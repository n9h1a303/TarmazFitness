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
  const days = Math.min(Math.max(parseInt(url.searchParams.get("days") ?? "30"), 1), 365)

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  startDate.setHours(0, 0, 0, 0)

  const meals = await prisma.meal.findMany({
    where: {
      userId: session.user.id,
      date: { gte: startDate },
    },
    include: { food: { include: { region: true, category: true } } },
    orderBy: { date: "desc" },
  })

  // Group by date
  const byDate = new Map<string, typeof meals>()
  for (const meal of meals) {
    const key = meal.date.toISOString().split("T")[0]
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key)!.push(meal)
  }

  const logs = [...byDate.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, days)
    .map(([dateStr, dayMeals]) => {
      const entries = dayMeals.map((m) => {
        const multiplier = m.servingMultiplier
        const isCustom = !!m.customName
        const calories = isCustom ? (m.customCalories ?? 0) * multiplier : (m.food?.calories ?? 0) * multiplier
        const proteinGrams = isCustom ? (m.customProtein ?? 0) * multiplier : (m.food?.proteinG ?? 0) * multiplier
        const carbsGrams = isCustom ? (m.customCarbs ?? 0) * multiplier : (m.food?.carbsG ?? 0) * multiplier
        const fatGrams = isCustom ? (m.customFat ?? 0) * multiplier : (m.food?.fatG ?? 0) * multiplier
        return {
          id: m.id,
          mealType: m.mealType,
          food: m.food ? {
            id: m.food.id,
            nameVi: m.food.nameVi,
            region: { code: m.food.region.code, name: m.food.region.name },
            caloriesPerServing: m.food.calories,
            proteinGrams: m.food.proteinG,
            carbsGrams: m.food.carbsG,
            fatGrams: m.food.fatG,
          } : null,
          calories, proteinGrams, carbsGrams, fatGrams,
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
      return { date: dateStr, meals: entries, totals }
    })

  return NextResponse.json({ data: logs })
}
