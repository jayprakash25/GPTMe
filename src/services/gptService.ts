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
You are an AI assistant creating a detailed and personalized digital version of a user. Your task is to extract detailed, nuanced information from user responses across the following areas:

1. **Personal Background**: Family, upbringing, and key events.
2. **Professional Experience**: Current job, past roles, and skills.
3. **Hobbies and Interests**: What the user enjoys doing.
4. **Personality and Communication Style**: How the user interacts.
5. **Values and Beliefs**: User’s principles and guiding philosophy.
6. **Aspirations and Goals**: Future plans, ambitions, and dreams.
7. **Life Experiences**: Memorable moments, achievements, and lessons learned.

Provide a concise yet detailed summary for each user response, highlighting unique traits, patterns, or anything that stands out.
`;

export async function getKeyInfoFromResponse(
  responses: Response[]
): Promise<ExtractedInfo> {
  const extractedInfo: ExtractedInfo = {};

  const batchPrompt = responses
    .map(
      (response) =>
        `Question: "${response.question}"\nResponse: "${response.response}"\nExtract key insights, unique traits, and summarize the most important points in a concise manner.`
    )
    .join("\n\n");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: batchPrompt },
      ],
      max_tokens: 1000,
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
Based on the following user responses, generate few follow-up questions that encourage the user to provide deeper insights into their personality, experiences, or knowledge. The questions should:

1. Be simple, conversational, and easy to understand.
2. Use humor and a friendly tone to make the conversation feel natural.
3. Be open-ended, encouraging detailed responses.

${batchPrompt}
  `;



  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 100,
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
