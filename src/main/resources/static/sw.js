self.addEventListener('push', async (event) => {
  const data = await event.data.json()
  console.log(data)
  const options = {
    body: data.body || '',
    icon: data.icon || './icon-192x192.png',
    badge: data.badge || './icon-192x192.png',
    vibrate: data.vibrate || [100, 50, 100],
    data: data 
  }
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})
