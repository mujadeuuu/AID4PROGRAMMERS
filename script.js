let uploadedImage = null;
‎let username = "";
‎let posts = [];   // from posts.json
‎let users = [];   // from users.json (ARRAY OF STRINGS)
‎
‎const API = "http://localhost:3000/";
‎
‎// PAGE LOAD
‎document.addEventListener("DOMContentLoaded", () => {
‎  const continueBtn = document.getElementById("continueBtn");
‎
‎  // INDEX PAGE
‎  if (continueBtn) {
‎    const nameInput = document.getElementById("username");
‎
‎    continueBtn.addEventListener("click", async () => {
‎      const name = nameInput.value.trim();
‎      if (!name) return alert("Enter a username");
‎
‎      try {
‎        await fetch(${API}/users, {
‎          method: "POST",
‎          headers: { "Content-Type": "application/json" },
‎          body: JSON.stringify({ username: name })
‎        });
‎      } catch (err) {
‎        console.error("User creation failed:", err);
‎      }
‎
‎      window.location.href =
‎        "timeline.html?user=" + encodeURIComponent(name);
‎    });
‎
‎    return;
‎  }
‎
‎  initTimeline();
‎});
‎
‎// INIT TIMELINE
‎async function initTimeline() {
‎  const params = new URLSearchParams(window.location.search);
‎  username = params.get("user") || "Guest";
‎
‎  const welcomeEl = document.getElementById("welcome");
‎  if (welcomeEl) welcomeEl.textContent = Welcome, ${username}!;
‎
‎  const navUsername = document.getElementById("navUsername");
‎  if (navUsername) navUsername.textContent = username;
‎
‎  setupImageUpload();
‎  setupPostButton();
‎
‎  await Promise.all([loadUsers(), loadPosts()]);
‎
‎  const searchInput = document.getElementById("searchInput");
‎  if (searchInput) {
‎    searchInput.addEventListener("input", () => {
‎      renderPosts(searchInput.value.toLowerCase());
‎    });
‎  }
‎}
‎
‎// LOAD USERS (array of strings)
‎async function loadUsers() {
‎  try {
‎    const res = await fetch(${API}/users);
‎    users = await res.json();
‎    console.log("Users:", users);
‎  } catch (err) {
‎    console.error("Failed to load users:", err);
‎  }
‎}
‎
‎// LOAD POSTS
‎async function loadPosts() {
‎  try {
‎    const res = await fetch(${API}/posts);
‎    posts = await res.json();
‎    console.log("Posts:", posts);
‎    renderPosts();
‎  } catch (err) {
‎    console.error("Failed to load posts:", err);
‎  }
‎}
‎
‎// IMAGE UPLOAD
‎function setupImageUpload() {
‎  const inputFile = document.getElementById("input-file");
‎  const imgView = document.getElementById("img-view");
‎  if (!inputFile || !imgView) return;
‎
‎  imgView.addEventListener("click", () => inputFile.click());
‎
‎  inputFile.addEventListener("change", () => {
‎    const file = inputFile.files[0];
‎    if (!file) return;
‎
‎    const reader = new FileReader();
‎    reader.onload = () => {
‎      uploadedImage = reader.result;
‎      imgView.innerHTML = <img src="${uploadedImage}" style="max-width:100%; display:block;">;
‎    };
‎    reader.readAsDataURL(file);
‎  });
‎}
‎
‎// POST BUTTON
‎function setupPostButton() {
‎  const postBtn = document.getElementById("postBtn");
‎  if (!postBtn) return;
‎
‎  postBtn.addEventListener("click", addPost);
‎}
‎
‎// ADD POST
‎function addPost() {
‎  const contentEl = document.getElementById("postContent");
‎  const content = contentEl.value.trim();
‎  if (!content && !uploadedImage) return;
‎
‎  fetch(${API}/posts, {
‎    method: "POST",
‎    headers: { "Content-Type": "application/json" },
‎    body: JSON.stringify({
‎      username,
‎      content,
‎      image: uploadedImage
‎    })
‎  }).then(() => loadPosts());
‎
‎  contentEl.value = "";
‎  uploadedImage = null;
‎
‎  const imgView = document.getElementById("img-view");
‎  if (imgView) {
‎    imgView.innerHTML = `
‎      <img src="drop.png">
‎      <p>Click here to upload an image</p>
‎      <span>Upload any image from desktop</span>
‎    `;
‎  }
‎}
‎
‎// RENDER POSTS (INDEX-SAFE)
‎function renderPosts(query = "") {
‎  const timeline = document.getElementById("timeline");
‎  if (!timeline) return;
‎
‎  timeline.innerHTML = "";
‎
‎  posts.forEach((post, index) => {
‎    const postUser = post.username;
‎    const postContent = post.content || "";
‎    const postImage = post.image || "";
‎    const comments = post.comments || [];
‎
‎    if (
‎      query &&
‎      !postUser.toLowerCase().includes(query) &&
‎      !postContent.toLowerCase().includes(query)
‎    ) return;
‎
‎    const div = document.createElement("div");
‎    div.className = "post";
‎
‎    div.innerHTML = `
‎      <strong>${postUser}</strong>
‎      ${postContent ? <p>${postContent}</p> : ""}
‎      ${postImage ? <img src="${postImage}" style="max-width:100%; display:block;"> : ""}
‎      <input type="text" id="comment-${index}" placeholder="Write a comment">
‎      <button onclick="addComment(${index})">Comment</button>
‎      <div class="comments">
‎        ${comments.map(c => <div class="comment">💬 ${c}</div>).join("")}
‎      </div>
‎      <hr>
‎    `;
‎
‎    timeline.appendChild(div);
‎  });
‎
‎  // USERS WITH NO POSTS
‎  users.forEach(user => {
‎    const hasPost = posts.some(p => p.username === user);
‎    if (!hasPost && (!query || user.toLowerCase().includes(query))) {
‎      const div = document.createElement("div");
‎      div.className = "post empty-post";
‎      div.innerHTML = `
‎        <strong>${user}</strong>
‎        <p><em>No posts yet</em></p>
‎        <hr>
‎      `;
‎      timeline.appendChild(div);
‎    }
‎  });
‎}
‎
‎// ADD COMMENT (SERVER INDEX-BASED)
‎function addComment(index) {
‎  const input = document.getElementById(comment-${index});
‎  if (!input || !input.value.trim()) return;
‎
‎  fetch(${API}/posts/comment, {
‎    method: "POST",
‎    headers: { "Content-Type": "application/json" },
‎    body: JSON.stringify({
‎      index,
‎      comment: input.value.trim()
‎    })
‎  }).then(() => loadPosts());
‎
‎  input.value = "";
‎}
