import { describe, it, expect } from "vitest"
import { calculateBMR, calculateTDEE, calculateCalorieTarget, calculateMacros, calculateMacroTargets } from "@/lib/tdee"

describe("calculateBMR", () => {
  it("calculates BMR for male correctly", () => {
    const bmr = calculateBMR("male", 70, 175, 25)
    expect(bmr).toBeCloseTo(1673.75, 1)
  })

  it("calculates BMR for female correctly", () => {
    // 10*55 + 6.25*160 - 5*25 - 161 = 550 + 1000 - 125 - 161 = 1264
    const bmr = calculateBMR("female", 55, 160, 25)
    expect(bmr).toBeCloseTo(1264.0, 1)
  })

  it("handles edge cases", () => {
    expect(calculateBMR("male", 20, 100, 10)).toBeGreaterThan(0)
    expect(calculateBMR("female", 300, 250, 120)).toBeGreaterThan(0)
  })
})

describe("calculateTDEE", () => {
  it("calculates TDEE with moderate activity", () => {
    const tdee = calculateTDEE(1673.75, "moderate")
    expect(tdee).toBe(2594)
  })

  it("calculates TDEE with sedentary activity", () => {
    const tdee = calculateTDEE(1673.75, "sedentary")
    expect(tdee).toBe(2009)
  })

  it("calculates TDEE with very active activity", () => {
    const tdee = calculateTDEE(1673.75, "very_active")
    expect(tdee).toBe(3180)
  })
})

describe("calculateCalorieTarget", () => {
  it("returns TDEE + 400 for bulking", () => {
    expect(calculateCalorieTarget(2500, "bulking")).toBe(2900)
  })

  it("returns TDEE + 150 for lean bulk", () => {
    expect(calculateCalorieTarget(2500, "lean_bulk")).toBe(2650)
  })

  it("returns TDEE - 400 for cutting", () => {
    expect(calculateCalorieTarget(2500, "cutting")).toBe(2100)
  })
})

describe("calculateMacros", () => {
  it("calculates bulking macros correctly", () => {
    const m = calculateMacros(2900, 70, "bulking")
    expect(m.proteinGrams).toBeGreaterThan(0)
    expect(m.carbsGrams).toBeGreaterThan(0)
    expect(m.fatGrams).toBeGreaterThan(0)
    expect(m.proteinPercent + m.carbsPercent + m.fatPercent).toBeCloseTo(100, 0)
  })

  it("caps protein at 2.8g/kg", () => {
    const m = calculateMacros(5000, 100, "cutting")
    const maxProtein = 2.8 * 100
    expect(m.proteinGrams).toBeLessThanOrEqual(maxProtein)
  })

  it("produces valid macro percentages", () => {
    const goals = ["bulking", "lean_bulk", "cutting"] as const
    for (const goal of goals) {
      const m = calculateMacros(2500, 75, goal)
      const sum = m.proteinPercent + m.carbsPercent + m.fatPercent
      expect(sum).toBeGreaterThanOrEqual(99)
      expect(sum).toBeLessThanOrEqual(101)
      expect(m.proteinGrams).toBeGreaterThan(0)
      expect(m.carbsGrams).toBeGreaterThan(0)
      expect(m.fatGrams).toBeGreaterThan(0)
    }
  })
})

describe("calculateMacroTargets", () => {
  it("returns complete macro targets for a typical user", () => {
    const result = calculateMacroTargets("male", 70, 175, 25, "moderate", "bulking")
    expect(result.bmr).toBeGreaterThan(0)
    expect(result.tdee).toBeGreaterThan(result.bmr)
    expect(result.targetCalories).toBeGreaterThan(result.tdee)
    expect(result.proteinGrams).toBeGreaterThan(0)
    expect(result.carbsGrams).toBeGreaterThan(0)
    expect(result.fatGrams).toBeGreaterThan(0)
    expect(result.goal).toBe("bulking")
  })
})
