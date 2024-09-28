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

  const systemPrompt = "You are an AI assistant helping to gather key information from the user to create a digital version of a user.";

  const batchPrompt = responses.map(response => `Extract key info from this response to the question: "${response.question}". Response: "${response.response}"`
  ).join("\n\n");

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: batchPrompt }
      ],
      max_tokens: 1000
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