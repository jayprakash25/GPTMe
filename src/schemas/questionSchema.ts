import { z } from 'zod';
import { ObjectId } from 'mongodb'; 

export const questionSchema = z.object({
  _id: z.instanceof(ObjectId),
  text: z.string(),
  type: z.enum(['predefined', 'followup']),
  category: z.string(),
  order: z.number().optional(), // Only for predefined questions
  createdAt: z.date(),
  updatedAt: z.date(),
});
