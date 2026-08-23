'use client'

import { useState } from 'react'
import Camera from './Camera'
import { useRouter } from 'next/navigation'

export default function AiCamera() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const handleCapture = async (file: File) => {
    setIsLoading(true)
    try {
      const formData = new FormData(); formData.append('image', file)
      const response = await fetch('/api/aicapture', { method: 'POST', body: formData })
      const data = await response.json()
      if (!response.ok) { alert(data?.message ?? 'Failed to upload image. Try again later.'); return }
      if (data?.redirect) router.push(data.redirect)
    } finally { setIsLoading(false) }
  }
  return <div className="mx-auto max-w-2xl"><h1 className="mb-6 text-2xl font-semibold dark:text-white">Capture</h1><div className="relative"><Camera onCapture={handleCapture} />{isLoading && <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80"><div className="flex flex-col items-center gap-3"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" /><span className="text-sm font-medium text-gray-700">Processing image...</span></div></div>}</div></div>
}
