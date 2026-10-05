import dotenv from "dotenv";
import { writeFile } from "node:fs/promises";
dotenv.config();
const generateTTS = async (text) => {
  const response = await fetch(process.env.OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "fish-audio/s2.1-pro-free:free",
      input: text,
      // voice: "nova",
      response_format: "mp3",
    }),
  });
  if (!response.ok) {
    throw new Error(`TTS failed: ${response.status} ${await response.text()}`);
  }
  const contentType = response.headers.get("content-type");

  console.log("Content-Type:", contentType);

  const audioBuffer = Buffer.from(await response.arrayBuffer());

  await writeFile("output.mp3", audioBuffer);

  const generationId = response.headers.get("x-generation-id");

  console.log("Generation ID:", generationId);
  console.log("Audio saved: output.mp3");
};

await generateTTS(
  "Hello this is my first time testing text to speech using fish model",
);
