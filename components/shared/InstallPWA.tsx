'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'

export default function InstallPWA() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Check if device is iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIosDevice)

    // Check if app is already installed/running in standalone mode
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(isRunningStandalone)

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault() // Prevent the mini-infobar from appearing automatically if desired
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  if (isStandalone) return null // Hide if already installed

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null)
        }
      })
    } else {
      // If we don't have the native prompt, show a manual hint
      alert(isIOS 
        ? "To install this app on your iPhone: tap the Share icon at the bottom of Safari, then select 'Add to Home Screen'."
        : "To install this app, open your browser menu (⋮) and select 'Install App' or 'Add to Home screen'.")
    }
  }

  return (
    <div className="px-3 pb-3">
      <button
        onClick={handleInstallClick}
        className="w-full flex items-center justify-center gap-2 bg-[#EEF2FF] text-[#4F46E5] hover:bg-[#E0E7FF] py-2 rounded-lg text-[12px] font-medium transition-colors duration-150 border border-[#C7D2FE]"
      >
        <Download size={14} />
        Install App
      </button>
    </div>
  )
}
