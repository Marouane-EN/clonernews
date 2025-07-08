
const notification = document.getElementById('notification')
const showButton = document.getElementById('showUpdates')
const posts = document.getElementById('posts')
const loadMore = document.getElementById('loadMore')
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
let maxPost
let LastID
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

async function getData(LastID) {
  // let LastID 
  const data = []
  if (LastID == undefined){
    LastID = await fetchLastId()
  }
  let i = LastID
  while (data.length < 30) {
    const item = await fetchItem(i)
    if (item.type !== "comment" && item.type !== "pollopt") {
      data.push(item)
    }
    i--
  }
  let t = {LastID, data}
  console.log(t.LastID);
  
  return t
}


function display(data) {
  // data is array of object
  for (let i in data) {
    let newPost = document.createElement('div')
    newPost.classList.add('onePost')
    if (data[i].by != undefined){
      newPost.innerHTML += `
      <h4>${data[i].by}</h4>
      `
    }
    newPost.innerHTML += `
    <h3>${data[i].title}</h3>
    `
    
    if (data[i].text != undefined) {
      if (data[i].url != undefined) {
        // newPost.innerHTML += `<p>${data[i].text}</p>`
      newPost.innerHTML += `<a href = ${data[i].url}>${data[i].text}</a>`
    }
      newPost.innerHTML += `<p>${data[i].text}</p>`
    }
    if (data[i].score != undefined) {
      newPost.innerHTML += `<h6>${data[i].score}}</h6>`
    }
    if (data[i].time != undefined) {
      newPost.innerHTML += `<h6>${data[i].time}}</h6>`
    }
    posts.append(newPost)
  }
}

async function fetchData(LastID) {
  try {
    const response = await getData(LastID);
    display(response.data)

  } catch (error) {
    console.error("Error fetching or parsing data:", error);
  }
}

fetchData(LastID)

  setInterval(async ()=>{
     let t = await fetchLastId()
     if (t > maxPost){
      maxPost = t
      // add update logic ----> Anas
     }
  }, 2000)

async function updateMaxPost() {
  const t = await getData();
  maxPost = t.LastID
}

updateMaxPost()

loadMore.addEventListener('click',async ()=>{
  // console.log(LastID);
  const t = await getData();
  LastID = t.LastID
  LastID = LastID - 30
  maxPost = t.LastID
  console.log(LastID);
  
  
  fetchData(LastID)
})


