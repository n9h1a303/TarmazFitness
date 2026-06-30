import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { HistoryClient } from "./client"

export const dynamic = "force-dynamic"

export default async function HistoryPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.hasOnboarded) redirect("/onboarding")

  return <HistoryClient />
}
