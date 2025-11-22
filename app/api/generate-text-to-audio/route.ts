import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { openai } from "@/lib/openai";
export const runtime = "nodejs";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, email } = body;

    if (!text || !email)
      return NextResponse.json({ error: "Missing text or email" }, { status: 400 });

    const mp3: any = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    // Convert to buffer safely
    const buffer = Buffer.from(await mp3.arrayBuffer?.() ?? mp3.data);

    const fileName = new Date().toISOString();
    const audioRef = ref(storage, `/files/audios/${email}-${fileName}.mp3`);
    await uploadBytes(audioRef, buffer);

    const downloadURL = await getDownloadURL(audioRef);

    return NextResponse.json({ src: downloadURL });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
