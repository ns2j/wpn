urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
    	 
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
    	 
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
 
subscribe = async () => {
  console.log("subscribe")
  if (!('serviceWorker' in navigator)) {
    alert("navigator.serviceWorker does not exist.")
    return
  }
    	  
  const registration = await navigator.serviceWorker.ready
  const sub = await registration.pushManager.getSubscription()
  const response = await fetch('./api/publickey')
  console.log(response)
  const publicKeyJson = await response.json()
  console.log(publicKeyJson)
  const vapidPublicKey = urlBase64ToUint8Array(publicKeyJson.publicKey)
  console.log(vapidPublicKey)
  try {
    const subscription = await registration.pushManager.subscribe({
	       userVisibleOnly: true,
	       applicationServerKey: vapidPublicKey
	  })
	  if (!subscription)
		  return
    console.log(subscription)
    fetch('./api/register', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(subscription)
    })
  } catch (e) {
    console.log(e)
  }
}
    
push = () => {
  fetch('./api/push', {
         method: 'post',
         headers: {
           'Content-type': 'application/json'
         },
         body: {}
  })
    	   
}
