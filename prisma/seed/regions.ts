import { PrismaClient } from "../../src/generated/prisma"

const regions = [
  { code: "northern", name: "Miền Bắc" },
  { code: "central", name: "Miền Trung" },
  { code: "southern", name: "Miền Nam" },
]

export async function seedRegions(prisma: PrismaClient) {
  for (const region of regions) {
    await prisma.region.upsert({
      where: { code: region.code },
      update: region,
      create: region,
    })
  }
  console.log(`✅ Seeded ${regions.length} regions`)
}
