import mongoose, { Schema, models } from "mongoose";

const ConversationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      default: "New Conversation",
    },
  },
  {
    timestamps: true,
  }
);

export const Conversation =
  models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);