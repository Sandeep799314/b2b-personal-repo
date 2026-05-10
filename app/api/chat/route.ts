import { NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/server-auth"

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json()
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "Groq API key not configured" },
        { status: 500 }
      )
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a helpful travel assistant for Trav Platforms. You help users build itineraries, find hotels, and plan trips. Keep your responses concise and professional."
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Groq API error:", data)
      return NextResponse.json(
        { error: data.error?.message || "Failed to get response from AI" },
        { status: response.status }
      )
    }

    return NextResponse.json({
      content: data.choices[0].message.content
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
