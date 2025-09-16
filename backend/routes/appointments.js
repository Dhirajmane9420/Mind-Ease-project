// routes/appointments.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');

// @route   POST api/appointments
// @desc    Book a new appointment
// @access  Private
router.post('/', auth, async (req, res) => {
  // We expect the ID of the chosen counselor and the date from the request body
  const { counselorId, date } = req.body;

  if (!counselorId || !date) {
    return res.status(400).json({ msg: 'Please provide a counselor and a date.' });
  }

  try {
    // We create the appointment with the specific details provided by the user
    const newAppointment = new Appointment({
      student: req.user.id,
      counselor: counselorId,
      date: date,
    });

    const appointment = await newAppointment.save();
    res.status(201).json(appointment);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/appointments/my-appointments
// @desc    Get all appointments for the current student
// @access  Private
router.get('/my-appointments', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ student: req.user.id })
      .populate('counselor', 'name')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/appointments/counselor
// @desc    Get all appointments for the logged-in counselor
// @access  Private (Counselors only)
router.get('/counselor', auth, async (req, res) => {
    try {
        if (req.user.role !== 'counselor') {
            return res.status(403).json({ msg: 'Access denied. Not a counselor.' });
        }
        const appointments = await Appointment.find({ counselor: req.user.id })
            .populate('student', 'name email')
            .sort({ date: 1 });
        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;