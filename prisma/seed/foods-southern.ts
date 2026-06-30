import { PrismaClient } from "../../src/generated/prisma"

const foods = [
  // === Cơm (Rice dishes) ===
  { nameVi: "Cơm tấm Sài Gòn", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 350, calories: 500, proteinG: 20, carbsG: 70, fatG: 15, mealTime: ["lunch", "dinner"] },
  { nameVi: "Cơm tấm bì chả", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 350, calories: 520, proteinG: 22, carbsG: 68, fatG: 18, mealTime: ["lunch", "dinner"] },
  { nameVi: "Cơm tấm sườn bì", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 400, calories: 580, proteinG: 28, carbsG: 72, fatG: 20, mealTime: ["lunch", "dinner"] },
  { nameVi: "Cơm chiên dương châu", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 300, calories: 450, proteinG: 12, carbsG: 55, fatG: 20, mealTime: ["lunch", "dinner"] },
  { nameVi: "Cơm chiên hải sản", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 300, calories: 420, proteinG: 18, carbsG: 50, fatG: 17, mealTime: ["lunch", "dinner"] },
  { nameVi: "Cơm gà Sài Gòn", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 350, calories: 480, proteinG: 25, carbsG: 60, fatG: 16, mealTime: ["lunch", "dinner"] },
  { nameVi: "Cơm sườn non", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 350, calories: 520, proteinG: 26, carbsG: 65, fatG: 18, mealTime: ["lunch", "dinner"] },
  { nameVi: "Cơm cá kho", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 350, calories: 450, proteinG: 24, carbsG: 58, fatG: 14, mealTime: ["lunch", "dinner"] },
  // === Hủ tiếu (Noodle soups) ===
  { nameVi: "Hủ tiếu Nam Vang", categorySlug: "main-dish", servingSize: "1 tô", servingGrams: 500, calories: 380, proteinG: 18, carbsG: 55, fatG: 8, mealTime: ["breakfast", "lunch"] },
  { nameVi: "Hủ tiếu sa tế", categorySlug: "main-dish", servingSize: "1 tô", servingGrams: 500, calories: 400, proteinG: 16, carbsG: 50, fatG: 15, mealTime: ["breakfast", "lunch"] },
  { nameVi: "Hủ tiếu bò kho", categorySlug: "main-dish", servingSize: "1 tô", servingGrams: 500, calories: 420, proteinG: 22, carbsG: 48, fatG: 16, mealTime: ["breakfast", "lunch"] },
  { nameVi: "Hủ tiếu mỹ tho", categorySlug: "main-dish", servingSize: "1 tô", servingGrams: 500, calories: 370, proteinG: 16, carbsG: 56, fatG: 8, mealTime: ["breakfast", "lunch"] },
  { nameVi: "Hủ tiếu khô", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 350, calories: 420, proteinG: 18, carbsG: 55, fatG: 15, mealTime: ["lunch", "dinner"] },
  { nameVi: "Hủ tiếu cá lóc", categorySlug: "main-dish", servingSize: "1 tô", servingGrams: 500, calories: 350, proteinG: 20, carbsG: 50, fatG: 7, mealTime: ["breakfast", "lunch"] },
  // === Bánh mì (Sandwiches) ===
  { nameVi: "Bánh mì Sài Gòn", categorySlug: "main-dish", servingSize: "1 ổ", servingGrams: 200, calories: 350, proteinG: 14, carbsG: 48, fatG: 12, mealTime: ["breakfast", "lunch"] },
  { nameVi: "Bánh mì thịt nướng", categorySlug: "main-dish", servingSize: "1 ổ", servingGrams: 220, calories: 420, proteinG: 20, carbsG: 50, fatG: 16, mealTime: ["breakfast", "lunch"] },
  { nameVi: "Bánh mì chả lụa", categorySlug: "main-dish", servingSize: "1 ổ", servingGrams: 200, calories: 380, proteinG: 16, carbsG: 48, fatG: 14, mealTime: ["breakfast", "lunch"] },
  { nameVi: "Bánh mì xíu mại", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 250, calories: 400, proteinG: 18, carbsG: 50, fatG: 14, mealTime: ["breakfast", "lunch"] },
  { nameVi: "Bánh mì bơ sữa", categorySlug: "main-dish", servingSize: "1 ổ", servingGrams: 150, calories: 320, proteinG: 6, carbsG: 40, fatG: 16, mealTime: ["breakfast", "snack"] },
  { nameVi: "Bánh mì ốp la", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 220, calories: 420, proteinG: 18, carbsG: 48, fatG: 18, mealTime: ["breakfast"] },
  // === Bún (Vermicelli) ===
  { nameVi: "Bún mắm", categorySlug: "main-dish", servingSize: "1 tô", servingGrams: 500, calories: 450, proteinG: 22, carbsG: 55, fatG: 16, mealTime: ["lunch", "dinner"] },
  { nameVi: "Bún mắm tôm", categorySlug: "main-dish", servingSize: "1 tô", servingGrams: 500, calories: 440, proteinG: 20, carbsG: 52, fatG: 17, mealTime: ["lunch", "dinner"] },
  { nameVi: "Bún thịt nướng Sài Gòn", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 400, calories: 480, proteinG: 22, carbsG: 56, fatG: 18, mealTime: ["lunch", "dinner"] },
  { nameVi: "Bún nước lèo", categorySlug: "main-dish", servingSize: "1 tô", servingGrams: 500, calories: 380, proteinG: 18, carbsG: 54, fatG: 8, mealTime: ["breakfast", "lunch"] },
  { nameVi: "Bún suông", categorySlug: "main-dish", servingSize: "1 tô", servingGrams: 500, calories: 350, proteinG: 16, carbsG: 52, fatG: 7, mealTime: ["breakfast", "lunch"] },
  { nameVi: "Bún xào", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 350, calories: 420, proteinG: 14, carbsG: 50, fatG: 18, mealTime: ["lunch", "dinner"] },
  // === Cá kho (Braised fish) ===
  { nameVi: "Cá kho tộ", categorySlug: "main-dish", servingSize: "1 phần", servingGrams: 200, calories: 320, proteinG: 28, carbsG: 8, fatG: 20, mealTime: ["lunch", "dinner"] },
  { nameVi: "Cá lóc kho tương", categorySlug: "main-dish", servingSize: "1 phần", servingGrams: 200, calories: 300, proteinG: 26, carbsG: 10, fatG: 18, mealTime: ["lunch", "dinner"] },
  { nameVi: "Cá basa kho lạt", categorySlug: "main-dish", servingSize: "1 phần", servingGrams: 200, calories: 350, proteinG: 24, carbsG: 6, fatG: 26, mealTime: ["lunch", "dinner"] },
  { nameVi: "Cá kèo kho tiêu", categorySlug: "main-dish", servingSize: "1 phần", servingGrams: 180, calories: 280, proteinG: 25, carbsG: 5, fatG: 18, mealTime: ["lunch", "dinner"] },
  { nameVi: "Cá hú kho", categorySlug: "main-dish", servingSize: "1 phần", servingGrams: 200, calories: 340, proteinG: 24, carbsG: 8, fatG: 24, mealTime: ["lunch", "dinner"] },
  // === Thịt kho (Braised pork) ===
  { nameVi: "Thịt kho tàu", categorySlug: "main-dish", servingSize: "1 phần", servingGrams: 200, calories: 380, proteinG: 22, carbsG: 12, fatG: 28, mealTime: ["lunch", "dinner"] },
  { nameVi: "Thịt kho hột vịt", categorySlug: "main-dish", servingSize: "1 phần", servingGrams: 250, calories: 420, proteinG: 26, carbsG: 10, fatG: 30, mealTime: ["lunch", "dinner"] },
  { nameVi: "Thịt ram", categorySlug: "main-dish", servingSize: "1 phần", servingGrams: 150, calories: 350, proteinG: 20, carbsG: 8, fatG: 27, mealTime: ["lunch", "dinner"] },
  { nameVi: "Sườn ram", categorySlug: "main-dish", servingSize: "1 phần", servingGrams: 200, calories: 380, proteinG: 22, carbsG: 10, fatG: 28, mealTime: ["lunch", "dinner"] },
  { nameVi: "Sườn nướng", categorySlug: "main-dish", servingSize: "1 phần", servingGrams: 200, calories: 350, proteinG: 28, carbsG: 12, fatG: 22, mealTime: ["lunch", "dinner"] },
  { nameVi: "Ba chỉ kho", categorySlug: "main-dish", servingSize: "1 phần", servingGrams: 150, calories: 420, proteinG: 18, carbsG: 6, fatG: 36, mealTime: ["lunch", "dinner"] },
  // === Canh (Soups) ===
  { nameVi: "Canh chua cá lóc", categorySlug: "side-dish", servingSize: "1 tô", servingGrams: 400, calories: 180, proteinG: 18, carbsG: 15, fatG: 5, mealTime: ["lunch", "dinner"] },
  { nameVi: "Canh chua tôm", categorySlug: "side-dish", servingSize: "1 tô", servingGrams: 350, calories: 150, proteinG: 14, carbsG: 12, fatG: 4, mealTime: ["lunch", "dinner"] },
  { nameVi: "Canh chua bông súng", categorySlug: "side-dish", servingSize: "1 tô", servingGrams: 350, calories: 100, proteinG: 6, carbsG: 14, fatG: 2, mealTime: ["lunch", "dinner"] },
  { nameVi: "Canh rau đay", categorySlug: "side-dish", servingSize: "1 tô", servingGrams: 300, calories: 80, proteinG: 4, carbsG: 12, fatG: 2, mealTime: ["lunch", "dinner"] },
  { nameVi: "Canh bầu tôm khô", categorySlug: "side-dish", servingSize: "1 tô", servingGrams: 350, calories: 110, proteinG: 8, carbsG: 12, fatG: 3, mealTime: ["lunch", "dinner"] },
  { nameVi: "Canh bí nấm", categorySlug: "side-dish", servingSize: "1 tô", servingGrams: 350, calories: 90, proteinG: 5, carbsG: 14, fatG: 2, mealTime: ["lunch", "dinner"] },
  // === Lẩu (Hotpot) ===
  { nameVi: "Lẩu mắm", categorySlug: "main-dish", servingSize: "1 phần", servingGrams: 600, calories: 480, proteinG: 28, carbsG: 35, fatG: 24, mealTime: ["dinner"] },
  { nameVi: "Lẩu thái hải sản", categorySlug: "main-dish", servingSize: "1 phần", servingGrams: 600, calories: 420, proteinG: 30, carbsG: 30, fatG: 20, mealTime: ["dinner"] },
  { nameVi: "Lẩu cá kèo", categorySlug: "main-dish", servingSize: "1 phần", servingGrams: 600, calories: 400, proteinG: 28, carbsG: 28, fatG: 20, mealTime: ["dinner"] },
  { nameVi: "Lẩu riêu cua đồng", categorySlug: "main-dish", servingSize: "1 phần", servingGrams: 600, calories: 380, proteinG: 24, carbsG: 32, fatG: 18, mealTime: ["dinner"] },
  { nameVi: "Lẩu gà lá giang", categorySlug: "main-dish", servingSize: "1 phần", servingGrams: 600, calories: 420, proteinG: 32, carbsG: 25, fatG: 22, mealTime: ["dinner"] },
  // === Bánh (Pancakes / Cakes) ===
  { nameVi: "Bánh xèo miền Nam", categorySlug: "main-dish", servingSize: "2 cái", servingGrams: 200, calories: 350, proteinG: 12, carbsG: 30, fatG: 20, mealTime: ["lunch", "dinner"] },
  { nameVi: "Bánh khọt", categorySlug: "snacks", servingSize: "10 cái", servingGrams: 150, calories: 280, proteinG: 8, carbsG: 25, fatG: 17, mealTime: ["snack"] },
  { nameVi: "Bánh căn", categorySlug: "snacks", servingSize: "8 cái", servingGrams: 120, calories: 220, proteinG: 6, carbsG: 20, fatG: 13, mealTime: ["snack"] },
  { nameVi: "Bánh hỏi lòng heo", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 250, calories: 380, proteinG: 20, carbsG: 35, fatG: 18, mealTime: ["lunch", "dinner"] },
  { nameVi: "Bánh ống", categorySlug: "snacks", servingSize: "5 cái", servingGrams: 100, calories: 180, proteinG: 4, carbsG: 28, fatG: 6, mealTime: ["snack"] },
  // === Gỏi cuốn & Chả giò (Spring rolls) ===
  { nameVi: "Gỏi cuốn tôm thịt", categorySlug: "snacks", servingSize: "2 cuốn", servingGrams: 100, calories: 180, proteinG: 12, carbsG: 20, fatG: 6, mealTime: ["snack", "lunch"] },
  { nameVi: "Gỏi cuốn chay", categorySlug: "snacks", servingSize: "2 cuốn", servingGrams: 100, calories: 140, proteinG: 5, carbsG: 22, fatG: 4, mealTime: ["snack", "lunch"] },
  { nameVi: "Chả giò Sài Gòn", categorySlug: "snacks", servingSize: "4 cuốn", servingGrams: 100, calories: 280, proteinG: 10, carbsG: 20, fatG: 18, mealTime: ["snack"] },
  { nameVi: "Chả giò hải sản", categorySlug: "snacks", servingSize: "4 cuốn", servingGrams: 100, calories: 260, proteinG: 12, carbsG: 18, fatG: 16, mealTime: ["snack"] },
  { nameVi: "Chả giò rế", categorySlug: "snacks", servingSize: "4 cuốn", servingGrams: 100, calories: 300, proteinG: 8, carbsG: 22, fatG: 20, mealTime: ["snack"] },
  // === Ốc & Nghêu (Shellfish) ===
  { nameVi: "Ốc len xào dừa", categorySlug: "snacks", servingSize: "1 dĩa", servingGrams: 200, calories: 250, proteinG: 18, carbsG: 12, fatG: 15, mealTime: ["snack", "dinner"] },
  { nameVi: "Ốc bươu hấp tiêu", categorySlug: "snacks", servingSize: "1 dĩa", servingGrams: 200, calories: 180, proteinG: 22, carbsG: 5, fatG: 8, mealTime: ["snack", "dinner"] },
  { nameVi: "Ốc giác nướng mỡ hành", categorySlug: "snacks", servingSize: "1 dĩa", servingGrams: 200, calories: 220, proteinG: 20, carbsG: 8, fatG: 13, mealTime: ["snack", "dinner"] },
  { nameVi: "Nghêu hấp sả", categorySlug: "snacks", servingSize: "1 dĩa", servingGrams: 300, calories: 150, proteinG: 22, carbsG: 6, fatG: 4, mealTime: ["snack", "dinner"] },
  // === Bò (Beef dishes) ===
  { nameVi: "Bò bía", categorySlug: "snacks", servingSize: "4 cuốn", servingGrams: 150, calories: 200, proteinG: 10, carbsG: 22, fatG: 8, mealTime: ["snack"] },
  { nameVi: "Bò lúc lắc", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 200, calories: 320, proteinG: 30, carbsG: 10, fatG: 18, mealTime: ["lunch", "dinner"] },
  { nameVi: "Bít tết Sài Gòn", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 300, calories: 450, proteinG: 35, carbsG: 25, fatG: 24, mealTime: ["breakfast", "lunch", "dinner"] },
  { nameVi: "Bò nướng sa tế", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 200, calories: 340, proteinG: 32, carbsG: 8, fatG: 20, mealTime: ["lunch", "dinner"] },
  // === Cua, Tôm, Mực (Seafood) ===
  { nameVi: "Cua rang muối", categorySlug: "main-dish", servingSize: "1 con", servingGrams: 200, calories: 280, proteinG: 24, carbsG: 6, fatG: 18, mealTime: ["lunch", "dinner"] },
  { nameVi: "Cua hấp bia", categorySlug: "main-dish", servingSize: "1 con", servingGrams: 300, calories: 200, proteinG: 30, carbsG: 4, fatG: 8, mealTime: ["lunch", "dinner"] },
  { nameVi: "Tôm sú nướng", categorySlug: "main-dish", servingSize: "10 con", servingGrams: 200, calories: 220, proteinG: 32, carbsG: 4, fatG: 8, mealTime: ["lunch", "dinner"] },
  { nameVi: "Mực nướng sa tế", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 200, calories: 240, proteinG: 28, carbsG: 6, fatG: 12, mealTime: ["lunch", "dinner"] },
  // === Rau (Vegetables) ===
  { nameVi: "Rau má đậu phộng", categorySlug: "side-dish", servingSize: "1 dĩa", servingGrams: 150, calories: 180, proteinG: 6, carbsG: 20, fatG: 9, mealTime: ["lunch", "dinner"] },
  { nameVi: "Rau muống xào tỏi", categorySlug: "side-dish", servingSize: "1 dĩa", servingGrams: 200, calories: 120, proteinG: 6, carbsG: 12, fatG: 6, mealTime: ["lunch", "dinner"] },
  { nameVi: "Bông súng mắm kho", categorySlug: "side-dish", servingSize: "1 dĩa", servingGrams: 150, calories: 100, proteinG: 5, carbsG: 10, fatG: 5, mealTime: ["lunch", "dinner"] },
  { nameVi: "Bí xào tôm", categorySlug: "side-dish", servingSize: "1 dĩa", servingGrams: 200, calories: 140, proteinG: 10, carbsG: 12, fatG: 6, mealTime: ["lunch", "dinner"] },
  // === Chè (Desserts) ===
  { nameVi: "Chè đậu trắng", categorySlug: "snacks", servingSize: "1 chén", servingGrams: 250, calories: 280, proteinG: 8, carbsG: 52, fatG: 5, mealTime: ["snack"] },
  { nameVi: "Chè bà ba", categorySlug: "snacks", servingSize: "1 chén", servingGrams: 250, calories: 300, proteinG: 6, carbsG: 55, fatG: 7, mealTime: ["snack"] },
  { nameVi: "Chè thập cẩm", categorySlug: "snacks", servingSize: "1 chén", servingGrams: 250, calories: 320, proteinG: 5, carbsG: 58, fatG: 8, mealTime: ["snack"] },
  { nameVi: "Chè bưởi", categorySlug: "snacks", servingSize: "1 chén", servingGrams: 250, calories: 260, proteinG: 4, carbsG: 50, fatG: 6, mealTime: ["snack"] },
  { nameVi: "Chè đậu đỏ bánh lọt", categorySlug: "snacks", servingSize: "1 chén", servingGrams: 250, calories: 290, proteinG: 7, carbsG: 54, fatG: 5, mealTime: ["snack"] },
  { nameVi: "Chè khúc bạch", categorySlug: "snacks", servingSize: "1 chén", servingGrams: 200, calories: 240, proteinG: 3, carbsG: 40, fatG: 8, mealTime: ["snack"] },
  // === Đồ uống (Drinks) ===
  { nameVi: "Sữa đậu nành", categorySlug: "drinks", servingSize: "1 ly", servingGrams: 250, calories: 120, proteinG: 6, carbsG: 14, fatG: 5, mealTime: ["breakfast", "snack"] },
  { nameVi: "Sữa bắp", categorySlug: "drinks", servingSize: "1 ly", servingGrams: 250, calories: 140, proteinG: 4, carbsG: 26, fatG: 3, mealTime: ["breakfast", "snack"] },
  { nameVi: "Nước mía", categorySlug: "drinks", servingSize: "1 ly", servingGrams: 250, calories: 120, proteinG: 0, carbsG: 30, fatG: 0, mealTime: ["snack"] },
  { nameVi: "Dừa tươi", categorySlug: "drinks", servingSize: "1 trái", servingGrams: 300, calories: 60, proteinG: 1, carbsG: 14, fatG: 1, mealTime: ["snack"] },
  { nameVi: "Sinh tố bơ", categorySlug: "drinks", servingSize: "1 ly", servingGrams: 300, calories: 320, proteinG: 4, carbsG: 30, fatG: 22, mealTime: ["breakfast", "snack"] },
  { nameVi: "Sinh tố mãng cầu", categorySlug: "drinks", servingSize: "1 ly", servingGrams: 300, calories: 280, proteinG: 3, carbsG: 38, fatG: 14, mealTime: ["breakfast", "snack"] },
  // === Cà phê & Trà (Coffee & Tea) ===
  { nameVi: "Cà phê sữa đá", categorySlug: "drinks", servingSize: "1 ly", servingGrams: 200, calories: 150, proteinG: 4, carbsG: 20, fatG: 6, mealTime: ["breakfast", "snack"] },
  { nameVi: "Bạc xỉu", categorySlug: "drinks", servingSize: "1 ly", servingGrams: 200, calories: 120, proteinG: 3, carbsG: 16, fatG: 5, mealTime: ["breakfast", "snack"] },
  { nameVi: "Cà phê đen đá", categorySlug: "drinks", servingSize: "1 ly", servingGrams: 200, calories: 5, proteinG: 0, carbsG: 1, fatG: 0, mealTime: ["breakfast", "snack"] },
  { nameVi: "Trà sữa trân châu", categorySlug: "drinks", servingSize: "1 ly", servingGrams: 350, calories: 280, proteinG: 3, carbsG: 50, fatG: 8, mealTime: ["snack"] },
  // === Gỏi (Salads) ===
  { nameVi: "Gỏi gà măng cụt", categorySlug: "side-dish", servingSize: "1 dĩa", servingGrams: 200, calories: 220, proteinG: 18, carbsG: 18, fatG: 9, mealTime: ["lunch", "dinner"] },
  { nameVi: "Gỏi xoài khô bò", categorySlug: "side-dish", servingSize: "1 dĩa", servingGrams: 150, calories: 200, proteinG: 12, carbsG: 22, fatG: 8, mealTime: ["snack"] },
  { nameVi: "Gỏi bò tái chanh", categorySlug: "side-dish", servingSize: "1 dĩa", servingGrams: 200, calories: 240, proteinG: 22, carbsG: 10, fatG: 12, mealTime: ["lunch", "dinner"] },
  { nameVi: "Gỏi sứa", categorySlug: "side-dish", servingSize: "1 dĩa", servingGrams: 150, calories: 120, proteinG: 10, carbsG: 8, fatG: 5, mealTime: ["snack"] },
  // === Snacking extras ===
  { nameVi: "Cơm cháy Sài Gòn", categorySlug: "snacks", servingSize: "1 dĩa", servingGrams: 100, calories: 380, proteinG: 6, carbsG: 55, fatG: 15, mealTime: ["snack"] },
  { nameVi: "Bánh tráng trộn", categorySlug: "snacks", servingSize: "1 dĩa", servingGrams: 150, calories: 280, proteinG: 6, carbsG: 35, fatG: 14, mealTime: ["snack"] },
  { nameVi: "Bánh tráng cuốn", categorySlug: "snacks", servingSize: "4 cuốn", servingGrams: 100, calories: 160, proteinG: 5, carbsG: 22, fatG: 6, mealTime: ["snack"] },
  { nameVi: "Phá lấu", categorySlug: "snacks", servingSize: "1 dĩa", servingGrams: 200, calories: 320, proteinG: 16, carbsG: 12, fatG: 24, mealTime: ["snack"] },
  { nameVi: "Bột chiên", categorySlug: "snacks", servingSize: "1 dĩa", servingGrams: 200, calories: 350, proteinG: 6, carbsG: 40, fatG: 19, mealTime: ["snack"] },
  { nameVi: "Xôi gấc", categorySlug: "main-dish", servingSize: "1 dĩa", servingGrams: 200, calories: 350, proteinG: 6, carbsG: 55, fatG: 12, mealTime: ["breakfast", "snack"] },
]

