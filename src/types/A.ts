// import { z } from 'zod';
// import { Ai } from '@cloudflare/ai';
// import { D1Database } from '@cloudflare/workers-types';

// // Type for environment variables
// export const envSchema = z.object({
//   AI: z.instanceof(Ai),
//   DB: z.instanceof(D1Database),
//   JWT_SECRET: z.string(),
// });

// // Type for conversation actions
// export const conversationActionSchema = z.enum(['fetch_history', 'process_message']);

// // Type for user message input
// export const messageInputSchema = z.object({
//   message: z.string(),
//   action: conversationActionSchema,
// });

// // Type for a message object in conversation
// export const conversationMessageSchema = z.object({
//   role: z.enum(['user', 'assistant', 'system']),
//   content: z.string(),
// });

// // Type for conversation record from the database
// export const conversationRecordSchema = z.object({
//   userId: z.string(),
//   status: z.enum(['in_progress', 'completed']),
//   messages: z.string(), // JSON string of messages array
//   extractedInfo: z.string(), // JSON string of extracted info object
//   createdAt: z.string(),
// });

// // Type for the API response when fetching conversation history
// export const conversationHistoryResponseSchema = z.object({
//   statusCode: z.number(),
//   message: z.string(),
//   data: z.object({
//     messages: z.array(conversationMessageSchema),
//     status: z.enum(['in_progress', 'completed']),
//     extractedInfo: z.record(z.any()),
//   }).optional(),
// });

// // Type for the API response when processing a message
// export const processMessageResponseSchema = z.object({
//   statusCode: z.number(),
//   message: z.string(),
//   data: z.object({
//     aiResponse: z.string(),
//     status: z.enum(['in_progress', 'completed']),
//     extractedInfo: z.record(z.any()).optional(),
//   }).optional(),
// });

// // Type for the AI extraction function's input and output
// export const extractKeyInfoInputSchema = z.object({
//   ai: z.instanceof(Ai),
//   messages: z.array(conversationMessageSchema),
// });

// export const extractKeyInfoOutputSchema = z.record(z.any());
