// Firebase Cloud Messagingのサービスワーカー
// プッシュ通知を受信するために必要

importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// Firebase設定
// 注意: 実際のプロジェクトの値に置き換えてください
firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// バックグラウンドメッセージの処理
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] バックグラウンドメッセージを受信:', payload);
  
  // 通知のカスタマイズ
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png',
    badge: '/badge-96x96.png',
    data: payload.data || {},
    // クリック時のアクション
    actions: [
      {
        action: 'view-app',
        title: 'アプリを開く',
      }
    ]
  };
  
  // 通知を表示
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// 通知がクリックされたときの処理
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] 通知がクリックされました', event);
  
  event.notification.close();
  
  // 通知のデータを取得
  const data = event.notification.data;
  
  // クリックしたアクションに基づいて異なるURLを設定
  let url = '/';
  if (event.action === 'view-task' && data.taskId) {
    url = `/task/${data.taskId}`;
  }
  
  // クリックすると、アプリのメインページが開く
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // すでに開いているウィンドウがあれば、そこにフォーカス
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // 開いているウィンドウがなければ新しく開く
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});