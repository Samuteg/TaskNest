import mongoose from "mongoose";

const collaborationEventSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
      index: true,
    },
    kind: {
      type: String,
      enum: ["comment", "activity", "notification"],
      required: true,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    audienceEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    mentions: {
      type: [String],
      default: [],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    readAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

collaborationEventSchema.index({ project: 1, kind: 1, createdAt: -1 });
collaborationEventSchema.index({ audienceEmail: 1, kind: 1, createdAt: -1 });

const CollaborationEvent = mongoose.model(
  "CollaborationEvent",
  collaborationEventSchema,
);

export default CollaborationEvent;
