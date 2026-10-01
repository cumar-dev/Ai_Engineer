import dotenv from "dotenv";

dotenv.config();

const generateText = async (prompt) => {
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
          content: prompt,
        },
      ],

      max_tokens: 500,
      stream: true,
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    const chunk = decoder.decode(value, { stream: true });

    const lines = chunk.split("\n");

    for (const line of lines) {
      if (!line.startsWith("data: ")) {
        continue;
      }

      const data = line.slice(6);

      if (data === "[DONE]") {
        continue;
      }

      const json = JSON.parse(data);

      const content = json.choices[0]?.delta?.content;

      if (content) {
        process.stdout.write(content);
      }
    }
  }
};

await generateText(
  "Tell me what's different between AI Engineering and machine learning",
);