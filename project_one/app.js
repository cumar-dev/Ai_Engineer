import dotenv from "dotenv";
dotenv.config();
const summarizeText = async (text) => {
  const response = await fetch(process.env.OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-ultra-550b-a55b:free",
      messages: [
        {
          role: "user",
          content: `Summarize the following text clearly and briefly: ${text}`,
        },
      ],
      max_tokens: 300,
    }),
  });
  const data = await response.json();
  console.log("Summary text info:", data.choices[0].message.content);

  return data.choices[0].message.content;
};

const result =
  await summarizeText(`Artificial Intelligence is a field of computer science that focuses on
creating systems capable of performing tasks that normally require human
intelligence. Machine learning is a subset of AI that allows systems to
learn patterns from data. AI engineering focuses on building, deploying,
and maintaining complete AI-powered applications using models, APIs,
databases, and other software systems.`);

console.log("summarized text", result);