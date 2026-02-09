let uploadedImage = null;
let username = "";
let posts = []; // stored accounts json
let users = []; // loaded from server
const API = "http://localhost:3000";

// continue button
document.addEventListener("DOMContentLoaded", () => {
  const continueBtn = document.getElementById("continueBtn");

  
  if (continueBtn) {
    const nameInput = document.getElementById("username");
    continueBtn.addEventListener("click", async () => {
      const name = nameInput.value.trim();
      if (!name) return alert("Enter a username");

      try {
        // save to json
        await fetch(`${API}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: name })
        });

        // direct to tl
        window.location.href = "timeline.html?user=" + encodeURIComponent(name);
      } catch (err) {
        console.error(err);
        window.location.href = "timeline.html?user=" + encodeURIComponent(name);
      }
    });

    return; 
  }

  // feed
  initTimeline();
});

async function initTimeline() {
  const params = new URLSearchParams(window.location.search);
  username = params.get("user") || "Guest"; 

  const welcomeEl = document.getElementById("welcome");
  if (welcomeEl) welcomeEl.textContent = `Welcome, ${username}!`;

  const navUsername = document.getElementById("navUsername");
  if (navUsername) navUsername.textContent = username;

  setupImageUpload();
  setupPostButton();

  await Promise.all([loadPosts(), loadUsers()]); // fetch posts + users

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.toLowerCase();
      renderPosts(query);
    });
  }
}

// fetch users
async function loadUsers() {
  try {
    const res = await fetch(`${API}/users`);
    users = await res.json();
  } catch (err) {
    console.error("Failed to load users:", err);
  }
}


// pic post
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

// post butt
function setupPostButton() {
  const postBtn = document.getElementById("postBtn");
  if (!postBtn) return;

  postBtn.addEventListener("click", addPost);
}

// add tp
function addPost() {
  const contentEl = document.getElementById("postContent");
  const content = contentEl.value.trim();
  if (!content && !uploadedImage) return;

  fetch(`${API}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, content, image: uploadedImage })
  })
    .then(() => loadPosts());

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

// post it
async function loadPosts() {
  try {
    const res = await fetch(`${API}/posts`);
    posts = await res.json(); // dito stored be ha 
    renderPosts();
  } catch (err) {
    console.error("Failed to load posts:", err);
  }
}

// post ren
function renderPosts(query = "") {
  const timeline = document.getElementById("timeline");
  if (!timeline) return;

  timeline.innerHTML = "";

  // filter posts
  const filteredPosts = posts.filter(post => {
    const usernameMatch = post.username.toLowerCase().includes(query);
    const contentMatch = (post.content || "").toLowerCase().includes(query);
    return usernameMatch || contentMatch;
  });

  // find users without posts
  const usersWithoutPosts = users
    .filter(u => u.toLowerCase().includes(query)) // match search
    .filter(u => !filteredPosts.some(p => p.username === u)) // exclude users who already have posts

  // render posts
  filteredPosts.forEach((post, index) => {
    const div = document.createElement("div");
    div.className = "post";

    const comments = post.comments || [];
    div.innerHTML = `
      <strong>${post.username}</strong>
      ${post.content ? `<p>${post.content}</p>` : ""}
      ${post.image ? `<img src="${post.image}" style="max-width:100%; display:block;">` : ""}
      <input type="text" id="comment-${index}" placeholder="Write a comment">
      <button onclick="addComment(${index})">Comment</button>
      <div class="comments">
        ${comments.map(c => `<div class="comment">💬 ${c}</div>`).join("")}
      </div>
      <hr>
    `;
    timeline.appendChild(div);
  });

  // render users without posts
  usersWithoutPosts.forEach(user => {
    const div = document.createElement("div");
    div.className = "post empty-post";
    div.innerHTML = `<strong>${user}</strong> <p><em>No posts yet</em></p><hr>`;
    timeline.appendChild(div);
  });
}


// comm
function addComment(index) {
  const input = document.getElementById(`comment-${index}`);
  if (!input || !input.value.trim()) return;

  fetch(`${API}/posts/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ index, comment: input.value.trim() })
  }).then(() => loadPosts());

  input.value = "";
}
