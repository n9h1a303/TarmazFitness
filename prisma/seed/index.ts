import "dotenv/config"
import { PrismaClient } from "../../src/generated/prisma/client.js"
import { PrismaPg } from "@prisma/adapter-pg"
import { seedRegions } from "./regions"
import { seedCategories } from "./categories"
import { seedIngredients } from "./ingredients"
import { seedExercises } from "./exercises"
import { seedFoodsNorthern } from "./foods-northern"
import { seedFoodsCentral } from "./foods-central"
import { seedFoodsSouthern } from "./foods-southern"
import { seedFoodsMoreNorthern } from "./foods-more-northern"
import { seedFoodsMoreCentral } from "./foods-more-central"
import { seedFoodsMoreSouthern } from "./foods-more-southern"

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  console.log("🌱 Seeding database...")

  await seedRegions(prisma)
  await seedCategories(prisma)
  await seedIngredients(prisma)
  await seedExercises(prisma)
  await seedFoodsNorthern(prisma)
  await seedFoodsCentral(prisma)
  await seedFoodsSouthern(prisma)
  await seedFoodsMoreNorthern(prisma)
  await seedFoodsMoreCentral(prisma)
  await seedFoodsMoreSouthern(prisma)

  console.log("✅ Seed complete!")
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error("❌ Seed failed:", e)
  process.exit(1)
})
