import { NextRequest, NextResponse } from "next/server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pdfURL, user, messageId, jobDesc } = body;

    // Load PDF
    const pdfResponse = await fetch(pdfURL);
    const blob = await pdfResponse.blob();
    const loader = new PDFLoader(blob);
    const pageLevelDocs = await loader.load();

    // Prepare the prompt
    const prompt = `Please provide a complete analysis of the resume in relation to the given job description. 
Identify which requirements are fulfilled and which are not in two different sections for detailed information. 
Additionally, offer suggestions to improve the resume based on the job description, and finally, showcase the total score out of 100 and also provide what keywords this resume needs for better ATS score. 
If a job description is not provided, please simply respond with "Please provide a job description."

---------------
JOB DESCRIPTION: ${jobDesc || "N/A"}
---------------
RESUME:
${pageLevelDocs[0].pageContent}
`;

    // Call Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([{ text: prompt }]);

    const markdownText = result.response.text();

    // Return as Markdown text
    return new NextResponse(markdownText, {
      status: 200,
      headers: { "Content-Type": "text/markdown" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
