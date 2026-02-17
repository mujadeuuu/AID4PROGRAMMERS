let uploadedImage = null;
let username = "";
let posts = [];
let users = [];

// ================= API =================
const API = "https://aid4programmers.onrender.com";

// ================= PAGE LOAD =================
document.addEventListener("DOMContentLoaded", () => {
  const continueBtn = document.getElementById("continueBtn");

  // ===== INDEX PAGE =====
  if (continueBtn) {
    const nameInput = document.getElementById("username");

    continueBtn.addEventListener("click", async () => {
      const name = nameInput.value.trim();
      if (!name) return alert("Enter a username");

      try {
        const res = await fetch(`${API}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: name })
        });

        if (!res.ok) {
          const data = await res.json();
          return alert(data.message || "Failed to create user");
        }

        // Redirect only on successful user creation
        window.location.href = "timeline.html?user=" + encodeURIComponent(name);
      } catch (err) {
        console.error("User creation failed:", err);
        alert("Server error. Try again.");
      }
    });

    return;
  }

  initTimeline();
});

// ================= INIT TIMELINE =================
async function initTimeline() {
  const params = new URLSearchParams(window.location.search);
  username = params.get("user") || "Guest";

  document.getElementById("welcome")?.textContent = `Welcome, ${username}!`;
  document.getElementById("navUsername")?.textContent = username;

  setupImageUpload();
  setupPostButton();

  await Promise.all([loadUsers(), loadPosts()]);

  const searchInput = document.getElementById("searchInput");
  searchInput?.addEventListener("input", () => {
    renderPosts(searchInput.value.toLowerCase());
  });
}

// ================= LOAD USERS =================
async function loadUsers() {
  try {
    const res = await fetch(`${API}/users`);
    users = await res.json();
  } catch (err) {
    console.error("Failed to load users:", err);
  }
}

// ================= LOAD POSTS =================
async function loadPosts() {
  try {
    const res = await fetch(`${API}/posts`);
    posts = await res.json();
    renderPosts();
  } catch (err) {
    console.error("Failed to load posts:", err);
  }
}

// ================= IMAGE UPLOAD =================
function setupImageUpload() {
  const inputFile = document.getElementById("input-file");
  const imgView = document.getElementById("img-view");
  if (!inputFile || !imgView) return;

  imgView.addEventListener("click", () => inputFile.click());

  inputFile.addEventListener("change", () => {
    const file = inputFile.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      let base64 = reader.result;

      // Optional: truncate very large images to prevent timeline issues
      if (base64.length > 1000000) {
        base64 = base64.slice(0, 1000000);
        console.warn("Image truncated to prevent timeline break");
      }

      uploadedImage = base64;
      imgView.innerHTML = `<img src="${uploadedImage}" style="max-width:100%; display:block;">`;
    };
    reader.readAsDataURL(file);
  });
}

// ================= POST BUTTON =================
function setupPostButton() {
  const postBtn = document.getElementById("postBtn");
  postBtn?.addEventListener("click", addPost);
}

// ================= ADD POST =================
function addPost() {
  const contentEl = document.getElementById("postContent");
  const content = contentEl.value.trim();

  if (!content && !uploadedImage) return;

  fetch(`${API}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, content, image: uploadedImage })
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to add post");
      return res.json();
    })
    .then(() => loadPosts())
    .catch(err => console.error("Post failed:", err));

  // Reset input and image preview
  contentEl.value = "";
  uploadedImage = null;
  const inputFile = document.getElementById("input-file");
  if (inputFile) inputFile.value = "";

  const imgView = document.getElementById("img-view");
  if (imgView) {
    imgView.innerHTML = `
      <img src="drop.png" style="max-width:100%; display:block;">
      <p>Click here to upload an image</p>
      <span>Upload any image from desktop</span>
    `;
  }
}

// ================= RENDER POSTS =================
function renderPosts(query = "") {
  const timeline = document.getElementById("timeline");
  if (!timeline) return;

  timeline.innerHTML = "";

  posts.forEach((post, index) => {
    const postUser = post.username ?? "Unknown";
    const postContent = post.content ?? "";
    const postImage = post.image ?? "";
    const comments = post.comments ?? [];

    if (
      query &&
      !postUser.toLowerCase().includes(query) &&
      !postContent.toLowerCase().includes(query)
    )
      return;

    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      <strong>${postUser}</strong>
      ${postContent ? `<p>${postContent}</p>` : ""}
      ${
        postImage && postImage.startsWith("data:")
          ? `<img src="${postImage}" style="max-width:100%; display:block;">`
          : ""
      }
      <input type="text" id="comment-${index}" placeholder="Write a comment">
      <button onclick="addComment(${index})">Comment</button>
      <div class="comments">
        ${comments.map(c => `<div class="comment">💬 ${c}</div>`).join("")}
      </div>
      <hr>
    `;

    timeline.appendChild(div);
  });

  // Show users with no posts
  users.forEach(user => {
    if (!posts.some(p => p.username === user) && (!query || user.toLowerCase().includes(query))) {
      const div = document.createElement("div");
      div.className = "post empty-post";
      div.innerHTML = `
        <strong>${user}</strong>
        <p><em>No posts yet</em></p>
        <hr>
      `;
      timeline.appendChild(div);
    }
  });
}

// ================= ADD COMMENT =================
function addComment(index) {
  const input = document.getElementById(`comment-${index}`);
  if (!input || !input.value.trim()) return;

  fetch(`${API}/posts/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ index, comment: input.value.trim() })
  })
    .then(() => loadPosts())
    .catch(err => console.error("Comment failed:", err));

  input.value = "";
}
