"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import type { MacroTargets, UserProfile } from "@/types"

interface ProfileClientProps {
  userId: string
}

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Ít vận động (dân văn phòng)" },
  { value: "light", label: "Nhẹ (1-2 buổi/tuần)" },
  { value: "moderate", label: "Trung bình (3-4 buổi/tuần)" },
  { value: "active", label: "Năng động (5-6 buổi/tuần)" },
  { value: "very_active", label: "Rất năng động (hàng ngày)" },
]

const GOAL_OPTIONS = [
  { value: "bulking", label: "Tăng cơ (Bulking)", desc: "TDEE + 400 calo" },
  { value: "lean_bulk", label: "Tăng cơ nạc (Lean Bulk)", desc: "TDEE + 150 calo" },
  { value: "cutting", label: "Giảm mỡ (Cutting)", desc: "TDEE - 400 calo" },
]

const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Mới bắt đầu" },
  { value: "intermediate", label: "Trung cấp" },
  { value: "advanced", label: "Nâng cao" },
]

export function ProfileClient({ userId }: ProfileClientProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [targets, setTargets] = useState<MacroTargets | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [activityLevel, setActivityLevel] = useState("")
  const [goal, setGoal] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("")
  const [goalDurationMonths, setGoalDurationMonths] = useState(3)
  const [mealsPerDay, setMealsPerDay] = useState(4)
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(4)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/profile")
        if (res.ok) {
          const data = await res.json()
          const user = data.data.user as UserProfile
          setProfile(user)
          setActivityLevel(user.activityLevel ?? "")
          setGoal(user.goal ?? "")
          setExperienceLevel(user.experienceLevel ?? "")
          setGoalDurationMonths(user.goalDurationMonths ?? 3)
          setMealsPerDay(user.mealsPerDay ?? 4)
          setWorkoutsPerWeek(user.workoutsPerWeek ?? 4)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  async function handleCalculate() {
    setError("")
    setSaving(true)

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activityLevel,
          goal,
          experienceLevel,
          goalDurationMonths,
          mealsPerDay,
          workoutsPerWeek,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error?.message || "Có lỗi xảy ra")
        return
      }

      const targetsRes = await fetch("/api/profile/macro-targets")
      if (targetsRes.ok) {
        const t = await targetsRes.json()
        setTargets(t.data)
      }
    } catch {
      setError("Có lỗi xảy ra")
    } finally {
      setSaving(false)
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

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cá nhân</h1>
        <p className="text-sm text-muted-foreground">Thông tin và mục tiêu của bạn</p>
      </div>

      {profile && (
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h2 className="font-semibold">Thông tin cơ bản</h2>
          <InfoRow label="Họ tên" value={profile.name ?? "-"} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="SĐT" value={profile.phone ?? "-"} />
          <InfoRow label="Tuổi" value={profile.age?.toString() ?? "-"} />
          <InfoRow label="Chiều cao" value={profile.heightCm ? `${profile.heightCm} cm` : "-"} />
          <InfoRow label="Cân nặng" value={profile.weightKg ? `${profile.weightKg} kg` : "-"} />
        </div>
      )}

      <div className="rounded-lg border border-border p-4 space-y-4">
        <h2 className="font-semibold">Cài đặt mục tiêu</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Mức độ hoạt động</label>
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">Chọn mức độ</option>
            {ACTIVITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mục tiêu</label>
          <div className="space-y-2">
            {GOAL_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setGoal(o.value)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  goal === o.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="font-medium text-sm">{o.label}</div>
                <div className="text-xs text-muted-foreground">{o.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Kinh nghiệm tập</label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">Chọn kinh nghiệm</option>
            {EXPERIENCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Thời gian mục tiêu: {goalDurationMonths} tháng
          </label>
          <input
            type="range"
            min={1}
            max={12}
            value={goalDurationMonths}
            onChange={(e) => setGoalDurationMonths(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 tháng</span>
            <span>12 tháng</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Số bữa/ngày: {mealsPerDay}
          </label>
          <input
            type="range"
            min={2}
            max={6}
            value={mealsPerDay}
            onChange={(e) => setMealsPerDay(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2</span>
            <span>6</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Số buổi tập/tuần: {workoutsPerWeek}
          </label>
          <input
            type="range"
            min={2}
            max={7}
            value={workoutsPerWeek}
            onChange={(e) => setWorkoutsPerWeek(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2</span>
            <span>7</span>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button onClick={handleCalculate} className="w-full" disabled={saving}>
          {saving ? "Đang tính..." : "Tính toán"}
        </Button>
      </div>

      {targets && (
        <div className="rounded-lg border border-border p-4 space-y-3">
          <h2 className="font-semibold">Kết quả tính toán</h2>
          <InfoRow label="BMR" value={`${targets.bmr} kcal`} />
          <InfoRow label="TDEE" value={`${targets.tdee} kcal`} />
          <InfoRow
            label="Calo mục tiêu"
            value={`${targets.targetCalories} kcal`}
          />
          <div className="border-t border-border pt-3 mt-3">
            <InfoRow label="Đạm (Protein)" value={`${targets.proteinGrams}g (${targets.proteinPercent}%)`} />
            <InfoRow label="Tinh bột (Carbs)" value={`${targets.carbsGrams}g (${targets.carbsPercent}%)`} />
            <InfoRow label="Chất béo (Fat)" value={`${targets.fatGrams}g (${targets.fatPercent}%)`} />
          </div>
        </div>
      )}

      {profile?.goalStartDate && profile?.goalEndDate && (
        <div className="rounded-lg border border-border p-4 space-y-2">
          <h2 className="font-semibold">Tiến trình mục tiêu</h2>
          <GoalProgressCard
            goal={profile.goal ?? ""}
            startDate={profile.goalStartDate}
            endDate={profile.goalEndDate}
          />
        </div>
      )}

      <div className="pt-2 space-y-2">
        <Link href="/history" className="block w-full text-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
          📅 Lịch sử ăn uống
        </Link>
        <Button variant="outline" onClick={() => signOut()} className="w-full">
          Đăng xuất
        </Button>
      </div>
    </div>
  )
}

function GoalProgressCard({ goal, startDate, endDate }: { goal: string; startDate: string; endDate: string }) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const now = new Date()
  const totalMs = end.getTime() - start.getTime()
  const elapsedMs = now.getTime() - start.getTime()
  const pct = Math.min(Math.max(Math.round((elapsedMs / totalMs) * 100), 0), 100)
  const daysRemaining = Math.max(Math.ceil((end.getTime() - now.getTime()) / 86400000), 0)

  const goalLabel: Record<string, string> = {
    bulking: "Tăng cơ",
    lean_bulk: "Tăng cơ nạc",
    cutting: "Giảm mỡ",
  }

  return (
    <>
      <InfoRow label="Mục tiêu" value={goalLabel[goal] ?? goal} />
      <InfoRow label="Thời gian" value={`${start.toLocaleDateString("vi-VN")} → ${end.toLocaleDateString("vi-VN")}`} />
      <InfoRow label="Còn lại" value={`${daysRemaining} ngày`} />
      <div className="mt-2">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{pct}% hoàn thành</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}
