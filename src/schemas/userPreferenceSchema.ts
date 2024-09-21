import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const userPreferencesSchema = z.object({
  _id: z.instanceof(ObjectId),
  userId: z.instanceof(ObjectId),
  conversationId: z.instanceof(ObjectId),
  preferences: z.object({
    topics: z.array(z.string()),
    communicationStyle: z.string(),
    goals: z.array(z.string()),
  }),
  rawResponses: z.record(z.string()), // Key-value pair for questionId and responses
  createdAt: z.date(),
  updatedAt: z.date(),
});
