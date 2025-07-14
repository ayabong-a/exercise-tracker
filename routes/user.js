const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Exercise = require('../models/Exercise');

router.post('/', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const newUser = new User({ username });
        const savedUser = await newUser.save();

        res.json({
            username: savedUser.username,
            _id: savedUser._id
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const users = await User.find({}, 'username _id');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/:id/exercises', async (req, res) => {
    try {
        const userId = req.params.id;
        const { description, duration, date } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const exercise = new Exercise({
            userId: user._id,
            description,
            duration,
            date: date ? new Date(date) : new Date()
        });

        const savedExercise = await exercise.save();

        res.json({
            _id: user._id,
            username: user.username,
            description: savedExercise.description,
            duration: savedExercise.duration,
            date: savedExercise.date.toDateString()
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;