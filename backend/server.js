const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// =====================
// MongoDB
// =====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Mongo Error:", err));

// =====================
// Schemas
// =====================
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const HabitSchema = new mongoose.Schema({
  userId: String,
  title: String,
  createdAt: { type: Date, default: Date.now },
});

const HabitLogSchema = new mongoose.Schema({
  userId: String,
  habitId: String,
  date: String, // YYYY-MM-DD
  completed: Boolean,
});

const User = mongoose.model("User", UserSchema);
const Habit = mongoose.model("Habit", HabitSchema);
const HabitLog = mongoose.model("HabitLog", HabitLogSchema);

// =====================
// Utils
// =====================
const getLastNDates = (n) => {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

// =====================
// Health
// =====================
app.get("/ping", (req, res) => res.send("pong"));

// =====================
// Auth
// =====================
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email }))
    return res.status(400).json({ message: "User already exists" });

  await new User({ name, email, password }).save();
  res.json({ message: "Registered successfully" });
});

app.post("/login", async (req, res) => {
  const user = await User.findOne(req.body);
  if (!user)
    return res.status(401).json({ message: "Invalid credentials" });

  res.json({ user });
});

// =====================
// Habits
// =====================
app.post("/habits", async (req, res) => {
  const habit = await new Habit(req.body).save();
  res.json(habit);
});

app.get("/habits/:userId", async (req, res) => {
  res.json(await Habit.find({ userId: req.params.userId }));
});

// =====================
// Mark Done
// =====================
app.post("/habit/done", async (req, res) => {
  const { userId, habitId, date } = req.body;

  let log = await HabitLog.findOne({ userId, habitId, date });
  if (log) {
    log.completed = true;
    await log.save();
  } else {
    log = await new HabitLog({
      userId,
      habitId,
      date,
      completed: true,
    }).save();
  }

  res.json(log);
});

// =====================
// STREAK CALCULATION
// =====================
const calculateStreaks = (dates) => {
  let current = 0;
  let best = 0;
  let temp = 0;

  const today = new Date().toISOString().split("T")[0];

  for (let i = dates.length - 1; i >= 0; i--) {
    if (dates[i] === today || current > 0) {
      current++;
    } else {
      break;
    }
  }

  for (let i = 0; i < dates.length; i++) {
    temp++;
    best = Math.max(best, temp);
  }

  return { current, best };
};

// =====================
// INSIGHTS — PER HOBBY
// =====================
app.get("/insights/hobby/:habitId/:userId", async (req, res) => {
  const { habitId, userId } = req.params;

  const logs = await HabitLog.find({
    userId,
    habitId,
    completed: true,
  }).sort({ date: 1 });

  const dates = logs.map((l) => l.date);

  const streaks = calculateStreaks(dates);

  const last7 = getLastNDates(7);
  const weeklyCount = dates.filter((d) => last7.includes(d)).length;

  const heatmap = getLastNDates(90).map((d) => ({
    date: d,
    value: dates.includes(d) ? 1 : 0,
  }));

  res.json({
    habitId,
    streaks,
    weekly: {
      completed: weeklyCount,
      total: 7,
      percentage: Math.round((weeklyCount / 7) * 100),
    },
    heatmap,
  });
});

// =====================
// INSIGHTS — OVERALL
// =====================
app.get("/insights/overall/:userId", async (req, res) => {
  const { userId } = req.params;

  const habits = await Habit.find({ userId });
  const logs = await HabitLog.find({ userId, completed: true });

  const last7 = getLastNDates(7);
  const weeklyDone = logs.filter((l) =>
    last7.includes(l.date)
  ).length;

  res.json({
    totalHabits: habits.length,
    weeklyDone,
    weeklyPossible: habits.length * 7,
    percentage:
      habits.length === 0
        ? 0
        : Math.round(
            (weeklyDone / (habits.length * 7)) * 100
          ),
  });
});

// =====================
// Server
// =====================
app.listen(5001, "127.0.0.1", () =>
  console.log("Server running on port 5001")
);
