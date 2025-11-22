import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { imageURL, prompt } = await request.json();

    // Create Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    // Create model instance
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    // Fetch & encode image
    const imageResponse = await fetch(imageURL);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    // Generate markdown content
    const result = await model.generateContent([
      {
        text:
          (prompt || "Describe this image") +
          "\n\nFormat the response in **clean Markdown**, with headings and bullet points.",
      },
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/png",
        },
      },
    ]);

    const markdownText = result.response.text();

    return new NextResponse(markdownText, {
      status: 200,
      headers: { "Content-Type": "text/markdown" },
    });
  } catch (error: any) {
    console.error(error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
