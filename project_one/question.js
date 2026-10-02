import dotenv from "dotenv";

dotenv.config();

const answerQuestion = async (context, question) => {
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
          role: "system",
          content:
            "You are a helpful assistant that answers questions based on the provided context. If the answer is not in the context, say so.",
        },
        {
          role: "user",
          content: `Context: ${context}

         Question: ${question}`,
        },
      ],

      max_tokens: 200,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "OpenRouter request failed");
  }

  return data.choices[0].message.content;
};

const context = `
JavaScript is a programming language that enables interactive web pages.
It was created by Brendan Eich in 1995. JavaScript is used for both
frontend and backend development with Node.js.
`;

const answer = await answerQuestion(
  context,
  "Who created JavaScript? and what is used for ?",
);

console.log("Answer:", answer);
