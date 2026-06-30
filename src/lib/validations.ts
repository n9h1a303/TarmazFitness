import { z } from "zod"

export const GenderEnum = z.enum(["male", "female"])
export const ActivityLevelEnum = z.enum(["sedentary", "light", "moderate", "active", "very_active"])
export const GoalEnum = z.enum(["bulking", "lean_bulk", "cutting"])
export const ExperienceLevelEnum = z.enum(["beginner", "intermediate", "advanced"])
export const MealTypeEnum = z.enum(["breakfast", "lunch", "dinner", "snack"])
export const RegionCodeEnum = z.enum(["northern", "central", "southern"])
export const CategorySlugEnum = z.enum(["main-dish", "side-dish", "drinks", "snacks"])
export const SplitTypeEnum = z.enum(["full_body", "upper_lower", "ppl", "ppl_ul"])
export const TargetMuscleEnum = z.enum(["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Full Body"])
export const ExerciseCategoryEnum = z.enum(["compound", "isolation"])

export const RegisterSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().optional(),
})

export const LoginSchema = z.object({
  credential: z.string().min(1),
  password: z.string().min(1),
})

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  gender: GenderEnum.optional(),
  age: z.number().int().min(10).max(120).optional(),
  heightCm: z.number().min(50).max(250).optional(),
  weightKg: z.number().min(20).max(300).optional(),
  activityLevel: ActivityLevelEnum.optional(),
  goal: GoalEnum.optional(),
  experienceLevel: ExperienceLevelEnum.optional(),
  mealsPerDay: z.number().int().min(2).max(6).optional(),
  workoutsPerWeek: z.number().int().min(2).max(7).optional(),
  goalDurationMonths: z.number().int().min(1).max(12).optional(),
  goalStartDate: z.string().optional(),
  goalEndDate: z.string().optional(),
  hasOnboarded: z.boolean().optional(),
  phone: z.string().optional(),
})

export const ListFoodsQuerySchema = z.object({
  region: RegionCodeEnum.optional(),
  category: CategorySlugEnum.optional(),
  search: z.string().optional(),
  mealTime: MealTypeEnum.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
})

export const CreateMealSchema = z.object({
  foodId: z.string().nullable().optional(),
  mealType: MealTypeEnum,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  servingMultiplier: z.number().positive().default(1).optional(),
  customName: z.string().optional(),
  customCalories: z.number().positive().optional(),
  customProtein: z.number().positive().optional(),
  customCarbs: z.number().positive().optional(),
  customFat: z.number().positive().optional(),
})

export const ListExercisesQuerySchema = z.object({
  targetMuscle: TargetMuscleEnum.optional(),
  category: ExerciseCategoryEnum.optional(),
  search: z.string().optional(),
})

export const CreateSessionSchema = z.object({
  planDayId: z.string().nullable().optional(),
  notes: z.string().optional(),
})

export const CreateSetSchema = z.object({
  exerciseId: z.string(),
  setNumber: z.number().int().positive(),
  reps: z.number().int().positive(),
  weightKg: z.number().nonnegative(),
  isWarmup: z.boolean().default(false).optional(),
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
