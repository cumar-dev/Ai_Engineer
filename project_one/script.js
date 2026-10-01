import dotenv from "dotenv";
dotenv.config();
const summarizeText = async (text, length = "medium") => {
  const lengthInstructions = {
    short:
      "Summarize this text in 2-3 sentences. Keep only the most important points.",

    medium:
      "Summarize this text in one clear paragraph. Include the main ideas and important details.",

    long: "Provide a detailed summary. Include the main ideas, important details, and key explanations while avoiding unnecessary repetition.",
  };
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
          content: `${lengthInstructions[length]} Text to summarize it: ${text}`,
        },
      ],
      max_tokens: length === "short" ? 100 : length === "medium" ? 200 : 400,
    }),
  });
  const data = await response.json();
  console.log("summarized text geneartor: ", data.choices[0].message.content);
  return data.choices[0].message.content;
};

const textInformation = `
Artificial intelligence has transformed the way we interact with technology.
AI systems are now used in healthcare, education, finance, transportation,
and many other industries.

Machine learning is one of the most important areas of artificial
intelligence. It allows computers to learn patterns from data without
being explicitly programmed for every task. Deep learning is a subset
of machine learning that uses neural networks with many layers.

AI engineering focuses on turning AI models into real applications.
AI engineers work with APIs, databases, cloud services, software
development, model deployment, and monitoring.

As AI continues to develop, developers need to understand both the
technical and practical aspects of building reliable AI applications.
`;
const longSummary = await summarizeText(textInformation, "long");
console.log("long text", longSummary);

const mediumSummary = await summarizeText(textInformation, "medium");
console.log("medium text", mediumSummary);

const shortSummary = await summarizeText(textInformation, "short");
console.log("short text", shortSummary);