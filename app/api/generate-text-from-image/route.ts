import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { imageURL, prompt } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Fetch and encode image
    const imageResponse = await fetch(imageURL);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString("base64");

    // Ask AI to respond in Markdown format
    const result = await model.generateContent([
      {
        text: (prompt || "Describe this image") + 
          "\n\nFormat the response in **clean Markdown**, with headings, bullet points, and short paragraphs."
      },
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/png",
        },
      },
    ]);

    // Extract Markdown text
    const markdownText = result.response.text();

    // Return as plain text with correct content type
    return new NextResponse(markdownText, {
      status: 200,
      headers: { "Content-Type": "text/markdown" },
    });
  } catch (error: any) {
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
