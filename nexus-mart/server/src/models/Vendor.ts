import mongoose, { Schema, Document, Types } from "mongoose";
import slugify from "slugify";
import { VendorStatus } from "../types";

export interface IVendor extends Document {
  user: Types.ObjectId;
  storeName: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  status: VendorStatus;
  commissionRate: number;
  bankDetails?: { accountName: string; accountNumber: string; bankName: string };
  address?: { street: string; city: string; state: string; postalCode: string; country: string };
  ratingAverage: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    storeName: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    banner: { type: String, default: "" },
    status: { type: String, enum: Object.values(VendorStatus), default: VendorStatus.PENDING },
    commissionRate: { type: Number, default: 10 },
    bankDetails: { accountName: String, accountNumber: String, bankName: String },
    address: { street: String, city: String, state: String, postalCode: String, country: String },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

vendorSchema.pre("validate", function (next) {
  if (this.storeName && (!this.slug || this.isModified("storeName"))) {
    this.slug = `${slugify(this.storeName, { lower: true, strict: true })}-${Math.random().toString(36).slice(2, 7)}`;
  }
  next();
});

export default mongoose.model<IVendor>("Vendor", vendorSchema);
