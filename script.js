‎let uploadedImage = null;
‎let username = "";
‎let posts = []; // loaded from poststut.json
‎let users = []; // loaded from userst.json
‎
‎// On page load
‎document.addEventListener("DOMContentLoaded", () => {
‎  const continueBtn = document.getElementById("continueBtn");
‎  if (continueBtn) {
‎    const nameInput = document.getElementById("username");
‎    continueBtn.addEventListener("click", () => {
‎      const name = nameInput.value.trim();
‎      if (!name) return alert("Enter a username");
‎      // redirect to timeline with username query
‎      window.location.href = "tutorials.html?user=" + encodeURIComponent(name);
‎    });
‎    return;
‎  }
‎
‎  // if no continue button -> timeline page
‎  initTimeline();
‎});
‎
‎// Timeline init
‎async function initTimeline() {
‎  const params = new URLSearchParams(window.location.search);
‎  username = params.get("user") || "Guest";
‎
‎  const welcomeEl = document.getElementById("welcome");
‎  if (welcomeEl) welcomeEl.textContent = `Post Your Website`;
‎
‎  const navUsername = document.getElementById("navUsername");
‎  if (navUsername) navUsername.textContent = username;
‎
‎  setupImageUpload();
‎  setupPostButton();
‎
‎  await Promise.all([loadUsers(), loadPosts()]);
‎
‎  const searchInput = document.getElementById("searchInput");
‎  if (searchInput) {
‎    searchInput.addEventListener("input", () => {
‎      const query = searchInput.value.toLowerCase();
‎      renderPosts(query);
‎    });
‎  }
‎}
‎
‎// Load users from userst.json
‎async function loadUsers() {
‎  try {
‎    const res = await fetch("user.json");
‎    users = await res.json();
‎  } catch (err) {
‎    console.error("Failed to load users:", err);
‎  }
‎}
‎
‎// Load posts from poststut.json
‎async function loadPosts() {
‎  try {
‎    const res = await fetch("posts.json");
‎    posts = await res.json();
‎    renderPosts();
‎  } catch (err) {
‎    console.error("Failed to load posts:", err);
‎  }
‎}
‎
‎// Image upload for posts
‎function setupImageUpload() {
‎  const inputFile = document.getElementById("input-file");
‎  const imgView = document.getElementById("img-view");
‎  if (!inputFile || !imgView) return;
‎
‎  imgView.addEventListener("click", () => inputFile.click());
‎
‎  inputFile.addEventListener("change", () => {
‎    const file = inputFile.files[0];
‎    if (!file) return;
‎
‎    const reader = new FileReader();
‎    reader.onload = () => {
‎      uploadedImage = reader.result;
‎      imgView.innerHTML = `<img src="${uploadedImage}" style="max-width:100%; display:block;">`;
‎    };
‎    reader.readAsDataURL(file);
‎  });
‎}
‎
‎// Post button
‎function setupPostButton() {
‎  const postBtn = document.getElementById("postBtn");
‎  if (!postBtn) return;
‎
‎  postBtn.addEventListener("click", () => {
‎    addPost();
‎    renderPosts();
‎  });
‎}
‎
‎// Add new post (locally)
‎function addPost() {
‎  const contentEl = document.getElementById("postContent");
‎  const content = contentEl.value.trim();
‎  if (!content && !uploadedImage) return;
‎
‎  const newPost = {
‎    username,
‎    content,
‎    image: uploadedImage,
‎    comments: []
‎  };
‎
‎  posts.unshift(newPost); // add to posts array
‎  contentEl.value = "";
‎  uploadedImage = null;
‎
‎  const imgView = document.getElementById("img-view");
‎  if (imgView) {
‎    imgView.innerHTML = `
‎      <img src="drop.png">
‎      <p>Click here to upload an image</p>
‎      <span>Upload any image from desktop</span>
‎    `;
‎  }
‎}
‎
‎// Render posts and users
‎function renderPosts(query = "") {
‎  const timeline = document.getElementById("timeline");
‎  if (!timeline) return;
‎
‎  timeline.innerHTML = "";
‎
‎  // filter posts by search query
‎  const filteredPosts = posts.filter(post => {
‎    const usernameMatch = post.username.toLowerCase().includes(query);
‎    const contentMatch = (post.content || "").toLowerCase().includes(query);
‎    return usernameMatch || contentMatch;
‎  });
‎
‎  // users without posts
‎  const usersWithoutPosts = users
‎    .filter(u => u.toLowerCase().includes(query))
‎    .filter(u => !filteredPosts.some(p => p.username === u));
‎
‎  // render posts
‎  filteredPosts.forEach((post, index) => {
‎    const div = document.createElement("div");
‎    div.className = "post";
‎    const comments = post.comments || [];
‎    div.innerHTML = `
‎      <strong>${post.username}</strong>
‎      ${post.content ? `<p>${post.content}</p>` : ""}
‎      ${post.image ? `<img src="${post.image}" style="max-width:100%; display:block;">` : ""}
‎      <input type="text" id="comment-${index}" placeholder="Write a comment">
‎      <button onclick="addComment(${index})">Comment</button>
‎      <div class="comments">
‎        ${comments.map(c => `<div class="comment">💬 ${c}</div>`).join("")}
‎      </div>
‎      <hr>
‎    `;
‎    timeline.appendChild(div);
‎  });
‎
‎  // render users without posts
‎  usersWithoutPosts.forEach(user => {
‎    const div = document.createElement("div");
‎    div.className = "post empty-post";
‎    div.innerHTML = `<strong>${user}</strong> <p><em>No posts yet</em></p><hr>`;
‎    timeline.appendChild(div);
‎  });
‎}
‎
‎// Add comment
‎function addComment(index) {
‎  const input = document.getElementById(`comment-${index}`);
‎  if (!input || !input.value.trim()) return;
‎
‎  posts[index].comments.push(input.value.trim());
‎  renderPosts();
‎  input.value = "";
‎}
‎