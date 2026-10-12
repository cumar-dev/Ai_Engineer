import { openrouter } from "@openrouter/ai-sdk-provider";
import {
  convertToModelMessages,
  streamText,
  tool,
  UIMessage,
  stepCountIs,
} from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();
    if (!messages) {
      return NextResponse.json(
        {
          message: "please make a prompt as to help you",
        },
        {
          status: 400,
        },
      );
    }
    const result = streamText({
      model: openrouter("nvidia/nemotron-3-ultra-550b-a55b:free"),
      messages: await convertToModelMessages(messages),
      tools: {
        getWeather: tool({
          description:
            "Get the current weather for a city. use this tool when the user asks about weather",
          inputSchema: z.object({
            city: z.string().describe("the city name example Mogadisho"),
          }),
          execute: async ({ city }) => {
            const geoResponse = await fetch(
              `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
            );
            if (!geoResponse.ok) {
              throw new Error("could not find the name of city");
            }
            const geoData = await geoResponse.json();
            console.log("geo data", geoData);
            const place = geoData.results?.[0];
            if (!place) {
              return { error: `City "${city}" was not found.` };
            }

            const weatherResponse = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m&timezone=auto`,
            );

            if (!weatherResponse.ok) {
              throw new Error("Could not retrieve weather data.");
            }

            const weatherData = await weatherResponse.json();
            console.log("weather data", weatherData);
            return {
              city: place.name,
              country: place.country,
              temperature: weatherData.current.temperature_2m,
              feelsLike: weatherData.current.apparent_temperature,
              humidity: weatherData.current.relative_humidity_2m,
              windSpeed: weatherData.current.wind_speed_10m,
              unit: weatherData.current_units.temperature_2m,
            };
          },
        }),
      },
      stopWhen: stepCountIs(5)
    });
    console.log("result", result);
    console.log("result UI message", result.toUIMessageStreamResponse());
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("error from model", error);
    return NextResponse.json(
      {
        message: "server error",
      },
      {
        status: 500,
      },
    );
  }
}
