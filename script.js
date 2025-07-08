
const notification = document.getElementById('notification')
const showButton = document.getElementById('showUpdates')
const posts = document.getElementsByClassName('posts')
let previousItemIds = []

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

async function fetchLastId() {
  let data
  try {
    const response = await fetch("https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty")
    if (!response.ok) {
      throw new Error("Error");

    }
    data = await response.json()
    if (data.error) {
      throw new Error("data.error");
    }

    return data


  } catch (error) {
    throw error
  }
}
async function fetchItem(id) {
  let data
  try {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`)
    if (!response.ok) {
      throw new Error("Error");

    }
    data = await response.json()
    if (data.error) {
      throw new Error("data.error");
    }
    return data

  } catch (error) {
    throw error
  }
}
async function getData() {
  const data = []
  let LastID = await fetchLastId()
  let i = LastID
  while (data.length < 30) {
    const item = await fetchItem(i)
    if (item.type !== "comment" && item.type !== "pollopt") {
      data.push(item)
    }
    i--
  }

}

getData()