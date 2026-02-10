let uploadedImage = null;
let username = "";
let posts = []; // loaded from poststut.json
let users = []; // loaded from userst.json 

const API =
  location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://aid4programmers.onrender.com";

// On page load
document.addEventListener("DOMContentLoaded", () => {
  const continueBtn = document.getElementById("continueBtn");
  if (continueBtn) {
    const nameInput = document.getElementById("username");
    continueBtn.addEventListener("click", () => {
      const name = nameInput.value.trim();
      if (!name) return alert("Enter a username");
      // redirect to timeline with username query
      window.location.href = "tutorials.html?user=" + encodeURIComponent(name);
    });
    return;
  }

  // if no continue button -> timeline page
  initTimeline();
});

// Timeline init
async function initTimeline() {
  const params = new URLSearchParams(window.location.search);
  username = params.get("user") || "Guest";

  console.log("Timeline username:", username); // Debug

  // Update welcome message
  const welcomeEl = document.getElementById("welcome");
  if (welcomeEl) welcomeEl.textContent = `Welcome, ${username}!`;

  const navUsername = document.getElementById("navUsername");
  if (navUsername) navUsername.textContent = username;

  setupImageUpload();
  setupPostButton();

  // Load users and posts from server
  await Promise.all([loadUsers(), loadPosts()]);

  // Setup search input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      renderPosts(query);
    });
  }

  // Render all posts initially
  renderPosts();
}


// Load users from userst.json
async function loadUsers() {
  try {
    const res = await fetch("tutser.json");
    users = await res.json();
  } catch (err) {
    console.error("Failed to load users:", err);
  }
}

// Load posts from poststut.json
async function loadPosts() {
  try {
    const res = await fetch("tutorialspt.json");
    posts = await res.json();
    renderPosts();
  } catch (err) {
    console.error("Failed to load posts:", err);
  }
}

// Image upload for posts
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
      uploadedImage = reader.result;
      imgView.innerHTML = `<img src="${uploadedImage}" style="max-width:100%; display:block;">`;
    };
    reader.readAsDataURL(file);
  });
}

// Post button
function setupPostButton() {
  const postBtn = document.getElementById("postBtn");
  if (!postBtn) return;

  postBtn.addEventListener("click", () => {
    addPost();
    renderPosts();
  });
}

// Add new post (locally)
function addPost() {
  const contentEl = document.getElementById("postContent");
  const content = contentEl.value.trim();
  if (!content && !uploadedImage) return;

  const newPost = {
    username,
    content,
    image: uploadedImage,
    comments: []
  };

  posts.unshift(newPost); // add to posts array
  contentEl.value = "";
  uploadedImage = null;

  const imgView = document.getElementById("img-view");
  if (imgView) {
    imgView.innerHTML = `
      <img src="drop.png">
      <p>Click here to upload an image</p>
      <span>Upload any image from desktop</span>
    `;
  }
}

// Render posts and users
function renderPosts(query = "") {
  const timeline = document.getElementById("timeline");
  if (!timeline) return;

  timeline.innerHTML = "";

  // Render all posts
  posts.forEach((post, index) => {
    const postUser = post.username || "Unknown";
    const postContent = post.content || "";
    const postImage = post.image || "";
    const comments = post.comments || [];

    // Filter by search query (optional)
    if (
      query &&
      !postUser.toLowerCase().includes(query) &&
      !postContent.toLowerCase().includes(query)
    ) return;

    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      <strong>${postUser}</strong>

      ${postContent ? `<p>${postContent}</p>` : ""}

      ${
        postImage
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

  // Render users with no posts
  users.forEach(user => {
    const hasPost = posts.some(p => p.username === user);
    if (!hasPost && (!query || user.toLowerCase().includes(query))) {
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

// Add comment
function addComment(index) {
  const input = document.getElementById(`comment-${index}`);
  if (!input || !input.value.trim()) return;

  posts[index].comments.push(input.value.trim());
  renderPosts();
  input.value = "";
}


