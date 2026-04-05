import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return NextResponse.json(
      { error: "Missing ElevenLabs configuration" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: { "xi-api-key": apiKey },
      }
    );

    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json(
        { error: "ElevenLabs API error", details: body },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to get signed URL", details: String(err) },
      { status: 500 }
    );
  }
}
