import { NextResponse } from 'next/server'
import { prisma } from '@/utils/prismaClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  console.log(session)

  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
      },
    })

    return NextResponse.json({ bookings }, { status: 200 })
  } catch (error) {
    return NextResponse.json(`Error: ${error}`, { status: 500 })
  }
}

export async function POST(request: Request) {
  // get user from session
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json(`Error: Not logged in`, { status: 401 })
  }
  console.log(session)
  console.log(session.user)
  console.log(session.user.email)

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
  })

  if (!user?.id) {
    return NextResponse.json(`Error: User not found`, { status: 401 })
  }

  const body = await request.json()
  console.log(body)

  const checkin = new Date(body.checkin)
  const checkout = new Date(body.checkout)

  try {
    // create booking
    const bookingPrisma = await prisma.booking.create({
      data: {
        ...body,
        checkin: checkin,
        checkout: checkout,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    const booking = JSON.parse(JSON.stringify(bookingPrisma))

    console.log(booking)

    return NextResponse.json({ booking }, { status: 200 })
  } catch (error) {
    return NextResponse.json(`Error: ${error}`, { status: 500 })
  }
}
