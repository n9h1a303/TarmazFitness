import type { Goal, ExperienceLevel, ExerciseLibraryItem, WorkoutPlanOutput, WorkoutPlanDay, SplitType } from "@/types"

interface VolumeConfig {
  setsModifier: number
  reps: string
  rest: number
}

const VOLUME_MAP: Record<Goal, VolumeConfig> = {
  bulking: { setsModifier: 0, reps: "8-12", rest: 90 },
  lean_bulk: { setsModifier: -1, reps: "8-12", rest: 75 },
  cutting: { setsModifier: -2, reps: "12-15", rest: 45 },
}

type SplitSelection = Record<number, Record<string, SplitType>>

const SPLIT_SELECTION: SplitSelection = {
  2: { beginner: "full_body", intermediate: "full_body", advanced: "upper_lower" },
  3: { beginner: "full_body", intermediate: "full_body", advanced: "upper_lower" },
  4: { beginner: "full_body", intermediate: "upper_lower", advanced: "upper_lower" },
  5: { beginner: "full_body", intermediate: "ppl_ul", advanced: "ppl_ul" },
  6: { beginner: "full_body", intermediate: "ppl", advanced: "ppl" },
  7: { beginner: "full_body", intermediate: "ppl_ul", advanced: "ppl_ul" },
}

interface ExerciseTemplate {
  nameEn: string
  targetSets: number
  targetReps: string
  restSeconds: number
  sortOrder: number
}

interface DayTemplate {
  focus: string
  focusEn: string
  exercises: string[]  // exercise nameEn references
}

const SPLIT_TEMPLATES: Record<SplitType, DayTemplate[]> = {
  full_body: [
    {
      focus: "Toàn thân A",
      focusEn: "Full Body A",
      exercises: ["Squat", "Bench Press", "Barbell Row", "Overhead Press", "Romanian Deadlift", "Plank"],
    },
    {
      focus: "Toàn thân B",
      focusEn: "Full Body B",
      exercises: ["Deadlift", "Incline Bench Press", "Pull-ups", "Dumbbell Shoulder Press", "Walking Lunge", "Cable Crunch"],
    },
    {
      focus: "Toàn thân C",
      focusEn: "Full Body C",
      exercises: ["Leg Press", "Dumbbell Fly", "Lat Pulldown", "Lateral Raise", "Leg Curl", "Hanging Leg Raise"],
    },
  ],
  upper_lower: [
    {
      focus: "Thân trên A",
      focusEn: "Upper A",
      exercises: ["Bench Press", "Barbell Row", "Overhead Press", "Pull-ups", "Triceps Pushdown", "Barbell Curl"],
    },
    {
      focus: "Thân dưới A",
      focusEn: "Lower A",
      exercises: ["Squat", "Romanian Deadlift", "Walking Lunge", "Calf Raise", "Leg Curl", "Leg Extension"],
    },
    {
      focus: "Thân trên B",
      focusEn: "Upper B",
      exercises: ["Incline Bench Press", "Cable Row", "Dumbbell Shoulder Press", "Face Pull", "Dips", "Hammer Curl"],
    },
    {
      focus: "Thân dưới B",
      focusEn: "Lower B",
      exercises: ["Deadlift", "Leg Press", "Bulgarian Split Squat", "Hip Thrust", "Calf Raise", "Plank"],
    },
  ],
  ppl: [
    {
      focus: "Push",
      focusEn: "Push",
      exercises: ["Bench Press", "Incline Bench Press", "Overhead Press", "Lateral Raise", "Triceps Pushdown", "Skull Crusher"],
    },
    {
      focus: "Pull",
      focusEn: "Pull",
      exercises: ["Deadlift", "Pull-ups", "Barbell Row", "Cable Row", "Barbell Curl", "Face Pull"],
    },
    {
      focus: "Legs",
      focusEn: "Legs",
      exercises: ["Squat", "Romanian Deadlift", "Walking Lunge", "Calf Raise", "Leg Curl", "Leg Extension"],
    },
    {
      focus: "Push",
      focusEn: "Push",
      exercises: ["Dumbbell Press", "Arnold Press", "Dips", "Front Raise", "Triceps Overhead Extension", "Reverse Fly"],
    },
    {
      focus: "Pull",
      focusEn: "Pull",
      exercises: ["Lat Pulldown", "T-Bar Row", "Face Pull", "Preacher Curl", "Concentration Curl", "Shrug"],
    },
    {
      focus: "Legs",
      focusEn: "Legs",
      exercises: ["Leg Press", "Bulgarian Split Squat", "Hip Thrust", "Leg Curl", "Leg Extension", "Calf Raise"],
    },
  ],
  ppl_ul: [
    {
      focus: "Push",
      focusEn: "Push",
      exercises: ["Bench Press", "Overhead Press", "Incline Bench Press", "Lateral Raise", "Triceps Pushdown", "Skull Crusher"],
    },
    {
      focus: "Pull",
      focusEn: "Pull",
      exercises: ["Deadlift", "Pull-ups", "Barbell Row", "Face Pull", "Barbell Curl", "Hammer Curl"],
    },
    {
      focus: "Legs",
      focusEn: "Legs",
      exercises: ["Squat", "Romanian Deadlift", "Leg Press", "Calf Raise", "Leg Curl", "Leg Extension"],
    },
    {
      focus: "Thân trên",
      focusEn: "Upper",
      exercises: ["Dumbbell Press", "Cable Row", "Arnold Press", "Dips", "Preacher Curl", "Triceps Overhead Extension"],
    },
    {
      focus: "Thân dưới",
      focusEn: "Lower",
      exercises: ["Deadlift", "Bulgarian Split Squat", "Hip Thrust", "Walking Lunge", "Leg Curl", "Calf Raise"],
    },
  ],
}

