import OpenAI from "openai";



// Define the structure for extracted information
// interface ExtractedInfo {
//   [question: string]: string;
// }

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for guiding the GPT
const systemPrompt = `
You are an AI assistant tasked with creating a personalized digital version of a user. Begin by saying: 
"Hey, get ready to create your own custom GPT! I'm here to help craft a digital version of you. I'll ask you some questions about your life, work, experiences, and interests. Let's start with your name!" 
After the user responds, continue asking questions related to their personal background, education, professional experiences, hobbies, and personality traits. Stop asking questions when the user says, "That's it" or "I'm done. When the user's digital version is complete send the final message that includes the text your digital version is now created"
`;

interface Messages {
  role: "user" | "assistant" | "system";
  content: string;
  name?: string; // Optional, only needed if using function-based messages
}


export async function generateResponse(messages: Messages[]): Promise<string>{
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{role: "system", content: systemPrompt}, ...messages],
      max_tokens: 150,
    })

    return completion.choices[0].message?.content?.trim() || "";
  } catch (error) {
    console.log("Error generating response:", error);
    throw error;
  }
}

export async function extractKeyInfo(messages: { role: string; content: string }[]): Promise<string> {
  const prompt = `
    Summarize the user's responses into these sections:

    1. Background: Age, job, key experiences, family, education.
    2. Personality: Traits, communication style, values.
    3. Interests: Hobbies, skills, favorite activities.
    4. Professional: Current role, achievements, skills.
    5. Goals: Short-term, long-term, growth areas.

    Note "unknown" if details are missing. Use markdown headers.

    Conversation:
    ${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}

  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("Error extracting key info:", error);
    throw error;
  }
}



// Create GPT configuration based on the extracted key information
export async function createGptConfiguration(allKeyInfo: string): Promise<object> {
  const prompt = `
Based on the following user information, create a configuration for a GPT model to represent the user in conversations. The configuration should include:

1. A brief description of the user's personality, background, and key traits.
2. Important areas of expertise or interests.
3. The user's communication style and tone.
4. Any specific instructions for the GPT when engaging in conversations as this user.

User Information:
${allKeyInfo}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        // { role: "system", content: systemPrompt },
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
