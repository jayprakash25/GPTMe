import  { model, Schema } from "mongoose";

const userSchema = new Schema({
    googleId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    picture: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    });

const userModel = model('User', userSchema);

export default userModel;
