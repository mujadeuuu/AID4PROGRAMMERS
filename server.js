const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ===== JSON FILES =====
// Main timeline
const MAIN_USERS_FILE = path.join(__dirname, "users.json");
const MAIN_POSTS_FILE = path.join(__dirname, "posts.json");

// Tutorials timeline
const TUT_USERS_FILE = path.join(__dirname, "tutser.json");
const TUT_POSTS_FILE = path.join(__dirname, "tutorialspt.json");

// ===== ENSURE FILES EXIST =====
[MAIN_USERS_FILE, TUT_USERS_FILE].forEach(file => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
});

[MAIN_POSTS_FILE, TUT_POSTS_FILE].forEach(file => {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
});

// ===== HELPER FUNCTIONS =====
function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ===== ROUTES =====

// ---- MAIN TIMELINE ----
// Create user
app.post("/users", (req, res) => {
  const { username } = req.body;
  if (!username || !username.trim())
    return res.status(400).json({ message: "Username required" });

  const users = readJSON(MAIN_USERS_FILE);
  if (users.includes(username))
    return res.status(400).json({ message: "User already exists" });

  users.push(username);
  writeJSON(MAIN_USERS_FILE, users);
  res.json({ message: "Account created", username });
});

// Get all users
app.get("/users", (req, res) => {
  res.json(readJSON(MAIN_USERS_FILE));
});

// Create post
app.post("/posts", (req, res) => {
  const { username, content, image } = req.body;
  if (!username)
    return res.status(400).json({ message: "Username required" });

  const posts = readJSON(MAIN_POSTS_FILE);
  const newPost = { username, content: content || "", image: image || null, comments: [] };
  posts.unshift(newPost);
  writeJSON(MAIN_POSTS_FILE, posts);

  res.json(newPost);
});

// Get all posts
app.get("/posts", (req, res) => {
  res.json(readJSON(MAIN_POSTS_FILE));
});

// Add comment
app.post("/posts/comment", (req, res) => {
  const { index, comment } = req.body;
  const posts = readJSON(MAIN_POSTS_FILE);

  if (!posts[index]) return res.status(404).json({ message: "Post not found" });
  if (!comment || !comment.trim()) return res.status(400).json({ message: "Comment required" });

  posts[index].comments.push(comment);
  writeJSON(MAIN_POSTS_FILE, posts);

  res.json({ message: "Comment added" });
});

// ---- TUTORIALS TIMELINE ----
// Create tutorial user
app.post("/tutorials/users", (req, res) => {
  const { username } = req.body;
  if (!username || !username.trim())
    return res.status(400).json({ message: "Username required" });

  const users = readJSON(TUT_USERS_FILE);
  if (users.includes(username))
    return res.status(400).json({ message: "User already exists" });

  users.push(username);
  writeJSON(TUT_USERS_FILE, users);
  res.json({ message: "Tutorial user created", username });
});

// Get all tutorial users
app.get("/tutorials/users", (req, res) => {
  res.json(readJSON(TUT_USERS_FILE));
});

// Create tutorial post
app.post("/tutorials/posts", (req, res) => {
  const { username, content, image } = req.body;
  if (!username)
    return res.status(400).json({ message: "Username required" });

  const posts = readJSON(TUT_POSTS_FILE);
  const newPost = { username, content: content || "", image: image || null, comments: [] };
  posts.unshift(newPost);
  writeJSON(TUT_POSTS_FILE, posts);

  res.json(newPost);
});

// Get all tutorial posts
app.get("/tutorials/posts", (req, res) => {
  res.json(readJSON(TUT_POSTS_FILE));
});

// Add comment to tutorial post
app.post("/tutorials/posts/comment", (req, res) => {
  const { index, comment } = req.body;
  const posts = readJSON(TUT_POSTS_FILE);

  if (!posts[index]) return res.status(404).json({ message: "Post not found" });
  if (!comment || !comment.trim()) return res.status(400).json({ message: "Comment required" });

  posts[index].comments.push(comment);
  writeJSON(TUT_POSTS_FILE, posts);

  res.json({ message: "Comment added" });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
