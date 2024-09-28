import  mongoose, {  model, Schema } from "mongoose";

interface User extends Document {
    googleId: string;
    name: string;
    email: string;
    picture?: string;
    bio?: string;
    gptId?: mongoose.Schema.Types.ObjectId;
    isGptCreated: boolean;
    createdAt: Date;
    updatedAt: Date;
  }


  const userSchema = new Schema<User>({
    googleId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    picture: { type: String },
    bio: { type: String }, // Optional user bio
    gptId: { type: mongoose.Schema.Types.ObjectId, ref: 'GptConfig' }, // Reference to GPT Configuration
    isGptCreated: { type: Boolean, default: false }, // Indicates whether the GPT is created
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  
  const UserModel = mongoose.models.User || model<User>('User', userSchema);
  export default UserModel;
  
