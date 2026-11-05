import mongoose, { Schema, Document, Types } from "mongoose";
import slugify from "slugify";

export interface ICategory extends Document {
  name: string;
  slug: string;
  parent?: Types.ObjectId | null;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

categorySchema.pre("validate", function (next) {
  if (this.name && (!this.slug || this.isModified("name"))) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model<ICategory>("Category", categorySchema);
