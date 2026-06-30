import { describe, it, expect } from "vitest"
import { getWorkoutPlan } from "@/lib/workout-planner"
import type { ExerciseLibraryItem } from "@/types"

const mockExercises: ExerciseLibraryItem[] = [
  { id: "1", nameEn: "Bench Press", nameVi: "Nằm đẩy tạ", targetMuscle: "Chest", category: "compound", imageUrl: "https://example.com/bench.jpg", description: "Push" },
  { id: "2", nameEn: "Squat", nameVi: "Ngồi xổm", targetMuscle: "Legs", category: "compound", imageUrl: "https://example.com/squat.jpg", description: "Legs" },
  { id: "3", nameEn: "Deadlift", nameVi: "Kéo tạ chết", targetMuscle: "Back", category: "compound", imageUrl: "https://example.com/deadlift.jpg", description: "Pull" },
  { id: "4", nameEn: "Pull-ups", nameVi: "Kéo xà", targetMuscle: "Back", category: "compound", imageUrl: "https://example.com/pullups.jpg", description: "Pull" },
  { id: "5", nameEn: "Barbell Row", nameVi: "Hàng tạ đòn", targetMuscle: "Back", category: "compound", imageUrl: "https://example.com/row.jpg", description: "Pull" },
  { id: "6", nameEn: "Overhead Press", nameVi: "Đẩy tạ trên đầu", targetMuscle: "Shoulders", category: "compound", imageUrl: "https://example.com/ohp.jpg", description: "Push" },
  { id: "7", nameEn: "Romanian Deadlift", nameVi: "Kéo tạ romania", targetMuscle: "Back", category: "compound", imageUrl: "https://example.com/rdl.jpg", description: "Pull" },
  { id: "8", nameEn: "Leg Press", nameVi: "Đạp chân", targetMuscle: "Legs", category: "compound", imageUrl: "https://example.com/legpress.jpg", description: "Legs" },
  { id: "9", nameEn: "Walking Lunge", nameVi: "Bước chân", targetMuscle: "Legs", category: "compound", imageUrl: "https://example.com/lunge.jpg", description: "Legs" },
  { id: "10", nameEn: "Leg Curl", nameVi: "Cuốn chân", targetMuscle: "Legs", category: "isolation", imageUrl: "https://example.com/legcurl.jpg", description: "Legs" },
  { id: "11", nameEn: "Leg Extension", nameVi: "Đạp chân duỗi", targetMuscle: "Legs", category: "isolation", imageUrl: "https://example.com/legext.jpg", description: "Legs" },
  { id: "12", nameEn: "Calf Raise", nameVi: "Nhón gót", targetMuscle: "Legs", category: "isolation", imageUrl: "https://example.com/calf.jpg", description: "Legs" },
  { id: "13", nameEn: "Plank", nameVi: "Tấm ván", targetMuscle: "Core", category: "isolation", imageUrl: "https://example.com/plank.jpg", description: "Core" },
  { id: "14", nameEn: "Hip Thrust", nameVi: "Nâng hông", targetMuscle: "Legs", category: "compound", imageUrl: "https://example.com/hipthrust.jpg", description: "Legs" },
  { id: "15", nameEn: "Bulgarian Split Squat", nameVi: "Squat một chân", targetMuscle: "Legs", category: "compound", imageUrl: "https://example.com/bss.jpg", description: "Legs" },
  { id: "16", nameEn: "Incline Bench Press", nameVi: "Đẩy tạ dốc", targetMuscle: "Chest", category: "compound", imageUrl: "https://example.com/incline.jpg", description: "Push" },
  { id: "17", nameEn: "Dumbbell Fly", nameVi: "Mở tạ đơn", targetMuscle: "Chest", category: "isolation", imageUrl: "https://example.com/fly.jpg", description: "Push" },
  { id: "18", nameEn: "Lat Pulldown", nameVi: "Kéo xô", targetMuscle: "Back", category: "compound", imageUrl: "https://example.com/lat.jpg", description: "Pull" },
  { id: "19", nameEn: "Cable Row", nameVi: "Kéo cáp ngồi", targetMuscle: "Back", category: "compound", imageUrl: "https://example.com/cablerow.jpg", description: "Pull" },
  { id: "20", nameEn: "Dumbbell Shoulder Press", nameVi: "Đẩy vai tạ đơn", targetMuscle: "Shoulders", category: "compound", imageUrl: "https://example.com/dbpress.jpg", description: "Push" },
  { id: "21", nameEn: "Lateral Raise", nameVi: "Ngang vai", targetMuscle: "Shoulders", category: "isolation", imageUrl: "https://example.com/latraise.jpg", description: "Push" },
  { id: "22", nameEn: "Face Pull", nameVi: "Kéo mặt", targetMuscle: "Shoulders", category: "isolation", imageUrl: "https://example.com/facepull.jpg", description: "Pull" },
  { id: "23", nameEn: "Triceps Pushdown", nameVi: "Kéo cáp tay sau", targetMuscle: "Arms", category: "isolation", imageUrl: "https://example.com/tricep.jpg", description: "Push" },
  { id: "24", nameEn: "Barbell Curl", nameVi: "Cuốn tạ đòn", targetMuscle: "Arms", category: "isolation", imageUrl: "https://example.com/curl.jpg", description: "Pull" },
  { id: "25", nameEn: "Hammer Curl", nameVi: "Cuốn búa", targetMuscle: "Arms", category: "isolation", imageUrl: "https://example.com/hammer.jpg", description: "Pull" },
]

describe("getWorkoutPlan", () => {
  it("returns Full Body for 3 days beginner bulking", () => {
    const plan = getWorkoutPlan(3, "bulking", "beginner", mockExercises)
    expect(plan.splitType).toBe("full_body")
    expect(plan.weeklySchedule).toHaveLength(3)
  })

  it("returns Upper/Lower for 4 days intermediate cutting", () => {
    const plan = getWorkoutPlan(4, "cutting", "intermediate", mockExercises)
    expect(plan.splitType).toBe("upper_lower")
    expect(plan.weeklySchedule).toHaveLength(4)
  })

  it("returns PPL for 6 days advanced lean_bulk", () => {
    const plan = getWorkoutPlan(6, "lean_bulk", "advanced", mockExercises)
    expect(plan.splitType).toBe("ppl")
    expect(plan.weeklySchedule).toHaveLength(6)
  })

  it("adjusts volume based on goal", () => {
    const bulking = getWorkoutPlan(3, "bulking", "beginner", mockExercises)
    const cutting = getWorkoutPlan(3, "cutting", "beginner", mockExercises)

    const bulkingSets = bulking.weeklySchedule[0].exercises[0].targetSets
    const cuttingSets = cutting.weeklySchedule[0].exercises[0].targetSets
    expect(bulkingSets).toBeGreaterThan(cuttingSets)
  })

  it("assigns exercises with valid properties", () => {
    const plan = getWorkoutPlan(4, "bulking", "intermediate", mockExercises)
    for (const day of plan.weeklySchedule) {
      for (const ex of day.exercises) {
        expect(ex.exercise.nameEn).toBeTruthy()
        expect(ex.targetSets).toBeGreaterThan(0)
        expect(ex.restSeconds).toBeGreaterThan(0)
      }
    }
  })

  it("uses correct day names", () => {
    const plan = getWorkoutPlan(5, "bulking", "advanced", mockExercises)
    expect(plan.weeklySchedule[0].dayName).toBe("Thứ 2")
    expect(plan.weeklySchedule[4].dayName).toBe("Thứ 6")
  })
})
