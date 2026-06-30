"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { DailyMealLog } from "@/types"

export function HistoryClient() {
  const [logs, setLogs] = useState<DailyMealLog[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/meals/history?days=30")
      .then(r => r.ok ? r.json() : null)
      .then(d => setLogs(d?.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-4 space-y-3 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-64 bg-muted rounded" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Lịch sử</h1>
          <p className="text-sm text-muted-foreground">30 ngày gần nhất</p>
        </div>
        <Link href="/dashboard" className="text-sm text-primary hover:underline">
          ← Dashboard
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">Chưa có dữ liệu</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((day) => (
            <div key={day.date} className="rounded-lg border border-border">
              <button
                onClick={() => setExpanded(expanded === day.date ? null : day.date)}
                className="w-full flex justify-between items-center p-3 text-left hover:bg-muted transition-colors"
              >
                <span className="font-medium text-sm">
                  {formatDate(day.date)}
                </span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
                  <span>{Math.round(day.totals.calories)} kcal</span>
                  <span>P{Math.round(day.totals.proteinGrams)}</span>
                  <span className="text-amber-500">C{Math.round(day.totals.carbsGrams)}</span>
                  <span className="text-emerald-500">F{Math.round(day.totals.fatGrams)}</span>
                  <span className="text-lg leading-none">{expanded === day.date ? "−" : "+"}</span>
                </div>
              </button>

              {expanded === day.date && (
                <div className="border-t border-border p-3 space-y-2">
                  {day.meals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Không có món ăn</p>
                  ) : (
                    day.meals.map((meal) => (
                      <div key={meal.id} className="flex justify-between text-sm py-0.5">
                        <div className="flex-1 min-w-0">
                          <span className="font-medium truncate">{meal.food?.nameVi ?? "Món tự thêm"}</span>
                          <span className="text-xs text-muted-foreground ml-2">{mealLabel(meal.mealType)}</span>
                        </div>
                        <span className="text-muted-foreground tabular-nums shrink-0 ml-2">
                          {Math.round(meal.calories)} kcal
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateStr === today.toISOString().split("T")[0]) return "Hôm nay"
  if (dateStr === yesterday.toISOString().split("T")[0]) return "Hôm qua"

  return d.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric" })
}

function mealLabel(m: string) {
  const map: Record<string, string> = { breakfast: "Sáng", lunch: "Trưa", dinner: "Tối", snack: "Phụ" }
  return map[m] ?? m
}
