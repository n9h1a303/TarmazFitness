import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { RegisterSchema } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = RegisterSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Dữ liệu không hợp lệ", details: parsed.error.flatten() } },
        { status: 422 }
      )
    }

    const { email, password, name, phone } = parsed.data

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "Email đã được sử dụng" } },
        { status: 409 }
      )
    }

    if (phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone } })
      if (existingPhone) {
        return NextResponse.json(
          { error: { code: "CONFLICT", message: "Số điện thoại đã được sử dụng" } },
          { status: 409 }
        )
      }
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone: phone || null,
      },
    })

    return NextResponse.json(
      {
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
          },
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Có lỗi xảy ra" } },
      { status: 500 }
    )
  }
}
