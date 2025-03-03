import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { audioContent, inputLang } = await req.json();

    // ✅ Check if required fields exist
    if (!audioContent || !inputLang) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.GOOGLE_SPEECH_TO_TEXT_API_KEY) {
      return NextResponse.json({ error: "API key is missing" }, { status: 401 });
    }

    // ✅ Google Speech-to-Text API request
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${process.env.GOOGLE_SPEECH_TO_TEXT_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config: {
            encoding: "WEBM_OPUS", // ✅ Ensure encoding matches the recorded audio
            sampleRateHertz: 48000, // ✅ Google expects 48000 Hz for WEBM_OPUS
            languageCode: inputLang,
            enableAutomaticPunctuation: true, // ✅ Improves output formatting
          },
          audio: {
            content: audioContent, // ✅ Base64-encoded audio data
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error.message }, { status: response.status });
    }

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ error: "No transcript received from Speech API" }, { status: 500 });
    }

    return NextResponse.json({ transcript: data.results[0].alternatives[0].transcript });
  } catch (error) {
    console.error("Speech-to-Text API error:", error);
    return NextResponse.json({ error: "Speech recognition failed" }, { status: 500 });
  }
}
