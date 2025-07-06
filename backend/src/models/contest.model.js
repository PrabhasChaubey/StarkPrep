import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
  name: String,
  platform: String, // 'LeetCode' or 'Codeforces'
  url: String,
  startTime: Date,
  endTime: Date,
  duration: String,
}, { timestamps: true });

export const Contest = mongoose.model("Contest", contestSchema);
