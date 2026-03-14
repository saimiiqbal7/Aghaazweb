'use client'

import { useEffect, useRef } from 'react'

type Props = {
  active: boolean
  direction: 'in' | 'out'
  onPeak?: () => void
  onComplete?: () => void
}

export default function WarpCanvas({ active, direction, onPeak, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const W = canvas.width
    const H = canvas.height
    const CX = W / 2
    const CY = H / 2

    // ── STARS ─────────────────────────────────────────────────────
    // Horizontal streaks only — lightspeed is sideways
    const STAR_COUNT = 220
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      speed: 0.3 + Math.random() * 0.7,
      size: 0.4 + Math.random() * 1.2,
      // Slight vertical scatter so they're not all perfectly horizontal
      vy: (Math.random() - 0.5) * 0.3,
    }))

    const DURATION = 1200
    let start: number | null = null
    let peakFired = false

    // Speed curve — ease in, peak at 50%, ease out
    const speedAt = (t: number) => Math.sin(t * Math.PI)

    const tick = (now: number) => {
      if (!start) start = now
      const elapsed = now - start
      const t = Math.min(elapsed / DURATION, 1)
      const speed = speedAt(t)

      // Peak at t=0.48 — switch scene here, still fully covered
      if (t >= 0.48 && !peakFired) {
        peakFired = true
        onPeak?.()
      }

      // ── BACKGROUND ──────────────────────────────────────────────
      // Fade to black as speed increases, full black at peak
      const bgAlpha = 0.1 + speed * 0.55
      ctx.fillStyle = `rgba(2, 11, 4, ${bgAlpha})`
      ctx.fillRect(0, 0, W, H)

      // Full black cover at peak
      if (t > 0.42 && t < 0.58) {
        const coverT = 1 - Math.abs(t - 0.50) / 0.08
        ctx.fillStyle = `rgba(0, 0, 0, ${coverT * 0.95})`
        ctx.fillRect(0, 0, W, H)
      }

      // ── CHROMATIC ABERRATION LAYERS ──────────────────────────────
      // At high speed, draw colored ghost layers offset horizontally
      const aberration = speed * 18
      if (aberration > 2) {
        // Red channel — shifted left (entering) or right (exiting)
        const redShift = direction === 'in' ? -aberration : aberration
        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        ctx.globalAlpha = speed * 0.12
        ctx.fillStyle = `rgb(255, 0, 0)`
        ctx.fillRect(redShift, 0, W, H)
        ctx.restore()

        // Blue channel — opposite direction
        const blueShift = direction === 'in' ? aberration * 0.7 : -aberration * 0.7
        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        ctx.globalAlpha = speed * 0.10
        ctx.fillStyle = `rgb(0, 100, 255)`
        ctx.fillRect(blueShift, 0, W, H)
        ctx.restore()
      }

      // ── STAR STREAKS ─────────────────────────────────────────────
      stars.forEach(star => {
        const stretchLength = speed * star.speed * (W * 0.7)

        // Direction of travel
        const dx = direction === 'in' ? -stretchLength : stretchLength

        const x1 = star.x
        const y1 = star.y
        const x2 = star.x + dx
        const y2 = star.y + star.vy * stretchLength * 0.1

        const alpha = 0.2 + speed * 0.75
        const lw = star.size * (0.4 + speed * 2.5)

        // Gradient streak — bright tip, fading tail
        const grad = ctx.createLinearGradient(x1, y1, x2, y2)
        if (direction === 'in') {
          // Entering: bright on right (leading), fade left (trailing)
          grad.addColorStop(0, `rgba(180,255,200, 0)`)
          grad.addColorStop(0.6, `rgba(210,255,225, ${alpha * 0.5})`)
          grad.addColorStop(1, `rgba(230,255,240, ${alpha})`)
        } else {
          // Exiting: bright on left (leading), fade right (trailing)
          grad.addColorStop(0, `rgba(230,255,240, ${alpha})`)
          grad.addColorStop(0.4, `rgba(210,255,225, ${alpha * 0.5})`)
          grad.addColorStop(1, `rgba(180,255,200, 0)`)
        }

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = grad
        ctx.lineWidth = lw
        ctx.stroke()
      })

      // ── VIGNETTE CRUSH ───────────────────────────────────────────
      // Edges go black, center stays bright — g-force effect
      if (speed > 0.1) {
        const vigStrength = speed * 0.75
        const vignette = ctx.createRadialGradient(CX, CY, H * 0.1, CX, CY, H * 0.85)
        vignette.addColorStop(0, `rgba(0,0,0,0)`)
        vignette.addColorStop(1, `rgba(0,0,0,${vigStrength})`)
        ctx.fillStyle = vignette
        ctx.fillRect(0, 0, W, H)
      }

      // ── LIME FLASH AT PEAK ───────────────────────────────────────
      if (t > 0.44 && t < 0.56) {
        const flashT = 1 - Math.abs(t - 0.50) / 0.06
        ctx.fillStyle = `rgba(191, 255, 0, ${flashT * 0.08})`
        ctx.fillRect(0, 0, W, H)
      }

      // ── SPEED LINES ──────────────────────────────────────────────
      // At very high speed — add a few bright white speed lines
      if (speed > 0.6) {
        const lineCount = Math.floor(speed * 8)
        for (let i = 0; i < lineCount; i++) {
          const ly = Math.random() * H
          const lx = Math.random() * W
          const len = speed * (W * 0.4) * Math.random()
          const lx2 = direction === 'in' ? lx - len : lx + len

          ctx.beginPath()
          ctx.moveTo(lx, ly)
          ctx.lineTo(lx2, ly)
          ctx.strokeStyle = `rgba(255,255,255,${speed * 0.15 * Math.random()})`
          ctx.lineWidth = 0.5 + Math.random()
          ctx.stroke()
        }
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        onComplete?.()
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, direction, onPeak, onComplete])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        pointerEvents: 'auto',
        width: '100vw',
        height: '100vh',
      }}
    />
  )
}
