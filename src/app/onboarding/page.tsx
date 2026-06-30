"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [gender, setGender] = useState<"male" | "female" | "">("")
  const [age, setAge] = useState("")
  const [heightCm, setHeightCm] = useState("")
  const [weightKg, setWeightKg] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!gender) {
      setError("Vui lòng chọn giới tính")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          gender,
          age: parseInt(age),
          heightCm: parseFloat(heightCm),
          weightKg: parseFloat(weightKg),
          hasOnboarded: true,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error?.message || "Có lỗi xảy ra")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Chào mừng đến với Tarmaz Fitness</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Nhập thông tin cơ bản để bắt đầu
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Họ tên
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Giới tính</label>
            <div className="mt-1 flex gap-3">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  gender === "male"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                Nam
              </button>
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  gender === "female"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-muted"
                }`}
              >
                Nữ
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium">
              Tuổi
            </label>
            <input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={10}
              max={120}
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="height" className="block text-sm font-medium">
              Chiều cao (cm)
            </label>
            <input
              id="height"
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              min={50}
              max={250}
              step="0.1"
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium">
              Cân nặng (kg)
            </label>
            <input
              id="weight"
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              min={20}
              max={300}
              step="0.1"
              className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang lưu..." : "Bắt đầu"}
          </Button>
        </form>
      </div>
    </div>
  )
}
