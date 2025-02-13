const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PlatformVisitSchema = new Schema(
  {
    visitType: {
      type: String,
      enum: ["guest", "user"],
      required: true,
    },

    // Store Guest Identifier (e.g., IP Address or Session ID)
    byGuest: {
      type: String,
      default: null,
    },

    // Store User ID if the visitor is authenticated
    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// For sorting data for faster finding the latest visit of an user or guest
// First sorts the User and Guests in ascending order then when the User of Guest founded, It will sort its views by the createdAt from latest to oldest or descending order and stops immediately when the visit founded.
// 🔍 Optimized Indexes for Faster Queries
PlatformVisitSchema.index({ visitType: 1, createdAt: -1 }); // Faster "user vs. guest" analytics
PlatformVisitSchema.index({ byUser: 1, createdAt: -1 }); // Quick lookup for user visits
PlatformVisitSchema.index({ byGuest: 1, createdAt: -1 }); // Quick lookup for guest visits

module.exports = mongoose.model("PlatformVisit", PlatformVisitSchema);
