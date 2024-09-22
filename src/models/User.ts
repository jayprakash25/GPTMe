import  mongoose, {  Schema } from "mongoose";

interface User extends Document {
    googleId: string;
    name: string;
    email: string;
    picture?: string;
    createdAt: Date;
    updatedAt: Date;
  }

const userSchema = new Schema<User>({
    googleId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    picture: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    });

const userModel = mongoose.models.User || mongoose.model('User', userSchema);

export default userModel;
