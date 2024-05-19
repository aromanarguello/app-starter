import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const getCompletion = async (prompt: any) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: prompt,
  });

  return completion.choices[0].message.content;
};
