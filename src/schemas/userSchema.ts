import {z} from 'zod';

export const userSchema = z.object(
    {
        googleId: z.string(),
        name: z.string(),
        email: z.string().email(),
        picture: z.string().url().optional(),
        createdAt: z.string(),
        UpdatedAt: z.string(),
    }
)