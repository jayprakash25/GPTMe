import mongoose, { Schema, model } from 'mongoose';

// const conversationSchema = new Schema({
//   userId: { type: String, required: true },
//   status: { type: String, enum: ['in_progress', 'completed'], required: true },
//   responses: [{
//     // questionId: { type: String, required: true },
//     question: { type: String, required: true },
//     response: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
//   }],
//   followUpResponses: [{
//     // questionId: { type: String, required: true },
//     question: { type: String, required: true },
//     response: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
//   }],
//   extractedInfo: { type: Map, of: String },
//   gptConfiguration: {
//     model: String,
//     prompt: String,
//     max_tokens: Number,
//     temperature: Number,
//   },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
// });

const conversationSchema = new Schema({
  userId: { type: String, required: true },
  status: { type: String, enum: ['in_progress', 'completed'], required: true },
  messages: [{
    role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  extractedInfo: { type: String },
  gptConfiguration: {
    model: String,
    prompt: String,
    max_tokens: Number,
    temperature: Number,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


conversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ConversationModel = mongoose.models.Conversation || model('Conversation', conversationSchema);

export default ConversationModel;