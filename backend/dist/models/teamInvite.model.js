import mongoose from "mongoose";
const teamInviteSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        default: null,
    },
    role: {
        type: String,
        enum: ["viewer", "editor", "admin"],
        default: "viewer",
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending",
    },
}, { timestamps: true });
teamInviteSchema.index({ email: 1, project: 1, updatedAt: -1, createdAt: -1 });
teamInviteSchema.index({ invitedBy: 1, createdAt: -1 });
const TeamInvite = mongoose.model("TeamInvite", teamInviteSchema);
export default TeamInvite;
