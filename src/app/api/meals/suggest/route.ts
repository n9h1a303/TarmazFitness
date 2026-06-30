import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateMacroTargets } from "@/lib/tdee"
import { suggestMeals, distributeMacroToMeals, getMealTypesForDay } from "@/lib/meal-plan"
import type { Gender, ActivityLevel, Goal, MealType, FoodItem } from "@/types"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" } },
      { status: 401 }
    )
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.gender || !user.age || !user.heightCm || !user.weightKg || !user.activityLevel || !user.goal) {
    return NextResponse.json(
      { error: { code: "INCOMPLETE_PROFILE", message: "Vui lòng nhập đầy đủ thông tin" } },
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

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today.getTime() + 86400000)

  const mealsToday = await prisma.meal.findMany({
    where: {
      userId: session.user.id,
      date: { gte: today, lt: tomorrow },
    },
    include: { food: true },
  })

  const consumed = mealsToday.reduce(
    (acc, m) => {
      const cals = m.food ? m.food.calories * m.servingMultiplier : (m.customCalories ?? 0) * m.servingMultiplier
      const prot = m.food ? m.food.proteinG * m.servingMultiplier : (m.customProtein ?? 0) * m.servingMultiplier
      const carbs = m.food ? m.food.carbsG * m.servingMultiplier : (m.customCarbs ?? 0) * m.servingMultiplier
      const fat = m.food ? m.food.fatG * m.servingMultiplier : (m.customFat ?? 0) * m.servingMultiplier
      return { calories: acc.calories + cals, protein: acc.protein + prot, carbs: acc.carbs + carbs, fat: acc.fat + fat }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const remaining = {
    calories: targets.targetCalories - consumed.calories,
    protein: targets.proteinGrams - consumed.protein,
    carbs: targets.carbsGrams - consumed.carbs,
    fat: targets.fatGrams - consumed.fat,
  }

  const mealTypes = getMealTypesForDay(user.mealsPerDay ?? 4)
  const perMeal = distributeMacroToMeals(
    Math.max(remaining.calories, 0),
    Math.max(remaining.protein, 0),
    Math.max(remaining.carbs, 0),
    Math.max(remaining.fat, 0),
    mealTypes.length
  )

  const allFoods = await prisma.food.findMany({
    include: { region: true, category: true },
  })

  const foodItems: FoodItem[] = allFoods.map((f) => ({
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
    mealTime: f.mealTime as MealType[],
  }))

  const suggestions = mealTypes.map((mealType, i) => {
    const target = perMeal[i]
    const options = suggestMeals(foodItems, target.calories, target.protein, target.carbs, target.fat, mealType as MealType)

    return {
      mealType,
      targetCalories: Math.round(target.calories),
      targetProteinGrams: Math.round(target.protein),
      targetCarbsGrams: Math.round(target.carbs),
      targetFatGrams: Math.round(target.fat),
      options,
    }
  })

  return NextResponse.json({ data: { suggestions } })
}
