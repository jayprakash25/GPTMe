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

const systemPrompt = `
You are an AI assistant tasked with creating a personalized digital version of a user. Extract detailed information from the following responses, focusing on personality, work, hobbies, past experiences, and key personal and professional traits. The extracted insights will be used to build a profile that can have natural conversations with others about the user's life, personality, and background. Make sure the summary captures details that would make the user's digital profile authentic and easy to engage with in conversation.
`;

export async function getKeyInfoFromResponse(
  responses: Response[]
): Promise<ExtractedInfo> {
  return await processResponses(responses);
}

// export async function getKeyInfoFromFollowUpResponses(
//   responses: Response[]
// ): Promise<ExtractedInfo> {
//   return await processResponses(responses, "followUp");
// }

async function processResponses(
  responses: Response[],
  // type: "initial" | "followUp"
): Promise<ExtractedInfo> {
  const extractedInfo: ExtractedInfo = {};

  const batchPrompt = responses
    .map(
      (response) =>
        `Q: "${response.question}"\nA: "${response.response}"\nSummarize the key insights.`
    )
    .join("\n\n");

  const prompt = `
Extract and summarize key information from the following responses:

${batchPrompt}

Provide a concise summary for each response, focusing on details that would make the user's digital profile more authentic and engaging.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
    });
    const completionContent = completion.choices[0]?.message.content?.trim();

    if (completionContent) {
      const results = completionContent.split("\n\n");
      
      results.forEach((info, index) => {
        const question = responses[index]?.question;
        if (question) {
          extractedInfo[question] = info.trim(); // Store the info using the question as the key
        } else {
          console.warn(`No question found for index ${index}`);
        }
      });
    }
  } catch (error) {
    console.error(`Error processing  responses:`, error);
  }

  return extractedInfo;
}

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
- Feel like they're coming from a friend, using a warm and approachable tone.

${batchPrompt}

Generate upto a few follow-up questions until you can get to know the user better enough to represent him.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
    });

    const followUp = completion.choices[0]?.message.content?.trim();

    if (followUp) {
      followUpQuestions.push(
        ...followUp.split("\n").filter((q) => q.trim() !== "")
      );
    }
  } catch (error) {
    console.error(`Error generating follow-up questions:`, error);
  }

  return followUpQuestions;
}

export async function createGptConfiguration(
  allKeyInfo: ExtractedInfo
): Promise<object> {
  const prompt = `
Based on the following extracted key information about a user, create a configuration for a GPT model that can accurately represent this user in conversations. The configuration should include:

1. A brief description of the user's personality, background, and key traits.
2. Important topics or areas of expertise the GPT should be knowledgeable about.
3. The user's communication style and tone.
4. Any specific instructions or guidelines for the GPT to follow when engaging in conversations as this user.

User Information:
${Object.entries(allKeyInfo)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}

Provide the configuration in a structured format that can be easily converted to a GPT prompt.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
    });

    const gptConfig = completion.choices[0]?.message.content?.trim();

    if (gptConfig) {
      return {
        model: "gpt-3.5-turbo",
        prompt: gptConfig,
        max_tokens: 150,
        temperature: 0.7,
      };
    }
  } catch (error) {
    console.error(`Error creating GPT configuration:`, error);
  }

  return {};
}
