'use client'

import { useRef } from 'react'
import Camera from './camera'

export default function AiCamera() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCapture = async (file: File) => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch('/api/aicapture', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to upload image')
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

      <Camera onCapture={handleCapture} />

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          Upload Image
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>
    </div>
  )
}
