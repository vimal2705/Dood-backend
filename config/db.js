const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Ensure DB indexes match current schemas.
    // This will drop legacy indexes (e.g. userId_1_date_1) that can block
    // multiple mood/energy entries per day.
    try {
      const MoodEnergy = require("../models/MoodEnergy");
      await MoodEnergy.syncIndexes();
    } catch (e) {
      console.warn("MoodEnergy index sync skipped:", e?.message || e);
    }

    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
