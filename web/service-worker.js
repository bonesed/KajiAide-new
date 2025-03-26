/* eslint-disable no-restricted-globals */

// このファイルはビルド時にWorkbox WebpackプラグインによってService Workerに変換されます
// Service Workerドキュメント: https://developers.google.com/web/fundamentals/primers/service-workers

// キャッシュ名のプレフィックス - バージョン更新時に変更することで古いキャッシュを削除
const CACHE_NAME_PREFIX = 'kajiaid-cache-';
const CACHE_VERSION = 'v1';
const CACHE_NAME = `${CACHE_NAME_PREFIX}${CACHE_VERSION}`;

// キャッシュするアセット
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.js',
  '/static/css/main.css',
  '/favicon.ico',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png'
];

// オフライン用のフォールバックページ
const OFFLINE_PAGE = '/offline.html';

// インストール時に静的アセットをプリキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // オフラインページと静的アセットをキャッシュ
        return cache.addAll([OFFLINE_PAGE, ...STATIC_ASSETS]);
      })
      .then(() => {
        // 古いバージョンのService Workerをスキップして即座にアクティブに
        return self.skipWaiting();
      })
  );
});

// アクティブ化時に古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // 同じプレフィックスを持つ古いキャッシュを削除
            return cacheName.startsWith(CACHE_NAME_PREFIX) && cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      // 新しいService Workerがすぐに制御できるようにする
      return self.clients.claim();
    })
  );
});

// ナビゲーションリクエストを処理（ページ表示時）
self.addEventListener('fetch', (event) => {
  // APIリクエストやCDNリクエストはスキップ
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('fonts.googleapis.com') ||
    event.request.url.includes('fonts.gstatic.com')
  ) {
    return;
  }

  // GETリクエストのみキャッシュ
  if (event.request.method !== 'GET') {
    return;
  }

  // ナビゲーションリクエスト（HTMLページへのリクエスト）の処理
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // オフラインでナビゲーションが失敗した場合、オフラインページを表示
          return caches.match(OFFLINE_PAGE);
        })
    );
    return;
  }

  // 画像、スタイル、スクリプトなどのアセットの処理
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // キャッシュにある場合はそれを返す
      if (cachedResponse) {
        return cachedResponse;
      }

      // キャッシュにない場合はネットワークから取得
      return fetch(event.request)
        .then((response) => {
          // 無効なレスポンスの場合は処理しない
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // レスポンスをクローンしてキャッシュに保存
          // (レスポンスは一度だけ使用できるストリームのため)
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // 画像の場合はプレースホルダーを返す
          if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
            return caches.match('/placeholder.png');
          }
          return null;
        });
    })
  );
});

// プッシュ通知を受信した時の処理
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-96x96.png',
    data: data.data,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 通知がクリックされた時の処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // 通知のアクションに基づいて異なる処理を行う
  const action = event.action;
  const data = event.notification.data;

  // 対象のURLを決定
  let url = '/';
  if (action === 'view-task' && data.taskId) {
    url = `/task/${data.taskId}`;
  } else if (action === 'view-tips') {
    url = '/ai-tips';
  }

  // 既存のウィンドウを探して、そこにフォーカスする
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // 既存のウィンドウがなければ新しく開く
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// バックグラウンド同期
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  } else if (event.tag === 'sync-settings') {
    event.waitUntil(syncSettings());
  }
});

// タスクの同期処理
async function syncTasks() {
  try {
    const cache = await caches.open('task-updates');
    const requests = await cache.keys();
    
    for (const request of requests) {
      const data = await cache.match(request).then(r => r.json());
      
      // サーバーに送信
      const response = await fetch('/api/sync/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        // 同期が成功したら、キャッシュから削除
        await cache.delete(request);
      }
    }
    
    // すべての同期に成功したら通知
    if (requests.length > 0) {
      self.registration.showNotification('同期完了', {
        body: 'すべてのタスクが同期されました',
        icon: '/icon-192.png',
      });
    }
  } catch (error) {
    console.error('タスク同期エラー:', error);
  }
}

// 設定の同期処理
async function syncSettings() {
  try {
    const cache = await caches.open('settings-updates');
    const requests = await cache.keys();
    
    for (const request of requests) {
      const data = await cache.match(request).then(r => r.json());
      
      // サーバーに送信
      const response = await fetch('/api/sync/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        // 同期が成功したら、キャッシュから削除
        await cache.delete(request);
      }
    }
  } catch (error) {
    console.error('設定同期エラー:', error);
  }
}