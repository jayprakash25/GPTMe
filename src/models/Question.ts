import  mongoose, { Schema, model } from 'mongoose';

const questionSchema = new Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['predefined', 'followup'], required: true },
  category: { type: String, required: true },
  order: { type: Number, required: false }, // Optional for predefined questions
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const QuestionModel = mongoose.models.Question || model('Question', questionSchema);

export default QuestionModel;
