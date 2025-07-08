
const notification = document.getElementById('notification')
const showButton = document.getElementById('showUpdates')

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
