import mongoose, { Schema, model } from 'mongoose';

const userPreferencesSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  preferences: {
    topics: [String],
    communicationStyle: { type: String, required: true },
    goals: [String],
  },
  rawResponses: {
    type: Map,
    of: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserPreferencesModel = model('UserPreferences', userPreferencesSchema);

export default UserPreferencesModel;
