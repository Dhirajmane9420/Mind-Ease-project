const mongoose = require('mongoose');
require('dotenv').config(); // Make sure your MONGO_URI is in the .env file

const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    
    // If successful, log the confirmation message
    console.log('MongoDB Connected Successfully...');

  } catch (err) {
    // If there is an error, log the error message and exit the process
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;