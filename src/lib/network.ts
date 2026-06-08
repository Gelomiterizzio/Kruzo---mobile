import NetInfo from '@react-native-community/netinfo'
import { onlineManager, focusManager } from '@tanstack/react-query'
import { AppState } from 'react-native'

// Wires React Query to the device network + app focus state:
//   • onlineManager ← NetInfo  → queries pause when offline and auto-resume on
//     reconnect (no wasted requests, automatic recovery).
//   • focusManager ← AppState → queries refetch when the app returns to the
//     foreground (background refresh / fresh data on resume).
let initialized = false

export function initNetworkManagers() {
  if (initialized) return
  initialized = true

  onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected && state.isInternetReachable !== false)
    }),
  )

  AppState.addEventListener('change', (status) => {
    focusManager.setFocused(status === 'active')
  })
}
