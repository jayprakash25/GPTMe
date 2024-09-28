import mongoose, { Schema, model } from 'mongoose';

interface GptConfig extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    conversationStarters: string[];
    tone: string;
    personalityTraits: string[];
    goals: string[];
    createdAt: Date;
    updatedAt: Date;
    }

const gptConfigSchema = new Schema<GptConfig>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversationStarters: [String], // Predefined conversation starters
  tone: { type: String }, // GPT communication style or tone
  personalityTraits: [String], // Personality traits to configure GPT's responses
  goals: [String], // User-defined goals for their GPT
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const GptConfigModel = mongoose.models.GptConfig || model<GptConfig>('GptConfig', gptConfigSchema);
export default GptConfigModel;
