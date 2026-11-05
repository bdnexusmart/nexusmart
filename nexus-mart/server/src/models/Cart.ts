import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICartItem {
  _id?: Types.ObjectId;
  product: Types.ObjectId;
  vendor: Types.ObjectId;
  quantity: number;
  price: number;
  selectedVariants?: { name: string; option: string }[];
}

export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true },
    selectedVariants: [{ name: String, option: String }],
  },
  { _id: true }
);

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model<ICart>("Cart", cartSchema);
