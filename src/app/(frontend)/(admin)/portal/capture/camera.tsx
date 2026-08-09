'use client'

import { useEffect, useRef, useState } from 'react'

interface CameraProps {
  onCapture?: (file: File) => void
}

export default function Camera({ onCapture }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
          },
          audio: false,
        })

        setStream(mediaStream)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch {
        setError('Unable to access camera.')
      }
    }

    startCamera()

    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const capture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const context = canvas.getContext('2d')

    if (!context) return

    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        if (!blob) return

        const file = new File([blob], `capture-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        })

        const imageUrl = URL.createObjectURL(blob)

        setCapturedImage(imageUrl)
        onCapture?.(file)
      },
      'image/jpeg',
      0.9,
    )
  }

  const retake = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage)
    }

    setCapturedImage(null)
  }

  if (error) {
    return (
      <div className="rounded-xl border border-gray-200 p-6 text-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="h-full w-full object-cover" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-4 flex justify-center gap-3">
        {capturedImage ? (
          <button
            type="button"
            onClick={retake}
            className="rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-900"
          >
            Retake
          </button>
        ) : (
          <button
            type="button"
            onClick={capture}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white"
          >
            Capture
          </button>
        )}
      </div>
    </div>
  )
}
