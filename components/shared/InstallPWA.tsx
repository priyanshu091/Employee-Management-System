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

  // For Android / Chrome / Edge where beforeinstallprompt is supported
  if (deferredPrompt) {
    return (
      <div className="px-3 pb-3">
        <button
          onClick={() => {
            deferredPrompt.prompt()
            deferredPrompt.userChoice.then((choiceResult: any) => {
              if (choiceResult.outcome === 'accepted') {
                setDeferredPrompt(null)
              }
            })
          }}
          className="w-full flex items-center justify-center gap-2 bg-[#EEF2FF] text-[#4F46E5] hover:bg-[#E0E7FF] py-2 rounded-lg text-[12px] font-medium transition-colors duration-150 border border-[#C7D2FE]"
        >
          <Download size={14} />
          Install App
        </button>
      </div>
    )
  }

  // For iOS Safari (does not support beforeinstallprompt)
  if (isIOS && !isStandalone) {
    return (
      <div className="px-3 pb-3">
        <div className="bg-[#EEF2FF] p-2.5 text-center text-[11px] text-[#4F46E5] rounded-lg border border-[#C7D2FE]">
          To install this app on your iPhone: tap <span className="font-bold">Share</span> below and select <span className="font-bold">Add to Home Screen</span>
        </div>
      </div>
    )
  }

  return null
}
