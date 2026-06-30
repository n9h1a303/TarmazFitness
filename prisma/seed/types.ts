export interface FoodSeed {
  nameVi: string
  regionCode: string
  categorySlug: string
  servingSize: string
  servingGrams: number
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  mealTime: string[]
  prepTimeMinutes?: number
  cookTimeMinutes?: number
  difficulty?: string
  recipeSteps?: string[]
  ingredients?: { ingredientName: string; grams: number }[]
}
