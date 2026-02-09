const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, "users.json");
const POSTS_FILE = path.join(__dirname, "posts.json");

// ===== HELPER FUNCTIONS =====
function readJSON(file) {
  try {
    const data = fs.readFileSync(file, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ===== CREATE ACCOUNT =====
app.post("/users", (req, res) => {
  const { username } = req.body;
  if (!username || username.trim() === "") return res.status(400).json({ message: "Username required" });

  const users = readJSON(USERS_FILE);
  if (users.includes(username)) return res.status(400).json({ message: "User already exists" });

  users.push(username);
  writeJSON(USERS_FILE, users);

  res.json({ message: "Account created", username });
});

// ===== GET ALL USERS =====
app.get("/users", (req, res) => {
  const users = readJSON(USERS_FILE);
  res.json(users);
});

// ===== CREATE POST =====
app.post("/posts", (req, res) => {
  const { username, content, image } = req.body;
  if (!username) return res.status(400).json({ message: "Username required" });

  const posts = readJSON(POSTS_FILE);
  const newPost = { username, content: content || "", image: image || null, comments: [] };
  posts.unshift(newPost);
  writeJSON(POSTS_FILE, posts);

  res.json(newPost);
});

// ===== GET ALL POSTS =====
app.get("/posts", (req, res) => {
  const posts = readJSON(POSTS_FILE);
  res.json(posts);
});

// ===== ADD COMMENT =====
app.post("/posts/comment", (req, res) => {
  const { index, comment } = req.body;
  const posts = readJSON(POSTS_FILE);

  if (!posts[index]) return res.status(404).json({ message: "Post not found" });
  if (!comment || comment.trim() === "") return res.status(400).json({ message: "Comment required" });

  posts[index].comments.push(comment);
  writeJSON(POSTS_FILE, posts);

  res.json({ message: "Comment added" });
});

// ===== START SERVER =====
app.listen(3000, () => console.log("Server running at http://localhost:3000"));
