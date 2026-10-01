import dotenv from "dotenv";
dotenv.config();

const generateText = async (prompt) => {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
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
            content: prompt,
          },
        ],
        max_tokens: 150,
        // stream: true,
      }),
    },
  );

  const data = await response.json();
  console.log("data comes from the api", data);
  console.log("new fresh data", data.choices[0].message);
  return data.choices[0].message.content;
};

const result = await generateText(
  "Tell me what's different between Ai-Engineer and machine learning",
);

console.log(result);
