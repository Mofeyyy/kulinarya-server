import { Schema, model } from "mongoose";
import mongoose from "mongoose";
import CustomError from "../utils/customError.js";
import { trackPlatformVisitSchema } from "../validations/platformVisitValidation.js";

const PlatformVisitSchema = new Schema(
  {
    visitType: {
      type: String,
      enum: ["guest", "user"],
      required: true,
    },
    byUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    byGuest: {
      type: String, // Store guest's IP address
      default: null,
    },
  },
  { timestamps: true }
);

PlatformVisitSchema.index({ visitType: 1, createdAt: -1 });
PlatformVisitSchema.index({ byUser: 1, createdAt: -1 });
PlatformVisitSchema.index({ byGuest: 1, createdAt: -1 });

PlatformVisitSchema.statics.trackVisit = async function (req) {
  const { visitType, byUser, byGuest } = req.body;

  const finalVisitType = visitType || (req.user ? "user" : "guest");
  const finalByUser = req.user ? req.user.userId : byUser || null;
  const finalByGuest = !req.user ? req.ip : byGuest || null;

  const validatedData = trackPlatformVisitSchema.parse({
    visitType: finalVisitType,
    byUser: finalByUser,
    byGuest: finalByGuest,
  });

  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  let existingVisit;

  if (finalVisitType === "user") {
    existingVisit = await this.findOne({
      byUser: finalByUser,
      createdAt: { $gte: oneHourAgo },
    });
  } else {
    existingVisit = await this.findOne({
      byGuest: finalByGuest,
      createdAt: { $gte: oneHourAgo },
    });
  }

  if (existingVisit) {
    throw new CustomError("Visit already recorded within the last hour", 429);
  }

  const newVisit = await this.create(validatedData);
  return { platformVisit: newVisit };
};

PlatformVisitSchema.statics.getPlatformVisits = async function () {
  const totalVisits = await this.countDocuments();
  const userVisits = await this.countDocuments({ visitType: "user" });
  const guestVisits = await this.countDocuments({ visitType: "guest" });

  return { totalVisits, userVisits, guestVisits };
};

const PlatformVisit = model("PlatformVisit", PlatformVisitSchema);
export default PlatformVisit;
