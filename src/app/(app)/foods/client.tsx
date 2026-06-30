"use client"

import { useEffect, useState, useCallback } from "react"
import type { FoodDetail, FoodItem } from "@/types"
import { Button } from "@/components/ui/button"

type RegionCode = "northern" | "central" | "southern"

const REGIONS: { code: RegionCode; label: string }[] = [
  { code: "northern", label: "Miền Bắc" },
  { code: "central", label: "Miền Trung" },
  { code: "southern", label: "Miền Nam" },
]

export function FoodsClient() {
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [region, setRegion] = useState<RegionCode | null>(null)
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [foodDetail, setFoodDetail] = useState<FoodDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [addingFood, setAddingFood] = useState(false)

  const fetchFoods = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (region) params.set("region", region)
      if (search) params.set("search", search)
      params.set("pageSize", "50")

      const res = await fetch(`/api/foods?${params}`)
      if (res.ok) {
        const data = await res.json()
        setFoods(data.data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [region, search])

  useEffect(() => {
    const timer = setTimeout(fetchFoods, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [fetchFoods, search])

  useEffect(() => {
    if (!selectedFood) { setFoodDetail(null); return }
    setDetailLoading(true)
    fetch(`/api/foods/${selectedFood.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setFoodDetail(d?.data ?? null))
      .catch(() => setFoodDetail(null))
      .finally(() => setDetailLoading(false))
  }, [selectedFood])

  async function handleAddMeal(food: FoodItem) {
    setAddingFood(true)
    try {
      const today = new Date().toISOString().split("T")[0]
      const mealType = food.mealTime[0] ?? "lunch"

      await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodId: food.id,
          mealType,
          date: today,
        }),
      })

      setSelectedFood(null)
    } catch {
      // ignore
    } finally {
      setAddingFood(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Thực đơn</h1>
        <p className="text-sm text-muted-foreground">Danh sách món ăn Việt Nam</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setRegion(null)}
          className={`shrink-0 rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
            !region
              ? "border-primary bg-primary/10 text-primary"
              : "border-border hover:bg-muted"
          }`}
        >
          Tất cả
        </button>
        {REGIONS.map((r) => (
          <button
            key={r.code}
            onClick={() => setRegion(r.code)}
            className={`shrink-0 rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
              region === r.code
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm món ăn..."
        className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : foods.length === 0 ? (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">Không tìm thấy món ăn nào</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {foods.map((food) => (
            <button
              key={food.id}
              onClick={() => setSelectedFood(food)}
              className="text-left rounded-lg border border-border p-3 hover:bg-muted transition-colors"
            >
              <div className="font-medium text-sm">{food.nameVi}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-muted px-2 py-0.5">
                  {food.region.name}
                </span>
                <span>{Math.round(food.caloriesPerServing)} kcal</span>
              </div>
              <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                <span>Đạm: {Math.round(food.proteinGrams)}g</span>
                <span>Bột: {Math.round(food.carbsGrams)}g</span>
                <span>Béo: {Math.round(food.fatGrams)}g</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedFood && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-xl sm:rounded-xl bg-background p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold">{selectedFood.nameVi}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedFood.region.name} · {selectedFood.servingSize}
                </p>
              </div>
              <button
                onClick={() => setSelectedFood(null)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div className="rounded bg-muted p-2">
                <div className="font-bold text-lg">{Math.round(selectedFood.caloriesPerServing)}</div>
                <div className="text-xs text-muted-foreground">kcal</div>
              </div>
              <div className="rounded bg-muted p-2">
                <div className="font-bold text-lg text-rose-500">{Math.round(selectedFood.proteinGrams)}g</div>
                <div className="text-xs text-muted-foreground">Đạm</div>
              </div>
              <div className="rounded bg-muted p-2">
                <div className="font-bold text-lg text-amber-500">{Math.round(selectedFood.carbsGrams)}g</div>
                <div className="text-xs text-muted-foreground">Bột</div>
              </div>
              <div className="rounded bg-muted p-2">
                <div className="font-bold text-lg text-emerald-500">{Math.round(selectedFood.fatGrams)}g</div>
                <div className="text-xs text-muted-foreground">Béo</div>
              </div>
            </div>

            {detailLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-20 bg-muted rounded" />
              </div>
            ) : foodDetail ? (
              <>
                {foodDetail.ingredients.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Nguyên liệu</h3>
                    <div className="space-y-1 text-sm">
                      {foodDetail.ingredients.map((ing, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{ing.ingredientName}</span>
                          <span className="text-muted-foreground">{ing.grams}g</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(foodDetail.prepTimeMinutes || foodDetail.cookTimeMinutes) && (
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {foodDetail.prepTimeMinutes && (
                      <span>⏱ Chuẩn bị: {foodDetail.prepTimeMinutes} phút</span>
                    )}
                    {foodDetail.cookTimeMinutes && (
                      <span>🔥 Nấu: {foodDetail.cookTimeMinutes} phút</span>
                    )}
                    {foodDetail.difficulty && (
                      <span>📊 Độ khó: {difficultyLabel(foodDetail.difficulty)}</span>
                    )}
                  </div>
                )}

                {foodDetail.recipeSteps.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Cách nấu</h3>
                    <ol className="space-y-2 text-sm list-decimal list-inside">
                      {foodDetail.recipeSteps.map((step, i) => (
                        <li key={i} className="text-muted-foreground">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </>
            ) : null}

            <Button
              onClick={() => handleAddMeal(selectedFood)}
              className="w-full"
              disabled={addingFood}
            >
              {addingFood ? "Đang thêm..." : "Thêm vào bữa ăn hôm nay"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function difficultyLabel(d: string) {
  const map: Record<string, string> = { easy: "Dễ", medium: "Trung bình", hard: "Khó" }
  return map[d] ?? d
}
