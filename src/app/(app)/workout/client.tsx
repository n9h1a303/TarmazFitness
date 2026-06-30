"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { WorkoutPlanOutput, WorkoutSessionSummary } from "@/types"

interface WorkoutClientProps {
  userId: string
}

export function WorkoutClient({ userId }: WorkoutClientProps) {
  const router = useRouter()
  const [plan, setPlan] = useState<WorkoutPlanOutput | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [startingSession, setStartingSession] = useState(false)
  const [history, setHistory] = useState<WorkoutSessionSummary[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [planRes, historyRes] = await Promise.all([
          fetch("/api/workout/plans"),
          fetch("/api/workout/history"),
        ])
        if (planRes.ok) {
          const data = await planRes.json()
          setPlan(data.data)
        }
        if (historyRes.ok) {
          const data = await historyRes.json()
          setHistory(data.data)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  async function handleStartSession(dayIndex: number) {
    if (!plan) return
    setStartingSession(true)
    try {
      const res = await fetch("/api/workout/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planDayId: plan.weeklySchedule[dayIndex]?.id ?? null,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/workout/${data.data.session.id}`)
      }
    } catch {
      // ignore
    } finally {
      setStartingSession(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-64 bg-muted rounded" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Lịch tập</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Vào tab{" "}
          <a href="/profile" className="text-primary hover:underline font-medium">
            Cá nhân
          </a>{" "}
          để thiết lập mục tiêu và tạo lịch tập
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lịch tập</h1>
          <p className="text-sm text-muted-foreground">
            {plan.splitName} · {plan.daysPerWeek} buổi/tuần
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{plan.volumeNote}</p>
      </div>

      <div className="space-y-3">
        {plan.weeklySchedule.map((day) => (
          <div
            key={day.dayIndex}
            className="rounded-lg border border-border overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedDay(expandedDay === day.dayIndex ? null : day.dayIndex)
              }
              className="flex w-full items-center justify-between p-3 text-left hover:bg-muted transition-colors"
            >
              <div>
                <span className="font-medium text-sm">{day.dayName}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {day.focus}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  expandedDay === day.dayIndex ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedDay === day.dayIndex && (
              <div className="border-t border-border p-3 space-y-3">
                <div className="space-y-2">
                  {day.exercises.map((ex) => (
                    <div
                      key={ex.sortOrder}
                      className="flex items-start gap-3 rounded bg-muted p-2"
                    >
                      <img
                        src={ex.exercise.imageUrl}
                        alt={ex.exercise.nameEn}
                        className="w-12 h-12 rounded object-cover shrink-0"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-medium">
                          {ex.exercise.nameEn}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ex.targetSets} × {ex.targetReps} · nghỉ {ex.restSeconds}s
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleStartSession(day.dayIndex)}
                  className="w-full"
                  disabled={startingSession}
                >
                  {startingSession ? "Đang bắt đầu..." : "Bắt đầu buổi tập"}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {history.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex w-full items-center justify-between p-3 text-left hover:bg-muted transition-colors"
          >
            <span className="font-semibold text-sm">Lịch sử buổi tập</span>
            <span className="text-xs text-muted-foreground">
              {history.length} buổi
            </span>
          </button>

          {showHistory && (
            <div className="border-t border-border divide-y divide-border">
              {history.map((s) => (
                <div key={s.id} className="p-3 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{s.date}</span>
                    <span className="text-muted-foreground">{s.focus ?? "Tập tự do"}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{s.totalSets} sets</span>
                    <span>{s.totalVolume.toLocaleString()} kg</span>
                    <span>{s.isCompleted ? "✅" : "⏸️"}</span>
                  </div>
                  {s.exercises.length > 0 && (
                    <div className="space-y-1.5">
                      {s.exercises.map((ex, i) => (
                        <div key={i} className="flex items-start gap-2 rounded bg-muted/50 p-1.5">
                          <img
                            src={ex.exercise.imageUrl}
                            alt={ex.exercise.nameEn}
                            className="w-8 h-8 rounded object-cover shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate">{ex.exercise.nameVi}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {ex.sets.map((set, j) => (
                                <span key={j}>
                                  {j > 0 && " · "}
                                  {set.reps}×{set.weightKg}kg
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
