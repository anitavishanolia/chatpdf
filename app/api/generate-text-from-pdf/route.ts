import { NextRequest, NextResponse } from "next/server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { OpenAIStream, StreamingTextResponse } from "ai"; // You can keep StreamingTextResponse or write custom streaming


const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pdfURL, message, pageNo, user, messageId } = body;

    // Load PDF
    const pdfResponse = await fetch(pdfURL);
    const blob = await pdfResponse.blob();
    const loader = new PDFLoader(blob);
    const pageLevelDocs = await loader.load();
    console.dir(pageLevelDocs);

    // Load previous messages from Firestore
    const messageRef = collection(db, `${user?.email}/files/pdf/${messageId}/chats`);
    const q = query(messageRef, orderBy("timestamp", "desc"), limit(5));
    const querySnapshot = await getDocs(q);

    const prevMessages: any[] = [];
    querySnapshot.forEach((doc: any) => {
      prevMessages.push({ id: doc.id, ...doc.data() });
    });

    const formattedPrevMessages = prevMessages?.map((msg: any) => ({
      role: msg.sender ? "user" as const : "assistant" as const,
      content: msg.text,
    }));

    // Combine context for AI
    const prompt = `
Use the following pieces of context (or previous conversation if needed) to answer the user's question in **Markdown format**.

PREVIOUS CONVERSATION:
${formattedPrevMessages.map((m: any) => m.role === "user" ? `User: ${m.content}` : `Assistant: ${m.content}`).join("\n")}

CONTEXT (from PDF page ${pageNo}):
${pageLevelDocs[pageNo - 1].pageContent}

USER INPUT:
${message}
`;

    // Call Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([{ text: prompt }]);

    const markdownText = result.response.text();

    // Return as streaming response (or plain text)
    return new NextResponse(markdownText, {
      status: 200,
      headers: { "Content-Type": "text/markdown" },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
