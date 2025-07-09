let maxPost;
let LastID;
let count = 0;
const notification = document.getElementById("notification");
const showButton = document.getElementById("showUpdates");
const posts = document.getElementById("posts");
const loadMore = document.getElementById("loadMore");
let previousItemIds = [];

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error ${response.status}`);
  return await response.json();
}

async function fetchLastId() {
  return fetchJSON("https://hacker-news.firebaseio.com/v0/maxitem.json");
}

async function fetchItem(id) {
  return fetchJSON(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
}

async function getData(id) {
  let data = 0;

  let currentId = await fetchLastId();
  if (id) {
    currentId = id;
  }
  while (data < 30) {
    const batchSize = 40; // Slightly larger batch for better coverage
    const ids = Array.from({ length: batchSize }, (_, i) => currentId - i);
    currentId -= batchSize;

    const results = await Promise.allSettled(ids.map(fetchItem));

    for (const result of results) {
      if (
        result.status === "fulfilled" &&
        result.value &&
        !result.value.deleted &&
        !result.value.dead &&
        result.value.type !== "comment" &&
        result.value.type !== "pollopt"
      ) {
        count++;
        display(result.value);
        data++;
        if (data === 30) {
          LastID = result.value.id;
          loadMore.style.display = "block";
          break;
        }
      }
    }
  }
}

function formatDate(s) {
  // Convert to milliseconds by multiplying by 1000
  const date = new Date(s * 1000);

  // Convert to a readable string
  return date.toLocaleString();
}

async function getCommentLength(array) {
  let coun = 0;
  if (array) {
    for (let i = 0; i < array.length; i++) {
      const item = await fetchItem(array[i]);
      if (!item.deleted && !item.dead) {
        coun++;
      }
    }
  }
  return coun;
}

async function display(data) {
  let newPost = document.createElement("div");
  newPost.id = data.id;
  newPost.classList.add("post");
  posts.append(newPost);
  const postHeader = document.createElement("div");
  postHeader.classList.add("post-heade");
  newPost.append(postHeader);
  postHeader.innerHTML = `
  <span class="post-rank">${count}.</span>
        <div>
          <a href="${data.url ?? ""}" class="post-title">${data.title ?? ""}</a>
          <span class="post-domain">${data.type}</span>
        </div>
        <div>
          
          <span>${data.text ?? ""}</span>
        </div>
  `;
  const postMeta = document.createElement("div");
  postMeta.classList.add("post-meta");
  newPost.append(postMeta);
  postMeta.innerHTML = `
        <span class="post-score">${data.score ?? ""} points</span>
        <span>by ${data.by ?? "anonymous"}</span>
        <span>${formatDate(data.time)}</span>
        <span class="comments">${await getCommentLength(
          data.kids
        )} comments</span>
  `;

  const commentsEl = postMeta.querySelector(".comments");
  commentsEl.dataset.clicked = false;

  if (commentsEl) {
    commentsEl.addEventListener("click", async () => {
      const parentPost = commentsEl.closest(".post");
      const postId = parentPost.id;
      console.log(postId);
      const item = await fetchItem(postId);

      if (commentsEl.dataset.clicked === "false" && item.kids) {
        const comments = document.createElement("div");
        newPost.append(comments);
        comments.className = "comment";
        for (let i = 0; i < item.kids.length; i++) {
          const commentData = await fetchItem(item.kids[i]);

          if (!commentData.deleted && !commentData.dead) {
            comments.innerHTML += `
            <span>by ${commentData.by ?? "anonymous"}</span><br>
            <span>${commentData.text ?? ""}</span><br>
            <span>${formatDate(commentData.time)}</span>
            `;
          }
        }
      }
      commentsEl.dataset.clicked = true;
    });
  }
}

async function fetchData(LastID) {
  try {
    console.log(1);
    
    await getData(LastID);
  } catch (error) {
    console.error("Error fetching or parsing data:", error);
  }
}

// Load initial posts
fetchData(LastID);

// Poll for new posts every 2 seconds
let notif = document.getElementById('notification-badge')
let n = document.createElement('span')
setInterval(async () => {
  try {
    let latest = await fetchLastId();
    if (!maxPost) maxPost = latest;

    if (latest > maxPost) {
      maxPost = latest;
      notif.append(n)
      n.innerHTML = "New stuff !!"
      notification.classList.remove("hidden");
    }
  } catch (err) {
    console.error("Failed to check for new posts:", err);
  }
}, 2000);

// Show button event — reload content
showButton.addEventListener("click", async () => {
  notification.classList.add("hidden");
  posts.innerHTML = ""; // Clear old posts
  await fetchData(); // Fetch fresh data from maxPost
});

function debounce(func, delay) {
  let time = null;
  return (...args) => {
    if (time) {
      clearTimeout(time);
    }
    time = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

loadMore.addEventListener(
  "click",
  debounce(() => {
    LastID = LastID - 30;
    maxPost = LastID;
    console.log("Loading more from ID:", LastID);
    fetchData(LastID);
  }, 5000)
);
