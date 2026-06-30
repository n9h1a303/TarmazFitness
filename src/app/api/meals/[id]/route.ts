import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Vui lòng đăng nhập" } },
      { status: 401 }
    )
  }

  const { id } = await params

  const meal = await prisma.meal.findUnique({ where: { id } })
  if (!meal || meal.userId !== session.user.id) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Không tìm thấy bữa ăn" } },
      { status: 404 }
    )
  }

  await prisma.meal.delete({ where: { id } })

  return NextResponse.json({ data: { success: true } })
}
