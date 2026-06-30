import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { WorkoutClient } from "./client"

export const dynamic = "force-dynamic"

export default async function WorkoutPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.hasOnboarded) redirect("/onboarding")

  return <WorkoutClient userId={user.id} />
}
