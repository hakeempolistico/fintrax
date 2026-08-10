'use client'

import { useRef, useState } from 'react'
import Camera from './camera'
import { redirect } from 'next/navigation'

export default function AiCamera() {
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCapture = async (file: File) => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch('/api/aicapture', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    if (!response.ok) {
      setIsLoading(false)
      alert(data?.message ?? 'Failed to upload image. Try again later.')
    }
    setIsLoading(false)
    if (data?.redirect) {
      redirect(data?.redirect)
    }
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    handleCapture(file)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold">Capture</h1>

      <div className="relative">
        <Camera onCapture={handleCapture} />

        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
              <span className="text-sm font-medium text-gray-700">Processing image...</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Upload Image'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={isLoading}
        />
      </div>
    </div>
  )
}
