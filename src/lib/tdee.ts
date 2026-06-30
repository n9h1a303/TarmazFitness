import type { Gender, Goal, ActivityLevel, MacroTargets } from "@/types"

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const GOAL_CALORIES: Record<Goal, number> = {
  bulking: 400,
  lean_bulk: 150,
  cutting: -400,
}

interface MacroSplitConfig {
  proteinPct: [number, number]  // [pct_min, pct_max] or target %
  carbsPct: [number, number]
  fatPct: [number, number]
  proteinGPerKg: [number, number]
  carbsGPerKg: [number, number]
  fatGPerKg: [number, number]
}

const MACRO_SPLITS: Record<Goal, MacroSplitConfig> = {
  bulking: {
    proteinPct: [0.25, 0.25],
    carbsPct: [0.55, 0.55],
    fatPct: [0.20, 0.20],
    proteinGPerKg: [1.6, 2.0],
    carbsGPerKg: [4, 6],
    fatGPerKg: [0.8, 1.0],
  },
  lean_bulk: {
    proteinPct: [0.35, 0.35],
    carbsPct: [0.45, 0.45],
    fatPct: [0.20, 0.20],
    proteinGPerKg: [2.0, 2.4],
    carbsGPerKg: [3, 4],
    fatGPerKg: [0.8, 1.0],
  },
  cutting: {
    proteinPct: [0.40, 0.40],
    carbsPct: [0.35, 0.35],
    fatPct: [0.25, 0.25],
    proteinGPerKg: [2.0, 2.6],
    carbsGPerKg: [2, 3],
    fatGPerKg: [0.8, 1.0],
  },
}

const PROTEIN_CAP_PER_KG = 2.8

export function calculateBMR(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  const bmr = gender === "male" ? base + 5 : base - 161
  return Math.round(bmr * 100) / 100
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel])
}

export function calculateCalorieTarget(tdee: number, goal: Goal): number {
  return tdee + GOAL_CALORIES[goal]
}

export function calculateMacros(
  targetCalories: number,
  weightKg: number,
  goal: Goal
): {
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
  proteinPercent: number
  carbsPercent: number
  fatPercent: number
} {
  const split = MACRO_SPLITS[goal]

  // Protein: max của %calo và g/kg, cap 2.8g/kg
  const proteinFromPct = (targetCalories * split.proteinPct[0]) / 4
  const proteinFromGPerKg = split.proteinGPerKg[1] * weightKg
  const proteinGrams = Math.round(
    Math.min(Math.max(proteinFromPct, proteinFromGPerKg), PROTEIN_CAP_PER_KG * weightKg)
  )

  // Fat: max của %calo và g/kg (từ tổng calo, không phải remaining)
  const fatFromPct = (targetCalories * split.fatPct[0]) / 9
  const fatFromGPerKg = split.fatGPerKg[1] * weightKg
  const fatGrams = Math.round(Math.max(fatFromPct, fatFromGPerKg))

  // Carbs: calo còn lại / 4
  const remainingCals = targetCalories - (proteinGrams * 4 + fatGrams * 9)
  const carbsGrams = Math.max(0, Math.round(remainingCals / 4))

  const totalCals = proteinGrams * 4 + carbsGrams * 4 + fatGrams * 9
  const proteinPercent = Math.round((proteinGrams * 4 / totalCals) * 100)
  const carbsPercent = Math.round((carbsGrams * 4 / totalCals) * 100)
  const fatPercent = Math.round((fatGrams * 9 / totalCals) * 100)

  return {
    proteinGrams,
    carbsGrams,
    fatGrams,
    proteinPercent,
    carbsPercent,
    fatPercent,
  }
}

export function calculateMacroTargets(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number,
  activityLevel: ActivityLevel,
  goal: Goal
): MacroTargets {
  const bmr = calculateBMR(gender, weightKg, heightCm, age)
  const tdee = calculateTDEE(bmr, activityLevel)
  const targetCalories = calculateCalorieTarget(tdee, goal)
  const macros = calculateMacros(targetCalories, weightKg, goal)

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    ...macros,
    goal,
  }
}
