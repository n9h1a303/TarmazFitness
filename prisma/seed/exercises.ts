import { PrismaClient } from "../../src/generated/prisma"

const exercises = [
  { nameEn: "Bench Press", nameVi: "Nằm đẩy tạ", targetMuscle: "Chest", category: "compound", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400", description: "Đẩy tạ từ ngực lên, khuỷu tay vuông góc thân người" },
  { nameEn: "Incline Bench Press", nameVi: "Đẩy tạ dốc", targetMuscle: "Chest", category: "compound", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400", description: "Ghế nghiêng 30-45 độ, tập trung vào phần ngực trên" },
  { nameEn: "Dumbbell Fly", nameVi: "Mở tạ đơn", targetMuscle: "Chest", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=400", description: "Mở rộng tay với tạ đơn, căng cơ ngực tối đa" },
  { nameEn: "Push-up", nameVi: "Chống đẩy", targetMuscle: "Chest", category: "compound", imageUrl: "https://images.unsplash.com/photo-1598971639058-9999005c3e9a?w=400", description: "Giữ thân thẳng, hạ thấp ngực xuống sàn" },
  { nameEn: "Overhead Press", nameVi: "Đẩy tạ trên đầu", targetMuscle: "Shoulders", category: "compound", imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400", description: "Đẩy tạ từ vai lên cao quá đầu" },
  { nameEn: "Lateral Raise", nameVi: "Ngang vai", targetMuscle: "Shoulders", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1581126543851-6b8c8b0f28cf?w=400", description: "Nâng tạ sang ngang, tập trung vào cầu vai" },
  { nameEn: "Front Raise", nameVi: "Nâng tạ trước", targetMuscle: "Shoulders", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a4?w=400", description: "Nâng tạ lên trước mặt, vai trái" },
  { nameEn: "Face Pull", nameVi: "Kéo mặt", targetMuscle: "Shoulders", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1540497070302-7c3f5f5239b7?w=400", description: "Kéo cáp về phía mặt, tập vai sau" },
  { nameEn: "Barbell Row", nameVi: "Hàng tạ đòn", targetMuscle: "Back", category: "compound", imageUrl: "https://images.unsplash.com/photo-1580974852861-c3810a2b8b1b?w=400", description: "Cúi người kéo tạ vào bụng, tập lưng giữa" },
  { nameEn: "Pull-ups", nameVi: "Kéo xà", targetMuscle: "Back", category: "compound", imageUrl: "https://images.unsplash.com/photo-1598971639058-9999005c3e9a?w=400", description: "Kéo người lên xà, tay rộng hơn vai" },
  { nameEn: "Lat Pulldown", nameVi: "Kéo xô", targetMuscle: "Back", category: "compound", imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400", description: "Kéo cáp từ trên xuống, tập xô" },
  { nameEn: "Cable Row", nameVi: "Kéo cáp ngồi", targetMuscle: "Back", category: "compound", imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400", description: "Kéo cáp ngang ngực, tập lưng dày" },
  { nameEn: "Deadlift", nameVi: "Kéo tạ chết", targetMuscle: "Back", category: "compound", imageUrl: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400", description: "Nhấc tạ từ sàn, giữ lưng thẳng, tập toàn thân" },
  { nameEn: "Romanian Deadlift", nameVi: "Kéo tạ romania", targetMuscle: "Back", category: "compound", imageUrl: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=400", description: "Gập hông đẩy tạ xuống, tập gân kheo và lưng dưới" },
  { nameEn: "Squat", nameVi: "Ngồi xổm", targetMuscle: "Legs", category: "compound", imageUrl: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400", description: "Hạ thấp người với tạ đòn trên vai, giữ lưng thẳng" },
  { nameEn: "Leg Press", nameVi: "Đạp chân", targetMuscle: "Legs", category: "compound", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400", description: "Đẩy tạ bằng chân trên máy đạp" },
  { nameEn: "Walking Lunge", nameVi: "Bước chân", targetMuscle: "Legs", category: "compound", imageUrl: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400", description: "Bước dài từng chân, hạ gối vuông góc" },
  { nameEn: "Leg Curl", nameVi: "Cuốn chân", targetMuscle: "Legs", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400", description: "Gập chân vào mông, tập gân kheo" },
  { nameEn: "Leg Extension", nameVi: "Đạp chân duỗi", targetMuscle: "Legs", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400", description: "Duỗi thẳng chân, tập cơ tứ đầu" },
  { nameEn: "Calf Raise", nameVi: "Nhón gót", targetMuscle: "Legs", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400", description: "Nhón gót chân lên cao, tập bắp chân" },
  { nameEn: "Hip Thrust", nameVi: "Nâng hông", targetMuscle: "Legs", category: "compound", imageUrl: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400", description: "Đẩy hông lên cao, tập mông" },
  { nameEn: "Bulgarian Split Squat", nameVi: "Squat một chân", targetMuscle: "Legs", category: "compound", imageUrl: "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=400", description: "Một chân trên ghế, ngồi xuống với chân kia" },
  { nameEn: "Barbell Curl", nameVi: "Cuốn tạ đòn", targetMuscle: "Arms", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400", description: "Cuốn tạ đòn lên, tập tay trước" },
  { nameEn: "Dumbbell Curl", nameVi: "Cuốn tạ đơn", targetMuscle: "Arms", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400", description: "Cuốn tạ đơn từng tay, tập tay trước" },
  { nameEn: "Hammer Curl", nameVi: "Cuốn búa", targetMuscle: "Arms", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400", description: "Cuốn tạ với lòng bàn tay hướng vào, tập brachialis" },
  { nameEn: "Triceps Pushdown", nameVi: "Kéo cáp tay sau", targetMuscle: "Arms", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400", description: "Đẩy cáp xuống, tập tay sau" },
  { nameEn: "Skull Crusher", nameVi: "Đập đầu lâu", targetMuscle: "Arms", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400", description: "Nằm đẩy tạ từ trán xuống, tập tay sau" },
  { nameEn: "Triceps Overhead Extension", nameVi: "Đẩy tạ sau đầu", targetMuscle: "Arms", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=400", description: "Đẩy tạ từ sau đầu lên, tập tay sau" },
  { nameEn: "Dips", nameVi: "Nhúng xà", targetMuscle: "Arms", category: "compound", imageUrl: "https://images.unsplash.com/photo-1598971639058-9999005c3e9a?w=400", description: "Hạ thấp người trên xà kép" },
  { nameEn: "Plank", nameVi: "Tấm ván", targetMuscle: "Core", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400", description: "Giữ thân thẳng trên khuỷu tay, siết core" },
  { nameEn: "Cable Crunch", nameVi: "Gập bụng cáp", targetMuscle: "Core", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400", description: "Kéo cáp từ trên xuống, gập người" },
  { nameEn: "Russian Twist", nameVi: "Xoay người", targetMuscle: "Core", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400", description: "Ngồi xoay người sang hai bên" },
  { nameEn: "Hanging Leg Raise", nameVi: "Nâng chân treo", targetMuscle: "Core", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400", description: "Treo xà nâng chân lên, tập bụng dưới" },
  { nameEn: "Dumbbell Shoulder Press", nameVi: "Đẩy vai tạ đơn", targetMuscle: "Shoulders", category: "compound", imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400", description: "Đẩy tạ đơn từ vai lên cao" },
  { nameEn: "Arnold Press", nameVi: "Đẩy Arnold", targetMuscle: "Shoulders", category: "compound", imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400", description: "Xoay tạ từ trước mặt sang hai bên khi đẩy lên" },
  { nameEn: "Seated Cable Row", nameVi: "Kéo cáp ngồi", targetMuscle: "Back", category: "compound", imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400", description: "Ngồi kéo cáp ngang, siết lưng giữa" },
  { nameEn: "T-Bar Row", nameVi: "Hàng T-Bar", targetMuscle: "Back", category: "compound", imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400", description: "Kéo tạ T-bar, tập lưng giữa và lưng dưới" },
  { nameEn: "Reverse Fly", nameVi: "Mở cáp sau", targetMuscle: "Shoulders", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1540497070302-7c3f5f5239b7?w=400", description: "Mở cáp ngược ra sau, tập vai sau" },
  { nameEn: "Preacher Curl", nameVi: "Cuốn tạ trên ghế", targetMuscle: "Arms", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400", description: "Cuốn tạ trên ghế preacher, tập tay trước" },
  { nameEn: "Concentration Curl", nameVi: "Cuốn tập trung", targetMuscle: "Arms", category: "isolation", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400", description: "Cuốn tạ ngồi, khuỷu tay đùi trong" },
  { nameEn: "Farmers Walk", nameVi: "Đi tạ", targetMuscle: "Full Body", category: "compound", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400", description: "Đi bộ cầm tạ nặng hai bên, tập grip và core" },
]

export async function seedExercises(prisma: PrismaClient) {
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { id: exercise.nameEn },
      update: exercise,
      create: {
        id: exercise.nameEn,
        ...exercise,
      },
    })
  }
  console.log(`✅ Seeded ${exercises.length} exercises`)
}
