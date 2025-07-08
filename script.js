let maxPost;
let LastID;

const notification = document.getElementById("notification");
const showButton = document.getElementById("showUpdates");
const posts = document.getElementById("posts");
const loadMore = document.getElementById("loadMore");
let previousItemIds = [];

// async function checkForUpdates() {
//   try {
//     const updates = await fetchJSON(UPDATES_URL)
//     const currentIds = updates.items || []

//     const isDifferent = arraysAreDifferent(currentIds, previousItemIds)

//     if (isDifferent) {
//       notification.classList.remove('hidden')
//       previousItemIds = currentIds
//     }
//   } catch (err) {
//     console.error('Error fetching updates:', err)
//   }
// }
// function arraysAreDifferent(arr1, arr2) {
//   if (arr1.length !== arr2.length) return true

//   for (let i = 0; i < arr1.length; i++) {
//     if (arr1[i] !== arr2[i]) {
//       return true
//     }
//   }

//   return false
// }
// setInterval(checkForUpdates, 5000)
// showButton.addEventListener('click', async () => {
//   notification.classList.add('hidden')

//   //
// })
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
        } // Early exit for performance
      }
    }
  }
}

function display(data) {
  // data is array of object

  let newPost = document.createElement("div");
  newPost.classList.add("onePost");
  if (data.by != undefined) {
    newPost.innerHTML += `
      <h4>${data.by}</h4>
      `;
  }
  newPost.innerHTML += `
    <h1>${data.type}</h1>
    <h3>${data.title}</h3>
    `;

  if (data.text != undefined) {
    if (data.url != undefined) {
      // newPost.innerHTML += `<p>${data.text}</p>`
      newPost.innerHTML += `<a href = ${data.url}>${data.text}</a>`;
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

fetchData(LastID);

setInterval(async () => {
  let t = await fetchLastId();
  if (t > maxPost) {
    maxPost = t;
    // add update logic ----> Anas
  }
}, 2000);
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
    // console.log(LastID);

    LastID = LastID - 30;
    maxPost = LastID;
    console.log(LastID);

    fetchData(LastID);
  }, 16000)
);
