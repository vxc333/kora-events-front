import { useEffect, useRef, useCallback } from 'react'
import jsQR from 'jsqr'

interface Props {
  onScan: (data: string) => void
  active: boolean
}

export function QrScanner({ onScan, active }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const cooldownRef = useRef(false)
  const lastTokenRef = useRef('')

  const tick = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(tick)
      return
    }
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    })
    if (code?.data && code.data !== lastTokenRef.current && !cooldownRef.current) {
      lastTokenRef.current = code.data
      cooldownRef.current = true
      if (navigator.vibrate) navigator.vibrate(60)
      onScan(code.data)
      setTimeout(() => {
        lastTokenRef.current = ''
        cooldownRef.current = false
      }, 2500)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [onScan])

  useEffect(() => {
    if (!active) return
    let stopped = false

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } } })
      .then((stream) => {
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream
        const video = videoRef.current
        if (video) { video.srcObject = stream; video.play() }
        rafRef.current = requestAnimationFrame(tick)
      })
      .catch(console.error)

    return () => {
      stopped = true
      cancelAnimationFrame(rafRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [active, tick])

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
