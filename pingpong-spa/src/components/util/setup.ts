import {
  useAuthStore,
  useMeStore,
  useDiskStore,
  useAlertStore,
  useShareAuthStore,
  useShareInfoStore
} from '@/stores'
import * as Sentry from '@sentry/vue'

const requestSessionToken = 'request-session-token'
const requestShareToken = 'request-share-token'

const skipErrorStatuses = [401, 429, 503]

export function updateMeDiskStores() {
  const authStore = useAuthStore()
  const meStore = useMeStore()

  if (!authStore.isAuthenticated) {
    return
  }

  meStore
    .fetch()
    .then(() => {
      Sentry.setUser({
        id: meStore.id.toString(),
        username: meStore.username
      })
    })
    .catch((error: any) => {
      const status = error.response?.status || 0
      if (skipErrorStatuses.indexOf(status) >= 0) {
        console.warn('util.updateMeDiskStores.error: ', status, error)
        return
      }

      Sentry.captureException(error)
      console.error('util.updateMeDiskStores.error: ', status, error)

      const alertStore = useAlertStore()
      alertStore.error({
        messageId: 'error.fetch.me.unknown',
        messageParams: { status }
      })
    })

  const diskStore = useDiskStore()
  diskStore
    .fetch()
    .then(() => {
      Sentry.setTag('diskId', diskStore.disk.diskID)
      Sentry.setTag('diskName', diskStore.disk.diskName)
    })
    .catch((error: any) => {
      const status = error.response?.status || 0
      if (skipErrorStatuses.indexOf(status) >= 0) {
        console.warn('util.updateMeDiskStores.error: ', status, error)
        return
      }

      Sentry.captureException(error)
      console.error('util.updateMeDiskStores.error: ', status, error)

      const alertStore = useAlertStore()
      alertStore.error({
        messageId: 'error.fetch.disk.unknown',
        messageParams: { status }
      })
    })
}

export function updateShareInfoStore(shareID: string) {
  const shareAuthStore = useShareAuthStore()

  if (!shareAuthStore.isAuthenticated(shareID)) {
    return
  }

  const shareInfoStore = useShareInfoStore()

  shareInfoStore
    .fetch(shareID)
    .then(() => {
      Sentry.setTag('shareNodeID', shareInfoStore.share.id)
    })
    .catch((error: any) => {
      Sentry.captureException(error)
      console.error('util.updateShareInfoStore.error: ', error)

      const alertStore = useAlertStore()
      alertStore.error({
        messageId: 'error.fetch.shareInfo.unknown',
        messageParams: { status: error.response?.status }
      })
    })
}

// TODO: FIXME: We probably want to use vite-pwa or something to do our serviceworker management
// See: https://vite-pwa-org.netlify.app/guide/
export function registerServiceWorker(file: string, options: any) {
  if (navigator.serviceWorker) {
    console.log('util.registerServiceWorker: Registering worker')
    navigator.serviceWorker.register(file, options)
  } else {
    console.error('util.registerServiceWorker: Cannot register serviceworker, unavailable api')
    console.log(
      'If you are a developer, please mark this URL as secure here: chrome://flags/#unsafely-treat-insecure-origin-as-secure'
    )
  }
}

export const tokenChannel = new BroadcastChannel('TOKEN_EXCHANGE')

export function sendSessionToken() {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    return
  }

  tokenChannel.postMessage({
    sessionToken: authStore.token
  })
}

export function sendShareToken(shareID: string) {
  const shareAuthStore = useShareAuthStore()

  if (!shareAuthStore.isAuthenticated(shareID)) {
    return
  }

  tokenChannel.postMessage({
    shareID: shareID,
    shareToken: shareAuthStore.shareToken(shareID)
  })
}

export function setupServiceWorkerChannel() {
  const authStore = useAuthStore()
  authStore.$subscribe(() => {
    console.log('util.setupServiceWorkerChannel: Update of authStore')

    sendSessionToken()

    // Make sure meStore and diskStore data are properly loaded
    updateMeDiskStores()
  })

  const shareAuthStore = useShareAuthStore()
  shareAuthStore.$subscribe(() => {
    console.log('util.setupServiceWorkerChannel: Update of shareAuthStore')

    for (const [shareID] of Object.entries(shareAuthStore.shareTokens)) {
      sendShareToken(shareID)
    }
  })

  // Add a listener to the auth store that updates the token in the service worker
  tokenChannel.onmessage = (e: any) => {
    console.log('TokenExchangeChannel: Received message', e)

    switch (e.data.id) {
      case requestSessionToken:
        sendSessionToken()
        break
      case requestShareToken:
        if (!Object.prototype.hasOwnProperty.call(e.data, 'shareID')) {
          console.error('setupServiceWorkerChannel.onmessage: No share ID given', e.data)
          return
        }
        sendShareToken(e.data.shareID)
        break
    }
  }
}
