import { NextRequest, NextResponse } from "next/server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load API key from environment
const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pdfURL, pageNo } = body;

    // Load PDF
    const pdfResponse = await fetch(pdfURL);
    const blob = await pdfResponse.blob();
    const loader = new PDFLoader(blob);
    const pageLevelDocs = await loader.load();
    const pagesAmt = pageLevelDocs.length;

    // Prepare prompt
    const prompt = `
Use the following context to summarize and generate 3 related questions.
Do not include the word "summary" in the response.

---------------
CONTEXT:
${pageLevelDocs[pageNo - 1].pageContent}
`;

    // Call Gemini model
    const model = genAI.getGenerativeModel({model: "gemini-2.5-flash-lite"});
    const result = await model.generateContent([{ text: prompt }]);

    const markdownText = result.response.text();

    // Return as Markdown
    return new NextResponse(markdownText, {
      status: 200,
      headers: { "Content-Type": "text/markdown" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
