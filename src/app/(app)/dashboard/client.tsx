"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import type { MacroTargets, MacroTotals, MealSuggestion, MealEntry, UserProfile } from "@/types"
import { Button } from "@/components/ui/button"

interface DashboardClientProps {
  userId: string
}

const TODAY = new Date().toISOString().split("T")[0]

export function DashboardClient({ userId }: DashboardClientProps) {
  const [targets, setTargets] = useState<MacroTargets | null>(null)
  const [totals, setTotals] = useState<MacroTotals>({ calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 })
  const [meals, setMeals] = useState<MealEntry[]>([])
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingFood, setAddingFood] = useState<string | null>(null)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customMeal, setCustomMeal] = useState({ mealType: "lunch", name: "", calories: "", protein: "", carbs: "", fat: "" })
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set()
    const key = `tarmaz-dismissed-${TODAY}`
    const stored = localStorage.getItem(key)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  })

  const saveDismissed = useCallback((ids: Set<string>) => {
    const key = `tarmaz-dismissed-${TODAY}`
    localStorage.setItem(key, JSON.stringify([...ids]))
  }, [])

  const loadData = useCallback(async () => {
    try {
      const [targetsRes, mealsRes, suggestRes, profileRes] = await Promise.all([
        fetch("/api/profile/macro-targets"),
        fetch(`/api/meals?date=${TODAY}`),
        fetch("/api/meals/suggest"),
        fetch("/api/profile"),
      ])

      if (targetsRes.ok) {
        const t = await targetsRes.json()
        setTargets(t.data)
      }

      if (mealsRes.ok) {
        const m = await mealsRes.json()
        setMeals(m.data?.meals ?? [])
        setTotals(m.data?.totals ?? { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 })
      }

      if (suggestRes.ok) {
        const s = await suggestRes.json()
        setSuggestions(s.data?.suggestions ?? [])
      }

      if (profileRes.ok) {
        const p = await profileRes.json()
        setProfile(p.data.user)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const overLimit = targets && (
    totals.calories > targets.targetCalories * 1.1 ||
    totals.proteinGrams > targets.proteinGrams * 1.1 ||
    totals.carbsGrams > targets.carbsGrams * 1.1 ||
    totals.fatGrams > targets.fatGrams * 1.1
  )

  async function handleAddMeal(foodId: string, mealType: string) {
    setAddingFood(foodId)
    try {
      await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodId, mealType, date: TODAY }),
      })
      await loadData()
    } catch {
      // ignore
    } finally {
      setAddingFood(null)
    }
  }

  async function handleRemoveMeal(mealId: string) {
    try {
      await fetch(`/api/meals/${mealId}`, { method: "DELETE" })
      await loadData()
    } catch {
      // ignore
    }
  }

  async function handleAddCustomMeal() {
    if (!customMeal.name || !customMeal.calories) return
    setAddingFood("custom")
    try {
      await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType: customMeal.mealType,
          date: TODAY,
          customName: customMeal.name,
          customCalories: parseFloat(customMeal.calories) || 0,
          customProtein: parseFloat(customMeal.protein) || 0,
          customCarbs: parseFloat(customMeal.carbs) || 0,
          customFat: parseFloat(customMeal.fat) || 0,
        }),
      })
      setShowCustomForm(false)
      setCustomMeal({ mealType: "lunch", name: "", calories: "", protein: "", carbs: "", fat: "" })
      await loadData()
    } catch {
      // ignore
    } finally {
      setAddingFood(null)
    }
  }

  function dismissSuggestion(mealType: string, foodId: string) {
    const next = new Set(dismissedSuggestions)
    next.add(`${mealType}-${foodId}`)
    setDismissedSuggestions(next)
    saveDismissed(next)
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-4 w-64 bg-muted rounded" />
        <div className="h-24 bg-muted rounded" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Tổng quan dinh dưỡng hôm nay</p>
        </div>
        {profile?.goalEndDate && (
          <GoalBadge endDate={profile.goalEndDate} goal={profile.goal ?? ""} />
        )}
      </div>

      {overLimit && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive font-medium">
          ⚠ Một số chỉ tiêu dinh dưỡng đã vượt quá mục tiêu! Hãy kiểm tra lại khẩu phần ăn.
        </div>
      )}

      {!targets ? (
        <div className="rounded-lg border border-border p-6 text-center">
          <p className="text-muted-foreground">
            Vào tab{" "}
            <a href="/profile" className="text-primary hover:underline font-medium">
              Cá nhân
            </a>{" "}
            để thiết lập mục tiêu của bạn
          </p>
        </div>
      ) : (
        <>
          <MacroProgressSection targets={targets} totals={totals} />

          {/* Today's meals */}
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Thực đơn hôm nay</h2>
              <button
                onClick={() => setShowCustomForm(!showCustomForm)}
                className="text-xs text-primary hover:underline font-medium"
              >
                {showCustomForm ? "Huỷ" : "+ Thêm món tự nhập"}
              </button>
            </div>

            {showCustomForm && (
              <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/30">
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-0.5">Tên món</label>
                    <input
                      value={customMeal.name}
                      onChange={(e) => setCustomMeal({ ...customMeal, name: e.target.value })}
                      className="block w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                      placeholder="VD: Trứng ốp la"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Loại bữa</label>
                    <select
                      value={customMeal.mealType}
                      onChange={(e) => setCustomMeal({ ...customMeal, mealType: e.target.value })}
                      className="block w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                    >
                      <option value="breakfast">Sáng</option>
                      <option value="lunch">Trưa</option>
                      <option value="dinner">Tối</option>
                      <option value="snack">Phụ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Calo (kcal)</label>
                    <input
                      type="number"
                      value={customMeal.calories}
                      onChange={(e) => setCustomMeal({ ...customMeal, calories: e.target.value })}
                      className="block w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                      placeholder="350"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Đạm (g)</label>
                    <input
                      type="number"
                      value={customMeal.protein}
                      onChange={(e) => setCustomMeal({ ...customMeal, protein: e.target.value })}
                      className="block w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                      placeholder="20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Bột (g)</label>
                    <input
                      type="number"
                      value={customMeal.carbs}
                      onChange={(e) => setCustomMeal({ ...customMeal, carbs: e.target.value })}
                      className="block w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                      placeholder="45"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-0.5">Béo (g)</label>
                    <input
                      type="number"
                      value={customMeal.fat}
                      onChange={(e) => setCustomMeal({ ...customMeal, fat: e.target.value })}
                      className="block w-full rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary"
                      placeholder="10"
                    />
                  </div>
                </div>
                <Button onClick={handleAddCustomMeal} size="sm" className="w-full" disabled={addingFood === "custom"}>
                  {addingFood === "custom" ? "Đang thêm..." : "Thêm vào thực đơn"}
                </Button>
              </div>
            )}

            {meals.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có món ăn nào. Thêm từ gợi ý bên dưới hoặc vào tab Thực đơn.</p>
            ) : (
              <div className="space-y-2">
                {meals.map((meal) => (
                  <div key={meal.id} className="flex justify-between items-center gap-2 text-sm py-1">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{meal.food?.nameVi ?? meal.customName ?? "Món tự thêm"}</div>
                      <div className="text-xs text-muted-foreground">
                        {mealLabel(meal.mealType)} · {Math.round(meal.calories)} kcal
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums shrink-0">
                      P{Math.round(meal.proteinGrams)} C{Math.round(meal.carbsGrams)} F{Math.round(meal.fatGrams)}
                    </div>
                    <button
                      onClick={() => handleRemoveMeal(meal.id)}
                      className="shrink-0 w-6 h-6 rounded-full bg-muted hover:bg-destructive/20 text-muted-foreground hover:text-destructive flex items-center justify-center text-sm font-bold transition-colors"
                    >
                      −
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold">Gợi ý thực đơn hôm nay</h2>
              {suggestions.map((s) => (
                <SuggestionCard
                  key={s.mealType}
                  suggestion={s}
                  dismissed={dismissedSuggestions}
                  addingFood={addingFood}
                  onAdd={handleAddMeal}
                  onDismiss={dismissSuggestion}
                />
              ))}
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              href="/foods"
              className="text-sm text-primary hover:underline font-medium"
            >
              Xem tất cả món ăn →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

function mealLabel(m: string) {
  const map: Record<string, string> = { breakfast: "Sáng", lunch: "Trưa", dinner: "Tối", snack: "Phụ" }
  return map[m] ?? m
}

function GoalBadge({ endDate, goal }: { endDate: string; goal: string }) {
  const end = new Date(endDate)
  const days = Math.max(Math.ceil((end.getTime() - Date.now()) / 86400000), 0)
  const goalLabel: Record<string, string> = { bulking: "Tăng cơ", lean_bulk: "Tăng cơ nạc", cutting: "Giảm mỡ" }
  return (
    <div className="text-right text-xs text-muted-foreground">
      <div className="font-medium text-foreground">{goalLabel[goal] ?? goal}</div>
      <div>Còn {days} ngày</div>
    </div>
  )
}

function SuggestionCard({
  suggestion,
  dismissed,
  addingFood,
  onAdd,
  onDismiss,
}: {
  suggestion: MealSuggestion
  dismissed: Set<string>
  addingFood: string | null
  onAdd: (foodId: string, mealType: string) => void
  onDismiss: (mealType: string, foodId: string) => void
}) {
  const mealLabel: Record<string, string> = {
    breakfast: "🍳 Bữa sáng",
    lunch: "🍲 Bữa trưa",
    dinner: "🍜 Bữa tối",
    snack: "🥨 Bữa phụ",
  }

  const visible = suggestion.options.filter(
    (f) => !dismissed.has(`${suggestion.mealType}-${f.id}`)
  )

  if (visible.length === 0) return null

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">{mealLabel[suggestion.mealType] ?? suggestion.mealType}</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          ~{suggestion.targetCalories} kcal
        </span>
      </div>

      <div className="space-y-2">
        {visible.map((food) => (
          <div
            key={food.id}
            className="flex justify-between items-center gap-2 text-sm"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{food.nameVi}</div>
              <div className="text-xs text-muted-foreground">
                {Math.round(food.caloriesPerServing)} kcal · P{Math.round(food.proteinGrams)} C{Math.round(food.carbsGrams)} F{Math.round(food.fatGrams)}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => onDismiss(suggestion.mealType, food.id)}
                className="w-7 h-7 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground flex items-center justify-center text-sm font-bold transition-colors"
                title="Bỏ qua gợi ý này"
              >
                −
              </button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAdd(food.id, suggestion.mealType)}
                disabled={addingFood === food.id}
                className="shrink-0 h-7 px-2"
              >
                {addingFood === food.id ? "..." : "+"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MacroProgressSection({
  targets,
  totals,
}: {
  targets: MacroTargets
  totals: MacroTotals
}) {
  return (
    <div className="space-y-4">
      <MacroBar
        label="Năng lượng"
        current={totals.calories}
        target={targets.targetCalories}
        unit="kcal"
        color="bg-blue-500"
      />
      <MacroBar
        label="Đạm"
        current={totals.proteinGrams}
        target={targets.proteinGrams}
        unit="g"
        color="bg-rose-500"
      />
      <MacroBar
        label="Tinh bột"
        current={totals.carbsGrams}
        target={targets.carbsGrams}
        unit="g"
        color="bg-amber-500"
      />
      <MacroBar
        label="Chất béo"
        current={totals.fatGrams}
        target={targets.fatGrams}
        unit="g"
        color="bg-emerald-500"
      />
    </div>
  )
}

function MacroBar({
  label,
  current,
  target,
  unit,
  color,
}: {
  label: string
  current: number
  target: number
  unit: string
  color: string
}) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const isOver = target > 0 && current > target

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">{label}</span>
        <span className={`tabular-nums ${isOver ? "text-destructive font-bold" : "text-muted-foreground"}`}>
          {Math.round(current)} / {Math.round(target)} {unit}
        </span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isOver ? "bg-destructive" : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isOver && (
        <p className="text-xs text-destructive mt-0.5">Đã vượt mục tiêu!</p>
      )}
    </div>
  )
}
