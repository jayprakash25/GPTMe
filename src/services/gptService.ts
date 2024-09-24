import OpenAI from "openai";

// Define types for the response object
interface Response {
  questionId: string;
  question: string;
  response: string;
}

// Define the structure for extracted info
interface ExtractedInfo {
  [questionId: string]: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

//   Extracts key information from a list of responses using OpenAI's API
 
export async function getKeyInfoFromResponse(responses: Response[]): Promise<ExtractedInfo> {
  const extractedInfo: ExtractedInfo = {};

  for (const response of responses) {
    const prompt = `Extract key info from this response to the question: "${response.question}". Response: "${response.response}"`;
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150
      });

      const info = completion.choices[0]?.message.content?.trim();

      if (info) {
        extractedInfo[response.questionId] = info;
      }
    } catch (error) {
      console.error(`Error processing response for question ${response.questionId}:`, error);
    }
  }

  return extractedInfo;
}

//   Generates follow-up questions based on user responses using OpenAI's API

 
export async function getFollowUpQuestions(responses: Response[]): Promise<string[]> {
  const followUpQuestions: string[] = [];

  for (const response of responses) {
    const prompt = `Based on this user's response, generate a relevant follow-up question for creating a personal GPT. Response: "${response.response}"`;
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100
      });

      const followUp = completion.choices[0]?.message.content?.trim();
      
      if (followUp) {
        followUpQuestions.push(followUp);
      }
    } catch (error) {
      console.error(`Error generating follow-up question for response:`, error);
    }
  }

  return followUpQuestions;
}