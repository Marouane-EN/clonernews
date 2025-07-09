let maxPost;
let LastID;

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
        result.value.type !== "comment" &&
        result.value.type !== "pollopt"
      ) {
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

function display(data) {
  let newPost = document.createElement("div");
  newPost.classList.add("onePost");
  if (data.by != undefined) {
    newPost.innerHTML += `<h4>${data.by}</h4>`;
  }
  newPost.innerHTML += `
    <h1>${data.type}</h1>
    <h3>${data.title}</h3>
  `;

  if (data.text != undefined) {
    if (data.url != undefined) {
      newPost.innerHTML += `<a href="${data.url}">${data.text}</a>`;
    }
    newPost.innerHTML += `<p>${data.text}</p>`;
  }
  if (data.score != undefined) {
    newPost.innerHTML += `<h6>score: ${data.score}</h6>`;
  }
  if (data.time != undefined) {
    newPost.innerHTML += `<h6>time: ${data.time}</h6>`;
  }
  posts.append(newPost);
}

async function fetchData(LastID) {
  try {
    await getData(LastID);
  } catch (error) {
    console.error("Error fetching or parsing data:", error);
  }
}

// Load initial posts
fetchData(LastID);

// Poll for new posts every 2 seconds
setInterval(async () => {
  try {
    let latest = await fetchLastId();
    if (!maxPost) maxPost = latest;

    if (latest > maxPost) {
      maxPost = latest;
      notification.classList.remove("hidden");
    }
  } catch (err) {
    console.error("Failed to check for new posts:", err);
  }
}, 2000);

// Show button event — reload content
showButton.addEventListener("click", async () => {
  notification.classList.add("hidden");
  posts.innerHTML = "";      // Clear old posts
  await fetchData();         // Fetch fresh data from maxPost
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
  }, 16000)
);
