self.addEventListener('push', async (event) => {
  const data = await event.data.json()
  console.log(data)
  const options = {
    body: data.body,
    vibrate: data.vibrate
  }
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})