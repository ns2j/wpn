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

const setStatus = (message, isError = false) => {
  const el = document.getElementById('status');
  if (!el) {
    if (isError) {
      alert(message);
    }
    return;
  }
  el.textContent = message;
  el.style.color = isError ? '#c00' : '#080';
}

subscribe = async () => {
  setStatus('Subscribing...');

  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('This browser does not support Web Push');
    }

    const registration = await navigator.serviceWorker.ready;

    // Unsubscribe existing subscription if any
    let subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('Unsubscribed old subscription');
    }

    // Fetch VAPID public key
    const response = await fetch('./api/publickey');
    if (!response.ok) {
      throw new Error('Failed to get public key (' + response.status + ')');
    }
    const publicKeyJson = await response.json();
    const vapidPublicKey = urlBase64ToUint8Array(publicKeyJson.publicKey);

    // Create new subscription
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    });

    if (!subscription) {
      throw new Error('Failed to create subscription');
    }

    // Register subscription on the server
    const registerRes = await fetch('./api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });

    if (!registerRes.ok) {
      throw new Error('Failed to register subscription (' + registerRes.status + ')');
    }

    console.log(subscription);
    setStatus('Subscribed successfully');

  } catch (e) {
    console.error(e);
    setStatus('Subscription failed: ' + e.message, true);
  }
}

push = async () => {
  setStatus('Sending push...');

  try {
    const res = await fetch('./api/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
      throw new Error('Failed to send push (' + res.status + ')');
    }

    setStatus('Push sent successfully');
  } catch (e) {
    console.error(e);
    setStatus('Push failed: ' + e.message, true);
  }
}
