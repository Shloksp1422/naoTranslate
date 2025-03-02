import { Console } from "console";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, inputLang, outputLang } = await req.json();

    if (!text || !inputLang || !outputLang) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
    //   return NextResponse.json({ error: "API key is missing" }, { status: 401 });
    // }

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=AIzaSyCNUvmznkOXWqe6D5KIMrHKesL4k_sssiA`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: text,
          source: inputLang,
          target: outputLang,
          format: "text",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error.message }, { status: response.status });
    }

    return NextResponse.json({ translation: data.data.translations[0].translatedText });
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
