import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Groq API
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, "public");
const DB_PATH = path.join(__dirname, "database.json");

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(publicDir));

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
  }

  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function removePassword(user) {
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}

function createDefaultUser({ username, email, phone, password }) {
  return {
    id: Date.now().toString(),
    username,
    email,
    phone,
    password,
    plan: "Basic",
    createdAt: new Date().toISOString(),

    dashboard: {
      attendance: 0,
      resumeScore: 0,
      interviewPractice: 0,
      skillSwapSessions: 0,
      communityPosts: 0,
      aiUses: 0
    },

    activities: []
  };
}

// Health
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    provider: "groq",
    model: GROQ_MODEL,
    hasKey: Boolean(GROQ_API_KEY)
  });
});

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, phone, password, confirmPassword } = req.body;

    if (!username || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const db = readDB();

    const existingUser = db.users.find(
      (user) => user.username === username || user.email === email
    );

    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = createDefaultUser({
      username,
      email,
      phone,
      password: hashedPassword
    });

    db.users.push(newUser);
    writeDB(db);

    res.json({
      message: "Signup successful.",
      user: removePassword(newUser)
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed." });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required." });
    }

    const db = readDB();

    const user = db.users.find(
      (u) => u.username === username || u.email === username
    );

    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password." });
    }

    res.json({
      message: "Login successful.",
      user: removePassword(user)
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed." });
  }
});

// Get user dashboard
app.get("/api/user/:id", (req, res) => {
  const db = readDB();

  const user = db.users.find((u) => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  res.json({ user: removePassword(user) });
});

// Update dashboard analytics
app.post("/api/update-dashboard", (req, res) => {
  const { userId, type, value } = req.body;

  const db = readDB();
  const user = db.users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (type === "attendance") {
    user.dashboard.attendance = Number(value) || 0;
    user.activities.unshift(`Attendance updated to ${user.dashboard.attendance}%`);
  }

  if (type === "resume") {
    user.dashboard.resumeScore = Number(value) || 0;
    user.activities.unshift(`Resume score updated to ${user.dashboard.resumeScore}/10`);
  }

  if (type === "interview") {
    user.dashboard.interviewPractice += 1;
    user.activities.unshift("Completed one interview practice.");
  }

  if (type === "skillswap") {
    user.dashboard.skillSwapSessions += 1;
    user.activities.unshift("Joined one SkillSwap session.");
  }

  if (type === "community") {
    user.dashboard.communityPosts += 1;
    user.activities.unshift("Created one community post.");
  }

  if (type === "ai") {
    user.dashboard.aiUses += 1;
    user.activities.unshift("Used an AI tool.");
  }

  writeDB(db);

  res.json({
    message: "Dashboard updated.",
    user: removePassword(user)
  });
});

// Groq AI
app.post("/api/ai", async (req, res) => {
  try {
    const userMessage = (req.body?.message || "").trim();

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (!GROQ_API_KEY || GROQ_API_KEY === "PASTE_YOUR_GROQ_KEY_HERE") {
      return res.status(500).json({
        error: "Groq API key missing. Add your key in server.js or set GROQ_API_KEY."
      });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              `You are CareerBot, the official AI assistant of CareerLoop.

              Your job is to help users understand and use the CareerLoop platform effectively.You must behave like a smart, friendly, and practical guide.

ABOUT CAREERLOOP:
              CareerLoop is an all-in -one student platform that helps users learn, track progress, and prepare for careers using AI tools and peer learning.

MAIN FEATURES:

          1. Community
- Students can post doubts, share notes, and interact
      - Helps in peer - to - peer learning and collaboration

2. Classlytics
      - Tracks attendance percentage
      - Shows how many classes to attend or can be skipped
      - Helps avoid attendance shortage

3. ResuvoAI
      - AI resume analyzer
      - Gives score out of 10
      - Provides strengths, weaknesses, missing skills, and improvements

4. SylloAI
      - Converts syllabus into structured summary
      - Gives unit - wise breakdown and study plan

5. IntervoAI
      - AI interview trainer
      - Reviews answers and gives feedback
      - Can generate mock questions

6. SkillSwap
      - Peer - to - peer learning system
      - Users can teach or learn skills for free or paid

7. Dashboard
        - Shows user analytics:
        - Attendance %
        - Resume score
  - Interview practice count
    - AI usage
    - Community activity
    - Updates automatically based on user actions

AUTHENTICATION FLOW:
      - User signs up using username, email, phone, password
    - Data is stored locally(for now)
      - On login, dashboard loads user - specific data
        - User stays logged in until logout
          - Logout clears session

HOW PLATFORM WORKS:
    - New users start with all values = 0
      - Every action updates dashboard:
    - Using AI → increases AI usage
      - Resume review → updates resume score
        - Interview practice → increases count
          - Community post → increases activity
            - SkillSwap session → increases sessions
              - Classlytics → updates attendance

IMPORTANT BEHAVIOR:
    - Always give clear, short, helpful answers
      - If user asks “how to use”, give step - by - step guidance
        - If user asks about a tool, explain what it does + how to use it
          - If user asks about login / signup, guide them through it
            - If user asks about dashboard, explain how it updates automatically
              - If user is confused, simplify explanation
                - If user asks general career questions, help like a mentor

    STYLE:
    - Friendly, smart, slightly casual
      - Not robotic
        - Use bullet points when helpful
          - Keep answers practical, not theoretical

DO NOT:
    - Mention backend, API keys, or internal implementation
      - Say “I am an AI model”
    - Give irrelevant long explanations

    GOAL:
Help users understand CareerLoop and use it effectively to improve their skills, resumes, and career readiness.`
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          data?.message ||
          `Groq request failed with status ${response.status}`,
        raw: data
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "No response text returned from Groq.";

    res.json({ reply });
  } catch (error) {
    console.error("Server error while contacting Groq:", error);
    res.status(500).json({
      error: error?.message || "Server error while contacting Groq."
    });
  }
});

// Pages
const pages = [
  "index.html",
  "community.html",
  "classlytics.html",
  "resuvoai.html",
  "sylloai.html",
  "intervoai.html",
  "skillswap.html",
  "dashboard.html"
];

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

for (const page of pages.slice(1)) {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(publicDir, page));
  });
}

app.use((req, res) => {
  res.status(404).sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`CareerLoop server running on http://localhost:${PORT}`);
});

