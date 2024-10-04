import OpenAI from "openai";

// Define types for the response object
interface Response {
  questionId: string;
  question: string;
  response: string;
}

// Define the structure for extracted info
interface ExtractedInfo {
  [question: string]: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//   Extracts key information from a list of responses using OpenAI's API

const systemPrompt = `
You are an AI assistant tasked with creating a personalized digital version of a user. Extract detailed information from the following responses, focusing on personality, work, hobbies, past experiences, and key personal and professional traits. The extracted insights will be used to build a profile that can have natural conversations with others about the user's life, personality, and background.Make sure the summary captures details that would make the user’s digital profile authentic and easy to engage with in conversation.

`;

export async function getKeyInfoFromResponse(
  responses: Response[]
): Promise<ExtractedInfo> {
  const extractedInfo: ExtractedInfo = {};

  const batchPrompt = responses
    .map(
      (response) =>
        `Q: "${response.question}"\nA: "${response.response}"\nSummarize the key insights.`
    )
    .join("\n\n");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: batchPrompt },
      ],
      max_tokens: 500, //reduced to save cost
    });
    const completionContent = completion.choices[0]?.message.content?.trim();

    if (completionContent) {
      // Assuming a simple split for extracting info from the batch completion
      const results = completionContent.split("\n\n");
      results.forEach((info, index) => {
        const questionId = responses[index].questionId;
        extractedInfo[questionId] = info.trim();
      });
    }
  } catch (error) {
    console.error(`Error processing batch responses:`, error);
  }

  return extractedInfo;
}

//   Generates follow-up questions based on user responses using OpenAI's API

export async function getFollowUpQuestions(
  responses: Response[]
): Promise<string[]> {
  const followUpQuestions: string[] = [];

  const batchPrompt = responses
    .map(
      (response) =>
        `Question: "${response.question}"\nResponse: "${response.response}"`
    )
    .join("\n\n");

  const prompt = `
Based on the user's responses, generate conversational, friendly, and engaging follow-up questions to dive deeper into their personality, hobbies, experiences, and professional life. The goal is to refine the user's digital profile, making it more interesting and natural for others to engage with. The questions should:

- Be light and open-ended to encourage detailed answers.
- Explore both personal and professional aspects of the user's life.
- Feel like they’re coming from a friend, using a warm and approachable tone.
${batchPrompt}
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 100, //limit to save cost
    });

    const followUp = completion.choices[0]?.message.content?.trim();

    if (followUp) {
      followUpQuestions.push(followUp);
    }
  } catch (error) {
    console.error(`Error generating follow-up question for response:`, error);
  }

  return followUpQuestions;
}
