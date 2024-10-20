import { z } from "zod";

// export const conversationSchema = z.object({
//   _id: z.string().optional(), // MongoDB ObjectId can be represented as a string
//   userId: z.string(), // Assuming userId is a string
//   status: z.enum(["in_progress", "completed"]),
//   responses: z.array(
//     z.object({
//       question: z.string(),
//       response: z.string(),
//       createdAt: z.date(),
//     })
//   ),
//   followUpResponses: z.array(
//     z.object({
//       question: z.string(),
//       response: z.string(),
//       createdAt: z.date(),
//     })
//   ).optional(), // Optional as it may not always be present
//   extractedInfo: z.record(z.string()).optional(), // Maps can be represented as records
//   createdAt: z.date(),
//   updatedAt: z.date(),
// });


export const conversationSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId can be represented as a string
  userId: z.string(), // Assuming userId is a string
  status: z.enum(["in_progress", "completed"]),
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
      createdAt: z.date(),
    })
  ),
  extractedInfo: z.string().optional(), // Maps can be represented as records
  gptConfiguration: z.object({
    model: z.string(),
    prompt: z.string(),
    max_tokens: z.number(),
    temperature: z.number(),
  }),
  gptName: z.string(), // New field for GPT name
  gptPhoto: z.string(), // New field for GPT photo URL
  createdAt: z.date(),
  updatedAt: z.date(),
});
