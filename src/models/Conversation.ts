import mongoose, { Schema, model } from 'mongoose';

const conversationSchema = new Schema({
  userId: { type: String, required: true },
  status: { type: String, enum: ['in_progress', 'completed'], required: true },
  responses: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
      response: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ConversationModel = mongoose.models.Conversation || model('Conversation', conversationSchema);

export default ConversationModel;
