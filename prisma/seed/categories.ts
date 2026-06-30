import { PrismaClient } from "../../src/generated/prisma"

const categories = [
  { slug: "main-dish", name: "Món chính" },
  { slug: "side-dish", name: "Món phụ" },
  { slug: "drinks", name: "Đồ uống" },
  { slug: "snacks", name: "Ăn nhẹ" },
]

export async function seedCategories(prisma: PrismaClient) {
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    })
  }
  console.log(`✅ Seeded ${categories.length} categories`)
}
