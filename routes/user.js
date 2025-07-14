const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Exercise = require("../models/Exercise");

const errorMessages = {
  userNotFound: "User not found",
  usernameRequired: "Username is required",
  serverError: "Server error",
};

router.post("/", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: errorMessages.usernameRequired })
    }

    const newUser = new User({ username });
    const savedUser = await newUser.save();

    res.json({
      username: savedUser.username,
      _id: savedUser._id,
    });
  } catch (error) {
    res.status(500).json({ error: errorMessages.serverError });
  }
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "username _id");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: errorMessages.serverError });
  }
});

router.post("/:id/exercises", async (req, res) => {
  try {
    const userId = req.params.id;
    const { description, duration, date } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: errorMessages.userNotFound });
    }

    const exercise = new Exercise({
      userId: user._id,
      description,
      duration,
      date: date ? new Date(date) : new Date(),
    });

    const savedExercise = await exercise.save();

    res.json({
      _id: user._id,
      username: user.username,
      description: savedExercise.description,
      duration: savedExercise.duration,
      date: savedExercise.date.toDateString(),
    });
  } catch (error) {
    res.status(500).json({ error: errorMessages.serverError });
  }
});

router.get("/:id/logs", async (req, res) => {
  try {
    const userId = req.params.id;
    const { from, to, limit } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: errorMessages.userNotFound });
    }

    const query = { userId };

    if (from || to) {
      query.date = {};
      if (from) {
        query.date.$gte = new Date(from);
      }
      if (to) {
        query.date.$lte = new Date(to);
      }
    }

    let exercises = Exercise.find(query).select("description duration date");

    if (limit) {
      exercises = exercises.limit(parseInt(limit));
    }

    const logs = await exercises.exec();

    res.json({
      _id: user._id,
      username: user.username,
      count: logs.length,
      log: logs.map((exercise) => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString(),
      })),
    });
  } catch (error) {
    res.status(500).json({ error: errorMessages.serverError });
  }
});

module.exports = router;