const DAY_NAMES = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"]

function getSplitType(daysPerWeek: number, experienceLevel: ExperienceLevel): SplitType {
  return SPLIT_SELECTION[daysPerWeek]?.[experienceLevel] ?? "full_body"
}

function getVolumeConfig(goal: Goal): VolumeConfig {
  return VOLUME_MAP[goal]
}

function getSplitName(splitType: SplitType): string {
  const names: Record<SplitType, string> = {
    full_body: "Toàn thân",
    upper_lower: "Upper / Lower",
    ppl: "PPL (Push / Pull / Legs)",
    ppl_ul: "PPL + Upper / Lower",
  }
  return names[splitType]
}

function getVolumeNote(goal: Goal, experienceLevel: ExperienceLevel): string {
  if (goal === "bulking") return "Tập trung compound, tăng dần tạ"
  if (goal === "cutting") return "Giữ intensity, giảm rest time, tăng reps"
  return "Cân bằng compound và isolation"
}

export function getWorkoutPlan(
  daysPerWeek: number,
  goal: Goal,
  experienceLevel: ExperienceLevel,
  exerciseLibrary: ExerciseLibraryItem[]
): WorkoutPlanOutput {
  const splitType = getSplitType(daysPerWeek, experienceLevel)
  const volumeConfig = getVolumeConfig(goal)
  const templates = SPLIT_TEMPLATES[splitType]
  const exerciseMap = new Map(exerciseLibrary.map((e) => [e.nameEn, e]))

  const weeklySchedule: WorkoutPlanDay[] = []

  for (let i = 0; i < daysPerWeek; i++) {
    const template = templates[i % templates.length]
    const baseSets = 3 + volumeConfig.setsModifier
    const setsPerExercise = Math.max(2, baseSets)

    const exercises = template.exercises.map((nameEn, idx) => {
      const exercise = exerciseMap.get(nameEn)
      if (!exercise) return null

      return {
        exercise,
        targetSets: setsPerExercise,
        targetReps: volumeConfig.reps,
        restSeconds: volumeConfig.rest,
        sortOrder: idx + 1,
      }
    }).filter((e): e is NonNullable<typeof e> => e !== null)

    weeklySchedule.push({
      id: `day-${i}`,
      dayIndex: i,
      dayName: DAY_NAMES[i] ?? `Ngày ${i + 1}`,
      focus: template.focus,
      focusEn: template.focusEn,
      exercises,
    })
  }

  return {
    id: "plan-1",
    splitType,
    splitName: getSplitName(splitType),
    daysPerWeek,
    goal,
    experienceLevel,
    weeklySchedule,
    volumeNote: getVolumeNote(goal, experienceLevel),
  }
}
