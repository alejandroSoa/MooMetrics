importScripts(
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
);
importScripts(
    'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js',
);

firebase.initializeApp({
    apiKey: "AIzaSyAwBzQx7KfK50G-TQKB-Oh9S9PQ-NfQ8IY",
    authDomain: "moometrics-e1351.firebaseapp.com",
    projectId: "moometrics-e1351",
    storageBucket: "moometrics-e1351.firebasestorage.app",
    messagingSenderId: "963584776972",
    appId: "1:963584776972:web:fc8639c238f534ce4f4729"
  })

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification?.title || 'Nueva notificación';
    const notificationOptions = {
        body: payload.notification?.body || 'Tienes una nueva notificación.',
        icon: '/assets/icons/icon-72x72.png',
        data: payload.data,
        actions: [
            { action: "open_url", title: "Abrir" },
        ],
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});