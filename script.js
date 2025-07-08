
const notification = document.getElementById('notification')
const showButton = document.getElementById('showUpdates')
const posts = document.getElementsByClassName('posts')

let previousItemIds = []

async function checkForUpdates() {
  try {
    const updates = await fetchJSON(UPDATES_URL)
    const currentIds = updates.items || []

    const isDifferent = arraysAreDifferent(currentIds, previousItemIds)


    if (isDifferent) {
      notification.classList.remove('hidden')
      previousItemIds = currentIds
    }
  } catch (err) {
    console.error('Error fetching updates:', err)
  }
}
function arraysAreDifferent(arr1, arr2) {
  if (arr1.length !== arr2.length) return true

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return true
    }
  }

  return false
}
setInterval(checkForUpdates, 5000)
showButton.addEventListener('click', async () => {
  notification.classList.add('hidden')

  //
})


let stories = fetch('https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty')
  .then((value) => value.json())
let jobs = fetch('https://hacker-news.firebaseio.com/v0/jobstories.json?print=pretty')
  .then((value) => value.json())


async function show(id) {
  let tmp = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`)
  let infos = tmp.json()
  let newPost = document.createElement('div')
  posts.appendChild(newPost)

  newPost.innerHTML = `
    <a href="${infos.url}">${infos.title}</a>
    <p>${infos.text}</p>
    <p>${infos.score}</p>
    <p>${infos.time}</p>
    `
}