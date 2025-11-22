import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code } = body;

    const prompt = `
Use the following code and provide a plagiarism-free version in the same programming language. 
Do not change the logic; only rename functions and variables to make it unique.
---------------
Given code:
${code}
`;

  
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite"});
    const result = await model.generateContent([{ text: prompt }]);

    const newCode = result.response.text();

  
    return new NextResponse(newCode, {
      status: 200,
      headers: { "Content-Type": "text/markdown" },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
