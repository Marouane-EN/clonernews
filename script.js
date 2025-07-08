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
  const data = [];

  let currentId = await fetchLastId();
  if (id) {
    currentId = id;
  }
  while (data.length < 30) {
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
        data.push(result.value);
        if (data.length === 30) break; // Early exit for performance
      }
    }
  }
  console.log(data);

  LastID = data[data.length - 1].id;
  return data;
}

function display(data) {
  // data is array of object

  for (let i = 0; i < data.length; i++) {
    let newPost = document.createElement("div");
    newPost.classList.add("onePost");
    if (data[i].by != undefined) {
      newPost.innerHTML += `
      <h4>${data[i].by}</h4>
      `;
    }
    newPost.innerHTML += `
    <h1>${data[i].type}</h1>
    <h3>${data[i].title}</h3>
    `;

    if (data[i].text != undefined) {
      if (data[i].url != undefined) {
        // newPost.innerHTML += `<p>${data[i].text}</p>`
        newPost.innerHTML += `<a href = ${data[i].url}>${data[i].text}</a>`;
      }
      newPost.innerHTML += `<p>${data[i].text}</p>`;
    }
    if (data[i].score != undefined) {
      newPost.innerHTML += `<h6>score: ${data[i].score}</h6>`;
    }
    if (data[i].time != undefined) {
      newPost.innerHTML += `<h6>time: ${data[i].time}</h6>`;
    }
    posts.append(newPost);
  }
}

async function fetchData(LastID) {
  try {
    const response = await getData(LastID);
    maxPost = LastID;
    display(response);
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
