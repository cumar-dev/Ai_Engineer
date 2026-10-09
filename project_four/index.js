import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
const openai = new OpenAI();
async function STT() {
  const transcription = await openai.audio.transcriptions.create({
    model: "gpt-transcribe",
    file: fs.createReadStream("output.mp3"),
  });
  console.log(transcription.text);
}

STT();
