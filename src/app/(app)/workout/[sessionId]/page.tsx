"use client"

import React, { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { WorkoutSession, WorkoutSessionExercise } from "@/types"

export default function LiveSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const router = useRouter()

  const [session, setSession] = useState<WorkoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [newSetInputs, setNewSetInputs] = useState<Record<string, { weightKg: string; reps: string }>>({})
  const [summary, setSummary] = useState<{
    totalSets: number
    totalReps: number
    totalVolume: number
    duration: string
  } | null>(null)
  const [ended, setEnded] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/workout/sessions/${sessionId}`)
        if (res.ok) {
          const data = await res.json()
          setSession(data.data)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sessionId])

  useEffect(() => {
    if (!session?.startTime) return

    const start = new Date(session.startTime).getTime()
    if (ended) {
      setElapsed(Math.floor((Date.now() - start) / 1000))
      return
    }

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [session?.startTime, ended])

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  async function handleLogSet(exerciseId: string) {
    const input = newSetInputs[exerciseId]
    if (!input || !input.weightKg || !input.reps) return

    const existingSets = session?.exercises
      .find((e: WorkoutSessionExercise) => e.exercise.id === exerciseId)
      ?.sets?.length ?? 0

    try {
      const res = await fetch(`/api/workout/sessions/${sessionId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId,
          setNumber: existingSets + 1,
          reps: parseInt(input.reps),
          weightKg: parseFloat(input.weightKg),
        }),
      })

      if (res.ok) {
        const sessionRes = await fetch(`/api/workout/sessions/${sessionId}`)
        if (sessionRes.ok) {
          const data = await sessionRes.json()
          setSession(data.data)
        }
        setNewSetInputs((prev) => ({ ...prev, [exerciseId]: { weightKg: "", reps: "" } }))
      }
    } catch {
      // ignore
    }
  }

  async function handleEndSession() {
    const now = new Date()
    try {
      const res = await fetch(`/api/workout/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isCompleted: true,
          endTime: now.toISOString(),
        }),
      })

      if (res.ok) {
        if (timerRef.current) clearInterval(timerRef.current)
        setEnded(true)

        const sessionRes = await fetch(`/api/workout/sessions/${sessionId}`)
        if (sessionRes.ok) {
          const data = await sessionRes.json()
          const s = data.data as WorkoutSession
          let totalSets = 0
          let totalReps = 0
          let totalVolume = 0
          for (const ex of s.exercises) {
            totalSets += ex.sets.length
            for (const set of ex.sets) {
              totalReps += set.reps
              totalVolume += set.reps * set.weightKg
            }
          }
          setSummary({
            totalSets,
            totalReps,
            totalVolume,
            duration: formatTime(elapsed),
          })
        }
      }
    } catch {
      // ignore
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

  if (!session) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">Không tìm thấy buổi tập</p>
        <Button onClick={() => router.push("/workout")} className="mt-4">
          Quay lại lịch tập
        </Button>
      </div>
    )
  }

  if (summary) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Buổi tập hoàn tất!</h1>
          <p className="text-muted-foreground">Tổng kết buổi tập</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted p-3 text-center">
            <div className="text-2xl font-bold">{summary.totalSets}</div>
            <div className="text-xs text-muted-foreground">Sets</div>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <div className="text-2xl font-bold">{summary.totalReps}</div>
            <div className="text-xs text-muted-foreground">Reps</div>
          </div>
          <div className="rounded-lg bg-muted p-3 text-center">
            <div className="text-2xl font-bold">{summary.totalVolume.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Volume (kg)</div>
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          Thời gian tập: {summary.duration}
        </div>
        <Button onClick={() => router.push("/workout")} className="w-full">
          Quay lại lịch tập
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Buổi tập</h1>
          <p className="text-sm text-muted-foreground">
            {session.date} · {session.planDayId ? "Theo lịch" : "Tập tự do"}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tabular-nums tracking-wider">
            {formatTime(elapsed)}
          </div>
          <div className="text-xs text-muted-foreground">Thời gian</div>
        </div>
      </div>

      <div className="space-y-4">
        {session.exercises.length === 0 ? (
          <div className="rounded-lg border border-border p-6 text-center">
            <p className="text-muted-foreground">Bắt đầu thêm các set tập luyện</p>
          </div>
        ) : (
          session.exercises.map((ex: WorkoutSessionExercise) => (
            <div key={ex.exercise.id} className="rounded-lg border border-border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <img
                  src={ex.exercise.imageUrl}
                  alt={ex.exercise.nameEn}
                  className="w-10 h-10 rounded object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
                <div>
                  <div className="font-medium text-sm">{ex.exercise.nameEn}</div>
                  <div className="text-xs text-muted-foreground">{ex.exercise.targetMuscle}</div>
                </div>
              </div>

              {ex.sets.length > 0 && (
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground bg-muted rounded p-2">
                  <span className="font-medium">Set</span>
                  <span className="font-medium">Kg</span>
                  <span className="font-medium">Reps</span>
                  {ex.sets.map((set) => (
                    <React.Fragment key={set.id}>
                      <span className="tabular-nums">{set.setNumber}</span>
                      <span className="tabular-nums">{set.weightKg}</span>
                      <span className="tabular-nums">{set.reps}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Kg"
                  value={newSetInputs[ex.exercise.id]?.weightKg ?? ""}
                  onChange={(e) =>
                    setNewSetInputs((prev) => ({
                      ...prev,
                      [ex.exercise.id]: { ...prev[ex.exercise.id], weightKg: e.target.value },
                    }))
                  }
                  className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary w-20"
                />
                <input
                  type="number"
                  placeholder="Reps"
                  value={newSetInputs[ex.exercise.id]?.reps ?? ""}
                  onChange={(e) =>
                    setNewSetInputs((prev) => ({
                      ...prev,
                      [ex.exercise.id]: { ...prev[ex.exercise.id], reps: e.target.value },
                    }))
                  }
                  className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-primary w-20"
                />
                <Button
                  onClick={() => handleLogSet(ex.exercise.id)}
                  size="sm"
                  disabled={!newSetInputs[ex.exercise.id]?.weightKg || !newSetInputs[ex.exercise.id]?.reps}
                >
                  + Set
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Button onClick={handleEndSession} variant="destructive" className="w-full">
        Kết thúc buổi tập
      </Button>
    </div>
  )
}
