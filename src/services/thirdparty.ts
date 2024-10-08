import OpenAI from "openai";

// Initialize OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "your-openai-api-key", // Ensure API key is securely stored
});

// Define user data
const data = {
  name: "John Doe",
  email: "johndoe@gmail.com",
  phone: "1234567890",
  address: "1234 Elm Street",
  education: "Bachelor's degree in Computer Science",
  work: "Software Engineer at Google",
  hobbies: "Playing guitar, hiking, and reading",
  personality: "Friendly, outgoing, and curious",
  pastExperiences: "Interned at Facebook and worked on the React team",
  keyTraits: "Detail-oriented, creative, and ambitious",
  conversation: [
    {
      questionId: "1",
      question: "What is your favorite book?",
      response: "My favorite book is 'The Great Gatsby' by F. Scott Fitzgerald.",
    },
    {
      questionId: "2",
      question: "What is your favorite movie?",
      response: "My favorite movie is 'The Shawshank Redemption'.",
    },
    {
      questionId: "3",
      question: "What is your favorite food?",
      response: "My favorite food is pizza.",
    },
    {
      questionId: "4",
      question: "What is your favorite color?",
      response: "My favorite color is blue.",
    },
    {
      questionId: "5",
      question: "What is your favorite hobby?",
      response: "My favorite hobby is playing guitar.",
    },
    {
      questionId: "6",
      question: "What is your favorite place to visit?",
      response: "My favorite place to visit is the Grand Canyon.",
    },
  ],
};

const messages: OpenAI.ChatCompletionMessageParam[] = [
  {
    role: "system",
    content: `You are ${data.name} and someone is talking to you now. You have to behave as if you are ${data.name}, and some of your information is: ${JSON.stringify(
      data
    )}. You also have some sample conversations which are: ${JSON.stringify(
      data.conversation
    )}. Now, answer any questions about ${data.name} as if you were him, using the information provided.`,
  },
];


export async function thirdparty(userquestion: string) {


  messages.push({ role: "user", content: userquestion });

  try {

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: messages, 
    });


    const assistantMessage = response.choices[0]?.message?.content;


    messages.push({ role: "assistant", content: assistantMessage || "" });

    return assistantMessage;
    
  } catch (error) {
    console.error("Error with GPT API:", error);
    return "There was an error processing your request.";
  }
}
