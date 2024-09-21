import { z } from "zod";
import { ObjectId } from "mongodb";

export const conversationSchema = z.object({
  _id: z.instanceof(ObjectId),
  userId: z.instanceof(ObjectId),
  status: z.enum(["in_progress", "completed"]),
  responses: z.array(
    z.object({
      questionId: z.instanceof(ObjectId),
      response: z.string(),
      createdAt: z.date(),
    })
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
});