export async function seedFoodsSouthern(prisma: PrismaClient) {
  const region = await prisma.region.findUnique({ where: { code: "southern" } })
  if (!region) throw new Error("Southern region not found")

  for (const food of foods) {
    const category = await prisma.category.findUnique({ where: { slug: food.categorySlug } })
    if (!category) throw new Error(`Category ${food.categorySlug} not found`)

    await prisma.food.upsert({
      where: { id: food.nameVi },
      update: {
        nameVi: food.nameVi,
        regionId: region.id,
        categoryId: category.id,
        servingSize: food.servingSize,
        servingGrams: food.servingGrams,
        calories: food.calories,
        proteinG: food.proteinG,
        carbsG: food.carbsG,
        fatG: food.fatG,
        mealTime: food.mealTime,
        isVerified: false,
      },
      create: {
        id: food.nameVi,
        nameVi: food.nameVi,
        regionId: region.id,
        categoryId: category.id,
        servingSize: food.servingSize,
        servingGrams: food.servingGrams,
        calories: food.calories,
        proteinG: food.proteinG,
        carbsG: food.carbsG,
        fatG: food.fatG,
        mealTime: food.mealTime,
        isVerified: false,
      },
    })
  }
  console.log(`✅ Seeded ${foods.length} southern dishes`)
}
