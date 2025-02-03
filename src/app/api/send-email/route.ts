import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { to, subject, text } = await req.json()

  try {
    const data = await resend.emails.send({
      from: "585 Cafe <orders@yourdomain.com>",
      to,
      subject,
      text,
    })

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error })
  }
}

