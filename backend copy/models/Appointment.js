// models/Appointment.js

const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId, // A special type for IDs
    ref: 'User', // Refers to the 'User' model
    required: true,
  },
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['booked', 'completed', 'canceled'],
    default: 'booked',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Appointment', AppointmentSchema);