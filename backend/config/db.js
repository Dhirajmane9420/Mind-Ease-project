// config/db.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
  try {
    // Replace this with the connection string you saved yesterday!
    const connectionString =process.env.MONGO_URI;

    await mongoose.connect(connectionString);

    console.log('MongoDB Connected Successfully...');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;