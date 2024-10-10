import OpenAI from "openai";

// Define types for the response object
interface Response {
  questionId: string;
  question: string;
  response: string;
}

// Define the structure for extracted information
interface ExtractedInfo {
  [question: string]: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for guiding the GPT
const systemPrompt = `
You are an AI assistant tasked with creating a personalized digital version of a user. Begin by saying: 
"Hey, get ready to create your own custom GPT! I'm here to help craft a digital version of you. I'll ask you some questions about your life, work, experiences, and interests. Let's start with your name!" 
After the user responds, continue asking questions related to their personal background, education, professional experiences, hobbies, and personality traits. Stop asking questions when the user says, "That's it" or "I'm done."
`;

// Extract key information from user responses
export async function getKeyInfoFromResponse(responses: Response[]): Promise<ExtractedInfo> {
  return await processResponses(responses);
}

// Process responses and extract key insights
async function processResponses(responses: Response[]): Promise<ExtractedInfo> {
  const extractedInfo: ExtractedInfo = {};

  // Create a prompt with each question and response for summarization
  const batchPrompt = responses
    .map(
      (response) => `Q: "${response.question}"\nA: "${response.response}"\nSummarize the key insights.`
    )
    .join("\n\n");

  const prompt = `
Extract and summarize key information from the following responses:

${batchPrompt}

Provide a concise summary for each response to build a personalized digital profile of the user.
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
          extractedInfo[question] = info.trim();
        }
      });
    }
  } catch (error) {
    console.error(`Error processing responses:`, error);
  }

  return extractedInfo;
}

// Generate follow-up questions based on the user’s responses
export async function getFollowUpQuestions(responses: Response[]): Promise<string[]> {
  const followUpQuestions: string[] = [];

  const batchPrompt = responses
    .map(
      (response) => `Question: "${response.question}"\nResponse: "${response.response}"`
    )
    .join("\n\n");

  const prompt = `
Based on the user's responses, generate friendly follow-up questions to explore their personality, hobbies, and professional life further. The questions should be light and open-ended to encourage more detail. 

${batchPrompt}

Generate a few follow-up questions to refine the user's digital profile.
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

// Create GPT configuration based on the extracted key information
export async function createGptConfiguration(allKeyInfo: ExtractedInfo): Promise<object> {
  const prompt = `
Based on the following user information, create a configuration for a GPT model to represent the user in conversations. The configuration should include:

1. A brief description of the user's personality, background, and key traits.
2. Important areas of expertise or interests.
3. The user's communication style and tone.
4. Any specific instructions for the GPT when engaging in conversations as this user.

User Information:
${Object.entries(allKeyInfo)
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}
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
