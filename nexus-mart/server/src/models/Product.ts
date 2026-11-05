import mongoose, { Schema, Document, Types } from "mongoose";
import slugify from "slugify";

export interface IProduct extends Document {
  vendor: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  category: Types.ObjectId;
  images: string[];
  price: number;
  discountPrice?: number;
  stock: number;
  sku: string;
  variants: { name: string; options: string[] }[];
  isActive: boolean;
  isApproved: boolean;
  ratingAverage: number;
  ratingCount: number;
  soldCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    images: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, required: true },
    variants: [{ name: String, options: [String] }],
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ vendor: 1, sku: 1 }, { unique: true });
productSchema.index({ slug: 1 });

productSchema.pre("validate", function (next) {
  if (this.name && (!this.slug || this.isModified("name"))) {
    this.slug = `${slugify(this.name, { lower: true, strict: true })}-${Math.random().toString(36).slice(2, 7)}`;
  }
  next();
});

export default mongoose.model<IProduct>("Product", productSchema);
