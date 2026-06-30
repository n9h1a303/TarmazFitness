import type { FoodItem, MealType } from "@/types"

export function suggestMeals(
  foods: FoodItem[],
  targetCaloriesPerMeal: number,
  targetProteinPerMeal: number,
  targetCarbsPerMeal: number,
  targetFatPerMeal: number,
  mealType: MealType,
  tolerance = 0.35
): FoodItem[] {
  const suitable = foods.filter((f) => f.mealTime.includes(mealType))

  if (suitable.length === 0) return []

  const scored = suitable.map((food) => {
    const calDiff = Math.abs(food.caloriesPerServing - targetCaloriesPerMeal) / targetCaloriesPerMeal
    const proteinDiff = Math.abs(food.proteinGrams - targetProteinPerMeal) / targetProteinPerMeal
    const score = (calDiff + proteinDiff) / 2
    return { food, score }
  })

  const withinTolerance = scored
    .filter((s) => s.score <= tolerance)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5)
    .map((s) => s.food)

  return withinTolerance
}

export function distributeMacroToMeals(
  totalCalories: number,
  totalProtein: number,
  totalCarbs: number,
  totalFat: number,
  mealsPerDay: number
): { calories: number; protein: number; carbs: number; fat: number }[] {
  const base = {
    calories: Math.floor(totalCalories / mealsPerDay),
    protein: Math.floor(totalProtein / mealsPerDay),
    carbs: Math.floor(totalCarbs / mealsPerDay),
    fat: Math.floor(totalFat / mealsPerDay),
  }

  const remainder = {
    calories: totalCalories - base.calories * mealsPerDay,
    protein: totalProtein - base.protein * mealsPerDay,
    carbs: totalCarbs - base.carbs * mealsPerDay,
    fat: totalFat - base.fat * mealsPerDay,
  }

  return Array.from({ length: mealsPerDay }, (_, i) => {
    const isLast = i === mealsPerDay - 1
    return {
      calories: base.calories + (isLast ? remainder.calories : 0),
      protein: base.protein + (isLast ? remainder.protein : 0),
      carbs: base.carbs + (isLast ? remainder.carbs : 0),
      fat: base.fat + (isLast ? remainder.fat : 0),
    }
  })
}

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"]

export function getMealTypesForDay(mealsPerDay: number): MealType[] {
  return MEAL_ORDER.slice(0, Math.min(mealsPerDay, MEAL_ORDER.length))
}
