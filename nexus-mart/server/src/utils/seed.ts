import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db";
import User from "../models/User";
import Category from "../models/Category";
import { UserRole } from "../types";

const run = async () => {
  await connectDB();

  const adminEmail = "admin@nexusmart.com";
  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({
      name: "Nexus Mart Admin",
      email: adminEmail,
      password: "Admin@123",
      role: UserRole.ADMIN,
    });
    console.log(`Admin created: ${adminEmail} / Admin@123  (change this password!)`);
  } else {
    console.log("Admin already exists, skipping");
  }

  for (const name of ["Electronics", "Fashion", "Home & Kitchen", "Beauty", "Sports"]) {
    if (!(await Category.findOne({ name }))) {
      await Category.create({ name });
      console.log(`Category created: ${name}`);
    }
  }

  console.log("Seeding complete");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
