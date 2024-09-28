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

const systemPrompt = `You are an advanced AI assistant designed to create a comprehensive digital version of a user. Your task is to extract detailed, nuanced information about the user's personality, experiences, knowledge, and communication style. Focus on the following key areas:

1. Personal background and history
2. Professional experience and skills
3. Interests, hobbies, and passions
4. Personality traits and communication style
5. Values, beliefs, and life philosophy
6. Knowledge areas and expertise
7. Goals, aspirations, and future plans
8. Problem-solving approaches and decision-making processes
9. Memorable life experiences and lessons learned
10. Opinions on relevant topics in their field or areas of interest

Analyze responses carefully to identify unique characteristics, patterns, and insights that will make the digital version authentic and personalized.`;
 
export async function getKeyInfoFromResponse(responses: Response[]): Promise<ExtractedInfo> {
  const extractedInfo: ExtractedInfo = {};



  const batchPrompt = responses.map(response => 
    `Question: "${response.question}"
     Response: "${response.response}"
     
     Extract key information, insights, and unique characteristics from this response. Identify any patterns or noteworthy elements that contribute to creating an authentic digital version of the user.`
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

  const batchPrompt = responses.map(response => 
    `Question: "${response.question}"
     Response: "${response.response}"`
  ).join("\n\n");

  const prompt = `Based on the following user responses, generate 5 insightful follow-up questions that will help create a more comprehensive and authentic digital version of the user. Each question should delve deeper into a specific aspect of the user's personality, experiences, or knowledge.

${batchPrompt}

For each follow-up question: The question should be in very simple words and should be easy to understand. it should be short and to the point. Avoid complex words or jargon. A little bit of humour is okay. The question should be open-ended and should encourage the user to share more information. The user should feel like he's chatting to a real person.
`;


  // for (const response of responses) {
  //   const prompt = `Based on this user's response, generate a relevant follow-up question for creating a personal GPT. Response: "${response.response}"`;
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{role: 'system', content: systemPrompt},{ role: 'user', content: prompt }],
        max_tokens: 100
      });

      const followUp = completion.choices[0]?.message.content?.trim();
      
      if (followUp) {
        followUpQuestions.push(followUp);
      }
    } catch (error) {
      console.error(`Error generating follow-up question for response:`, error);
    }
  // }

  return followUpQuestions;
}