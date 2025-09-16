// routes/reports.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const mongoose = require('mongoose');

// @route   GET api/reports/stats
// @desc    Get appointment statistics for the logged-in counselor
// @access  Private
router.get('/stats', auth, async (req, res) => {
    try {
        if (req.user.role !== 'counselor') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const counselorId = new mongoose.Types.ObjectId(req.user.id);

        // 1. Get total number of appointments
        const totalAppointments = await Appointment.countDocuments({ counselor: counselorId });

        // 2. Get appointments grouped by month
        const monthlyCounts = await Appointment.aggregate([
            { $match: { counselor: counselorId } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            totalAppointments,
            monthlyCounts
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/appointments', auth, async (req, res) => {
    try {
        if (req.user.role !== 'counselor') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const appointments = await Appointment.find({ counselor: req.user.id })
            .populate('student', 'name email') // Get student details
            .sort({ date: -1 }); // Sort by newest appointment first

        res.json(appointments);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;