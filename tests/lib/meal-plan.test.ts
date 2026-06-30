import { describe, it, expect } from "vitest"
import { suggestMeals, distributeMacroToMeals, getMealTypesForDay } from "@/lib/meal-plan"
import type { FoodItem } from "@/types"

const mockFoods: FoodItem[] = [
  {
    id: "1", nameVi: "Phở bò", region: { code: "northern", name: "Miền Bắc" },
    category: { name: "Món chính", slug: "main-dish" },
    servingSize: "1 tô", servingGrams: 400,
    caloriesPerServing: 350, proteinGrams: 20, carbsGrams: 45, fatGrams: 10,
    isVerified: false, mealTime: ["breakfast", "lunch"],
  },
  {
    id: "2", nameVi: "Cơm tấm", region: { code: "southern", name: "Miền Nam" },
    category: { name: "Món chính", slug: "main-dish" },
    servingSize: "1 dĩa", servingGrams: 350,
    caloriesPerServing: 500, proteinGrams: 22, carbsGrams: 65, fatGrams: 18,
    isVerified: false, mealTime: ["lunch", "dinner"],
  },
  {
    id: "3", nameVi: "Sữa chua", region: { code: "northern", name: "Miền Bắc" },
    category: { name: "Ăn nhẹ", slug: "snacks" },
    servingSize: "1 hũ", servingGrams: 100,
    caloriesPerServing: 80, proteinGrams: 3, carbsGrams: 12, fatGrams: 2,
    isVerified: false, mealTime: ["snack", "breakfast"],
  },
]

describe("suggestMeals", () => {
  it("returns foods within tolerance for a meal type", () => {
    const result = suggestMeals(mockFoods, 350, 20, 45, 10, "lunch")
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].nameVi).toBe("Phở bò")
  })

  it("only suggests foods matching the requested meal type", () => {
    const result = suggestMeals(mockFoods, 350, 20, 45, 10, "dinner")
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((f) => f.mealTime.includes("dinner"))).toBe(true)
  })
})

describe("distributeMacroToMeals", () => {
  it("divides macros equally among meals", () => {
    const result = distributeMacroToMeals(2000, 100, 250, 50, 4)
    expect(result).toHaveLength(4)
    expect(result[0].calories).toBe(500)
    expect(result[0].protein).toBe(25)
  })

  it("handles min and max meals", () => {
    expect(distributeMacroToMeals(2000, 100, 250, 50, 2)).toHaveLength(2)
    expect(distributeMacroToMeals(2000, 100, 250, 50, 6)).toHaveLength(6)
  })

  it("sums back to original totals exactly (no floating-point drift)", () => {
    const result = distributeMacroToMeals(2000, 145, 250, 55, 4)
    const sums = result.reduce(
      (acc, m) => ({ calories: acc.calories + m.calories, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
    expect(sums.calories).toBe(2000)
    expect(sums.protein).toBe(145)
    expect(sums.carbs).toBe(250)
    expect(sums.fat).toBe(55)
  })

  it("handles uneven division correctly", () => {
    const result = distributeMacroToMeals(2001, 146, 251, 56, 3)
    expect(result).toHaveLength(3)
    expect(result[2].calories).toBe(2001 - Math.floor(2001 / 3) * 2)
    expect(result[2].protein).toBe(146 - Math.floor(146 / 3) * 2)
  })
})

describe("getMealTypesForDay", () => {
  it("returns correct meal types for 3 meals", () => {
    expect(getMealTypesForDay(3)).toEqual(["breakfast", "lunch", "dinner"])
  })

  it("returns all 4 meal types for 4+ meals", () => {
    expect(getMealTypesForDay(4)).toEqual(["breakfast", "lunch", "dinner", "snack"])
    expect(getMealTypesForDay(6)).toEqual(["breakfast", "lunch", "dinner", "snack"])
  })
})
