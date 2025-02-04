const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Platform Visit Schema
const PlatformVisitSchema = new Schema(
  {
    visitType: {
      type: String,
      enum: ["guest", "user"], // Determines whether the visit is by a guest or a registered user
      required: true,
    },
    byIp: {
      type: String,
      default: "", // IP address of the guest visitor (if the visitor is not logged in)
    },
    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // referencing the User collection (for logged-in users)
      default: null, // This will be null for guest visits
    },
    deletedAt: {
      type: Date,
      default: null, // Soft delete
    },
  },
  { timestamps: true } // Automatically includes createdAt and updatedAt fields
);

// Create an index to efficiently track visits by day
PlatformVisitSchema.index({ createdAt: 1 });

module.exports = mongoose.model("PlatformVisit", PlatformVisitSchema);
