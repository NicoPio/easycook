import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable to manage Wake Lock API
 * Keeps the screen on during step-by-step cooking mode
 *
 * FR-011: Le système DOIT empêcher la mise en veille de l'écran pendant le mode pas-à-pas
 */
export function useWakeLock() {
  const wakeLock = ref<WakeLockSentinel | null>(null)
  const isSupported = ref(false)
  const isActive = ref(false)
  const error = ref<string | null>(null)

  // Check if Wake Lock API is supported
  onMounted(() => {
    isSupported.value = 'wakeLock' in navigator
  })

  /**
   * Request wake lock to prevent screen from sleeping
   */
  async function request() {
    if (!isSupported.value) {
      error.value = 'Wake Lock API non supporté sur cet appareil'
      return false
    }

    try {
      wakeLock.value = await navigator.wakeLock.request('screen')
      isActive.value = true
      error.value = null

      // Listen for wake lock release (e.g., tab becomes inactive)
      wakeLock.value.addEventListener('release', () => {
        isActive.value = false
      })

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Impossible d\'activer le Wake Lock'
      isActive.value = false
      return false
    }
  }

  /**
   * Release wake lock and allow screen to sleep
   */
  async function release() {
    if (wakeLock.value) {
      try {
        await wakeLock.value.release()
        wakeLock.value = null
        isActive.value = false
        error.value = null
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Impossible de libérer le Wake Lock'
      }
    }
  }

  /**
   * Re-acquire wake lock if it was released (e.g., after tab becomes active again)
   */
  async function reacquire() {
    if (isActive.value && !wakeLock.value) {
      await request()
    }
  }

  // Handle visibility change to re-acquire lock when tab becomes active
  onMounted(() => {
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible' && isActive.value && !wakeLock.value) {
        await reacquire()
      }
    })
  })

  // Clean up on unmount
  onUnmounted(() => {
    release()
  })

  return {
    isSupported,
    isActive,
    error,
    request,
    release,
    reacquire
  }
}
