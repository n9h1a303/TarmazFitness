export type Gender = "male" | "female"

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active"

export type Goal = "bulking" | "lean_bulk" | "cutting"

export type ExperienceLevel = "beginner" | "intermediate" | "advanced"

export type MealType = "breakfast" | "lunch" | "dinner" | "snack"

export type RegionCode = "northern" | "central" | "southern"

export type CategorySlug = "main-dish" | "side-dish" | "drinks" | "snacks"

export type SplitType = "full_body" | "upper_lower" | "ppl" | "ppl_ul"

export type TargetMuscle = "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core" | "Full Body"

export type ExerciseCategory = "compound" | "isolation"

export interface UserProfile {
  id: string
  email: string
  phone: string | null
  name: string | null
  gender: Gender | null
  age: number | null
  heightCm: number | null
  weightKg: number | null
  activityLevel: ActivityLevel | null
  goal: Goal | null
  experienceLevel: ExperienceLevel | null
  mealsPerDay: number | null
  workoutsPerWeek: number | null
  goalDurationMonths: number | null
  goalStartDate: string | null
  goalEndDate: string | null
  hasOnboarded: boolean
}

export interface MacroTargets {
  bmr: number
  tdee: number
  targetCalories: number
  proteinGrams: number
  proteinPercent: number
  carbsGrams: number
  carbsPercent: number
  fatGrams: number
  fatPercent: number
  goal: Goal
}

export interface MacroTotals {
  calories: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
}

export interface FoodItem {
  id: string
  nameVi: string
  region: { code: string; name: string }
  category: { name: string; slug: string }
  servingSize: string
  servingGrams: number
  caloriesPerServing: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
  isVerified: boolean
  mealTime: MealType[]
}

export interface FoodDetail extends FoodItem {
  ingredients: FoodIngredientItem[]
  recipeSteps: string[]
  prepTimeMinutes: number | null
  cookTimeMinutes: number | null
  difficulty: string | null
  createdAt: string
}

export interface FoodIngredientItem {
  ingredientName: string
  grams: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
  calories: number
}

export interface MealEntry {
  id: string
  mealType: MealType
  food: FoodItem | null
  customName: string | null
  customCalories: number | null
  customProtein: number | null
  customCarbs: number | null
  customFat: number | null
  servingMultiplier: number
  calories: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
  createdAt: string
}

export interface MealSuggestion {
  mealType: MealType
  targetCalories: number
  targetProteinGrams: number
  targetCarbsGrams: number
  targetFatGrams: number
  options: FoodItem[]
}

export interface ExerciseLibraryItem {
  id: string
  nameEn: string
  nameVi: string
  targetMuscle: string
  category: "compound" | "isolation"
  imageUrl: string
  description: string | null
}

export interface WorkoutPlanDay {
  id: string
  dayIndex: number
  dayName: string
  focus: string
  focusEn: string
  exercises: WorkoutExercise[]
}

export interface WorkoutExercise {
  exercise: ExerciseLibraryItem
  targetSets: number
  targetReps: string
  restSeconds: number
  sortOrder: number
}

export interface WorkoutPlanOutput {
  id: string
  splitType: SplitType
  splitName: string
  daysPerWeek: number
  goal: Goal
  experienceLevel: ExperienceLevel
  weeklySchedule: WorkoutPlanDay[]
  volumeNote: string
}

export interface WorkoutSession {
  id: string
  userId: string
  planDayId: string | null
  date: string
  startTime: string
  endTime: string | null
  durationSeconds: number | null
  isCompleted: boolean
  notes: string | null
  exercises: WorkoutSessionExercise[]
}

export interface WorkoutSessionExercise {
  exercise: ExerciseLibraryItem
  sets: WorkoutSet[]
}

export interface WorkoutSet {
  id: string
  sessionId: string
  exerciseId: string
  setNumber: number
  reps: number
  weightKg: number
  isWarmup: boolean
  loggedAt: string
}

export interface WorkoutSessionSummary {
  id: string
  date: string
  startTime: string
  durationSeconds: number
  isCompleted: boolean
  focus: string | null
  totalSets: number
  totalVolume: number
  exercises: WorkoutHistoryExercise[]
}

export interface WorkoutHistoryExercise {
  exercise: { id: string; nameEn: string; nameVi: string; imageUrl: string }
  sets: Array<{ setNumber: number; reps: number; weightKg: number }>
}

export interface DailyMealLog {
  date: string
  meals: MealEntry[]
  totals: MacroTotals
}

export interface GoalSummary {
  goal: Goal
  goalDurationMonths: number
  daysElapsed: number
  daysTotal: number
  averageCalories: number
  averageProtein: number
  averageCarbs: number
  averageFat: number
  workoutSessions: number
}

export interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}
