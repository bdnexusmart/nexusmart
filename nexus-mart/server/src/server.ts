import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB from "./config/db";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set. Copy .env.example to .env and set it.");
    process.exit(1);
  }

  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Nexus Mart API running on port ${PORT} [${process.env.NODE_ENV}]`);
  });

  process.on("unhandledRejection", (err: Error) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
};

startServer();
