import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" } },
      { status: 401 }
    )
  }

  const { id } = await params

  const food = await prisma.food.findUnique({
    where: { id },
    include: {
      region: true,
      category: true,
      ingredients: true,
    },
  })

  if (!food) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Không tìm thấy món ăn" } },
      { status: 404 }
    )
  }

  return NextResponse.json({
    data: {
      id: food.id,
      nameVi: food.nameVi,
      region: { code: food.region.code, name: food.region.name },
      category: { name: food.category.name, slug: food.category.slug },
      servingSize: food.servingSize,
      servingGrams: food.servingGrams,
      caloriesPerServing: food.calories,
      proteinGrams: food.proteinG,
      carbsGrams: food.carbsG,
      fatGrams: food.fatG,
      isVerified: food.isVerified,
      mealTime: food.mealTime,
      recipeSteps: food.recipeSteps ?? [],
      prepTimeMinutes: food.prepTimeMinutes,
      cookTimeMinutes: food.cookTimeMinutes,
      difficulty: food.difficulty,
      ingredients: food.ingredients.map((i) => ({
        ingredientName: i.ingredientName,
        grams: i.grams,
        proteinGrams: i.proteinG,
        carbsGrams: i.carbsG,
        fatGrams: i.fatG,
        calories: i.proteinG * 4 + i.carbsG * 4 + i.fatG * 9,
      })),
      createdAt: food.createdAt.toISOString(),
    },
  })
}
