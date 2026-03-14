'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import WarpCanvas from './components/WarpCanvas'

const TOTAL_SCENES = 6
const SCENE_NAMES = ['Intro', 'The Problem', 'Aghaaz', 'Active Learning', 'Blitz AI', 'Pricing'] as const

export default function Home() {
  const [lang, setLang] = useState<'en' | 'ur'>('en')
  const [blitzLang, setBlitzLang] = useState<'en' | 'ur'>('en')
  const [blitzVisible, setBlitzVisible] = useState(true)
  const [activeScene, setActiveScene] = useState(0)
  const [introVisible, setIntroVisible] = useState(true)
  const [watched, setWatched] = useState(false)
  const [flyingHome, setFlyingHome] = useState(false)
  const [flyingIn, setFlyingIn] = useState(false)
  const activeSceneRef = useRef(activeScene)

  useEffect(() => { activeSceneRef.current = activeScene }, [activeScene])

  // Intro sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      const overlay = document.getElementById('intro-overlay')
      if (overlay) overlay.classList.add('fade-out')
      setTimeout(() => setIntroVisible(false), 800)
    }, 1400)
    return () => clearTimeout(timer)
  }, [])

  const navigateToScene = useCallback((next: number) => {
    setActiveScene(Math.max(0, Math.min(TOTAL_SCENES - 1, next)))
  }, [])

  const triggerFlyHome = useCallback(() => {
    if (flyingIn || flyingHome) return
    setFlyingHome(true)
    setWatched(true)
  }, [flyingIn, flyingHome])

  const triggerFlyIn = useCallback(() => {
    if (flyingIn || flyingHome) return
    setFlyingIn(true)
  }, [flyingIn, flyingHome, navigateToScene])

  // Wheel
  useEffect(() => {
    const isAnimating = { current: false }
    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('.blitz-chat')) return
      e.preventDefault()
      if (isAnimating.current || Math.abs(e.deltaY) < 10) return
      isAnimating.current = true
      if (activeSceneRef.current === TOTAL_SCENES - 1 && e.deltaY > 0) {
        triggerFlyHome()
        setTimeout(() => { isAnimating.current = false }, 1800)
        return
      }
      navigateToScene(activeSceneRef.current + (e.deltaY > 0 ? 1 : -1))
      setTimeout(() => { isAnimating.current = false }, 1000)
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [navigateToScene, triggerFlyHome])

  // Touch
  useEffect(() => {
    let startY = 0, startT = 0
    const isAnimating = { current: false }
    const onStart = (e: TouchEvent) => { startY = e.touches[0].clientY; startT = Date.now() }
    const onEnd = (e: TouchEvent) => {
      if (isAnimating.current) return
      const delta = startY - e.changedTouches[0].clientY
      if (Math.abs(delta) < 40 || Date.now() - startT > 500) return
      isAnimating.current = true
      if (activeSceneRef.current === TOTAL_SCENES - 1 && delta > 0) {
        triggerFlyHome()
        setTimeout(() => { isAnimating.current = false }, 1800)
        return
      }
      navigateToScene(activeSceneRef.current + (delta > 0 ? 1 : -1))
      setTimeout(() => { isAnimating.current = false }, 1000)
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
    }
  }, [navigateToScene, triggerFlyHome])

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (activeSceneRef.current === TOTAL_SCENES - 1) {
          triggerFlyHome()
        } else {
          navigateToScene(activeSceneRef.current + 1)
        }
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') navigateToScene(activeSceneRef.current - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigateToScene, triggerFlyHome])

  // Glow orb
  useEffect(() => {
    const orb = document.querySelector('.glow-orb') as HTMLElement | null
    if (orb) {
      const zone = activeScene < 2 ? 0 : activeScene === 4 ? 2 : activeScene < 6 ? 3 : 0
      orb.className = `glow-orb glow-zone-${zone}`
      const positions = [
        { top: '42%', left: '50%' },   // 0 hero
        { top: '55%', left: '38%' },   // 1 problem
        { top: '48%', left: '58%' },   // 2 aghaaz fixes
        { top: '50%', left: '52%' },   // 3 active learning
        { top: '50%', left: '56%' },   // 4 blitz
        { top: '52%', left: '50%' },   // 5 pricing
      ]
      const p = positions[activeScene] ?? { top: '50%', left: '50%' }
      orb.style.top = p.top
      orb.style.left = p.left
    }
    // Secondary orb — only visible on scene 4 (Blitz)
    const orb2 = document.querySelector('.glow-orb-2') as HTMLElement | null
    if (orb2) {
      orb2.style.opacity = activeScene === 4 ? '1' : '0'
    }
  }, [activeScene])

  // Blitz language auto-cycle (scene 4)
  useEffect(() => {
    if (activeScene !== 4) return
    const cycle = setInterval(() => {
      setBlitzVisible(false)
      setTimeout(() => {
        setBlitzLang(prev => prev === 'en' ? 'ur' : 'en')
        setBlitzVisible(true)
      }, 400)
    }, 4000)
    return () => clearInterval(cycle)
  }, [activeScene])

  const s = (i: number) => activeScene === i ? 'scene-wrapper scene-active' : 'scene-wrapper'

  return (
    <>
      {/* Intro */}
      {introVisible && (
        <div id="intro-overlay" className="intro-overlay">
          <div className="intro-wordmark">AGHAAZ</div>
        </div>
      )}

      {/* Background */}
      <div className="aurora-bg">
        <div className="aurora-blob blob-1" />
        <div className="aurora-blob blob-2" />
        <div className="aurora-blob blob-3" />
        <div className="aurora-noise" />
      </div>
      <div className="stars" />
      <div className="glow-orb glow-zone-0" style={{ top: '42%', left: '50%' }} />
      <div className="glow-orb-2" style={{
        position: 'fixed', width: 300, height: 300, borderRadius: '50%',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 1,
        top: '65%', left: '25%', transform: 'translate(-50%,-50%)',
        background: 'radial-gradient(circle, rgba(255,100,20,0.10) 0%, transparent 70%)',
        transition: 'opacity 1.5s ease',
        opacity: 0,
      }} />
      <div className="vignette" />

      {/* Header */}
      <div className="top-header">
        <span className="wordmark">AGHAAZ</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="glass-pill p-1 flex items-center gap-1 rounded-full">
            <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all duration-300 ${lang==='en' ? 'bg-[#BFFF00] text-[#020b04]' : 'text-white/40 hover:text-white/70'}`}>EN</button>
            <button onClick={() => setLang('ur')} className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all duration-300 ${lang==='ur' ? 'bg-[#BFFF00] text-[#020b04]' : 'text-white/40 hover:text-white/70'}`}>اردو</button>
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="progress-track">
        {Array.from({ length: TOTAL_SCENES }).map((_, i) => (
          <div key={i} className="progress-dot-wrap relative group">
            <button className={`progress-dot ${i===activeScene ? 'active' : ''}`} onClick={() => navigateToScene(i)} aria-label={SCENE_NAMES[i]} />
            <div className="progress-dot-label">{SCENE_NAMES[i]}</div>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      {activeScene > 0 && activeScene < TOTAL_SCENES - 1 && (
        <div className="scroll-indicator">
          <span className="scroll-label">{lang === 'en' ? 'scroll' : 'سکرول'}</span>
          <div className="scroll-line" />
        </div>
      )}

      <main className="relative z-10 w-full h-screen overflow-hidden">

        {/* ── SCENE 0 — HERO ──────────────────────────────────── */}
        <section className={s(0)} style={{ position: 'relative', overflow: 'visible' }}>
          <div className="scene-inner flex flex-col items-center justify-center text-center gap-8 max-w-5xl mx-auto" style={{
            padding: '0 2rem',
            position: 'relative',
            zIndex: 1,
          }}>
            <div style={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60vw',
              height: '30vh',
              background: 'radial-gradient(ellipse, rgba(191,255,0,0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: -1,
            }} />
            <h1
              className={`scene-text delay-1 ${lang === 'ur' ? 'urdu-text' : ''}`}
              style={{
                fontSize: 'clamp(3rem, 8.5vw, 8.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1.02,
                margin: 0,
                textAlign: 'center',
              }}
            >
              {lang === 'en' ? (
                <>
                  <span style={{ color: 'white' }}>The End of</span>
                  <br />
                  <span style={{
                    background: 'linear-gradient(135deg, white 0%, white 40%, #BFFF00 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>Boring Lectures</span>
                </>
              ) : (
                <>
                  <span style={{ color: 'white' }}>بورنگ لیکچرز کا</span>
                  {' '}
                  <span style={{
                    background: 'linear-gradient(135deg, white 0%, #BFFF00 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>خاتمہ</span>
                </>
              )}
            </h1>

            <p className={`scene-text delay-2 ${lang === 'ur' ? 'urdu-text' : ''}`} style={{
              fontSize: 'clamp(0.8rem, 1.4vw, 1rem)',
              color: 'rgba(255,255,255,0.55)',
              fontWeight: 500,
              letterSpacing: '0.02em',
              lineHeight: 1.6,
              maxWidth: 420,
              margin: 0,
              whiteSpace: 'pre-line',
              textShadow: '0 0 20px rgba(191,255,0,0.3), 0 0 40px rgba(191,255,0,0.12)',
              filter: 'drop-shadow(0 0 8px rgba(191,255,0,0.2))',
            }}>
              {lang === 'en'
                ? '10-minute lessons. Built-in quizzes. AI tutoring.\nFor Pakistani Matric & FSc students.'
                : '10 منٹ کے اسباق۔ بلٹ ان کوئزز۔ AI ٹیوٹرنگ۔\nپاکستانی میٹرک اور FSc طلباء کے لیے۔'}
            </p>

            <div className="scene-text delay-3" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.65rem',
              width: '100%',
              maxWidth: 380,
              position: 'relative',
            }}>

              <div className="neon-arrow" style={{
                position: 'absolute',
                left: -80,
                top: watched ? 'calc(50% + 30px)' : 'calc(50% - 30px)',
                transform: 'translateY(-50%)',
                transition: 'top 0.7s cubic-bezier(0.16,1,0.3,1)',
                animation: 'arrow-float 1.6s ease-in-out infinite',
                zIndex: 10,
                pointerEvents: 'none',
              }}>
                <img
                  src="/aghaaz-logo.png"
                  alt=""
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: 'contain',
                    borderRadius: 10,
                    transform: 'rotate(45deg)',
                    filter: 'drop-shadow(0 0 10px rgba(191,255,0,0.5))',
                    opacity: 0.9,
                  }}
                />
              </div>

              {/* What's Aghaaz? */}
              <div style={{ position: 'relative', width: '100%' }}>
                {!watched && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 14,
                    border: '1.5px solid rgba(191,255,0,0.7)',
                    boxShadow: '0 0 14px rgba(191,255,0,0.35), 0 0 40px rgba(191,255,0,0.12), inset 0 0 14px rgba(191,255,0,0.04)',
                    zIndex: 0,
                    pointerEvents: 'none',
                    animation: 'neon-pulse 2.5s ease-in-out infinite',
                  }} />
                )}
                <button
                  onClick={() => triggerFlyIn()}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    padding: '16px 32px',
                    borderRadius: 13,
                    border: watched
                      ? '0.5px solid rgba(255,255,255,0.07)'
                      : '1px solid transparent',
                    background: watched
                      ? 'rgba(255,255,255,0.03)'
                      : 'linear-gradient(135deg, rgba(191,255,0,0.08) 0%, rgba(0,0,0,0) 100%), #060f08',
                    color: watched ? 'rgba(255,255,255,0.25)' : 'white',
                    fontWeight: 700,
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    letterSpacing: '0.01em',
                    transition: 'all 0.4s ease',
                  }}
                >
                  {lang === 'en' ? "What's Aghaaz?" : 'آغاز کیا ہے؟'}
                </button>
              </div>

              {/* Aghaaz Space */}
              <div style={{ position: 'relative', width: '100%' }}>
                {watched && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 14,
                    border: '1.5px solid rgba(191,255,0,0.7)',
                    boxShadow: '0 0 14px rgba(191,255,0,0.35), 0 0 40px rgba(191,255,0,0.12), inset 0 0 14px rgba(191,255,0,0.04)',
                    zIndex: 0,
                    pointerEvents: 'none',
                    animation: 'neon-pulse 2.5s ease-in-out infinite',
                  }} />
                )}
                <a
                  href="/player"
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    padding: '16px 32px',
                    borderRadius: 13,
                    border: watched
                      ? '1px solid transparent'
                      : '0.5px solid rgba(255,255,255,0.07)',
                    background: watched
                      ? 'linear-gradient(135deg, rgba(191,255,0,0.08) 0%, rgba(0,0,0,0) 100%), #060f08'
                      : 'rgba(255,255,255,0.02)',
                    color: watched ? 'white' : 'rgba(255,255,255,0.2)',
                    fontWeight: 700,
                    fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                    cursor: watched ? 'pointer' : 'default',
                    fontFamily: 'inherit',
                    letterSpacing: '0.01em',
                    transition: 'all 0.4s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                >
                  {lang === 'en' ? 'Aghaaz Space →' : 'آغاز اسپیس →'}
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* ── SCENE 1 — THE PROBLEM ───────────────────────────── */}
        <section className={s(1)}>
          {(() => {
            const line1Text = lang === 'en'
              ? 'Students are stuck with 40-minute lectures.'
              : 'طلباء 40 منٹ کے لیکچرز میں پھنسے ہیں۔'
            const line2Text = lang === 'en'
              ? 'Attention drops after 10 minutes. The student loses focus.'
              : 'توجہ 10 منٹ بعد کم ہو جاتی ہے۔ طالب علم توجہ کھو دیتا ہے۔'
            const line1WordCount = line1Text.split(' ').length
            const line2Start = 0.4 + line1WordCount * 0.12 + 1.1
            const dividerDelay = 0.4 + line1WordCount * 0.12 + 0.9
            return (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'center',
              }}>

                {/* Top half — Line 1 */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: 'clamp(1.25rem, 4vw, 3rem)',
                  paddingLeft: '6vw',
                  paddingRight: '6vw',
                }}>
                  <h2 style={{
                    fontSize: 'clamp(2.4rem, 5.5vw, 5.5rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    textAlign: 'center',
                    margin: 0,
                    maxWidth: '100%',
                  }}>
                    {line1Text.split(' ').map((word, i, arr) => {
                      const lightStart = 0.4 + i * 0.12
                      const dimStart = 0.4 + arr.length * 0.12 + 0.4
                      return (
                        <span key={i} style={{ display: 'inline-block', marginRight: '0.28em' }}>
                          <span style={{
                            color: 'rgba(255,255,255,0.12)',
                            display: 'inline-block',
                            animation: activeScene === 1
                              ? `word-light-up 0.35s ease ${lightStart}s forwards, word-dim-down 0.6s ease ${dimStart}s forwards`
                              : 'none',
                            textShadow: 'none',
                          }}>
                            {word}
                          </span>
                        </span>
                      )
                    })}
                  </h2>
                </div>

                {/* Divider */}
                <div style={{
                  height: '0.5px',
                  background: 'rgba(255,255,255,0)',
                  margin: '0 6vw',
                  animation: activeScene === 1
                    ? `divider-appear 0.5s ease ${dividerDelay}s forwards`
                    : 'none',
                }} />

                {/* Bottom half — Line 2 */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: 'clamp(1.25rem, 4vw, 3rem)',
                  paddingLeft: '6vw',
                  paddingRight: '6vw',
                }}>
                  <h2 style={{
                    fontSize: 'clamp(2.4rem, 5.5vw, 5.5rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    textAlign: 'center',
                    margin: 0,
                    maxWidth: '100%',
                  }}>
                    {line2Text.split(' ').map((word, i) => {
                      const lightStart = line2Start + i * 0.12
                      return (
                        <span key={i} style={{ display: 'inline-block', marginRight: '0.28em' }}>
                          <span style={{
                            color: 'rgba(255,255,255,0.12)',
                            display: 'inline-block',
                            animation: activeScene === 1
                              ? `word-light-up 0.35s ease ${lightStart}s forwards`
                              : 'none',
                          }}>
                            {word}
                          </span>
                        </span>
                      )
                    })}
                  </h2>
                </div>

              </div>
            )
          })()}
        </section>

        {/* ── SCENE 2 — AGHAAZ FIXES THIS ─────────────────────── */}
        <section className={s(2)}>
          <div className="scene-inner flex flex-col items-center justify-center text-center gap-8 max-w-5xl mx-auto">
            <h2 className={`scene-text delay-2 headline-xl ${lang==='ur' ? 'urdu-text' : ''}`} style={{
              background: 'linear-gradient(135deg, #BFFF00 0%, #ffffff 55%, #BFFF00 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              filter: 'drop-shadow(0 0 40px rgba(191,255,0,0.2))',
            }}>
              {lang==='en' ? 'Aghaaz fixes this.' : 'آغاز اسے ٹھیک کرتا ہے۔'}
            </h2>
            <div className="scene-text delay-3" style={{
              width: '100%',
              maxWidth: 540,
              margin: '0 auto',
              background: 'rgba(12,28,16,0.45)',
              backdropFilter: 'blur(24px)',
              border: '0.5px solid rgba(255,255,255,0.07)',
              borderRadius: 20,
              padding: 'clamp(1.25rem, 3vw, 2rem)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}>

              {/* Before */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: '0.25em',
                  color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
                }}>Before</span>
                <div style={{
                  height: 10, borderRadius: 5,
                  background: 'rgba(239,68,68,0.75)',
                  boxShadow: '0 0 20px rgba(239,68,68,0.35)',
                }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                  40 min lecture
                </span>
              </div>

              {/* Divider with arrow */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.06)' }} />
                <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 18, lineHeight: 1, transform: 'rotate(90deg)', display: 'block' }}>→</span>
                <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.06)' }} />
              </div>

              {/* After */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: '0.25em',
                  color: '#BFFF00', textTransform: 'uppercase',
                }}>With Aghaaz</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} className="bar-short" style={{
                      height: 10, flex: 1, borderRadius: 5,
                      background: '#BFFF00',
                      boxShadow: '0 0 14px rgba(191,255,0,0.45)',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
                  10 min each · 4 lessons
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* ── SCENE 3 — ACTIVE LEARNING ───────────────────────────────── */}
        <section className={s(3)}>
          <div className="scene-inner flex flex-col items-center justify-center gap-8 max-w-3xl mx-auto" style={{ padding: '0 2rem' }}>

            {/* Headline */}
            <div style={{ textAlign: 'center' }}>
              <h2 className={`scene-text delay-1 ${lang === 'ur' ? 'urdu-text' : ''}`} style={{
                fontSize: 'clamp(2.2rem, 5.5vw, 5rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1.05,
                margin: 0,
              }}>
                <span style={{ color: 'white' }}>
                  {lang === 'en' ? <>Aghaaz turns passive<br />learning into </> : 'آغاز غیر فعال سیکھنے کو '}
                </span>
                <span style={{
                  background: 'linear-gradient(135deg, #BFFF00, #ffffff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {lang === 'en' ? 'active.' : 'فعال بناتا ہے۔'}
                </span>
              </h2>
            </div>

            {/* Scrimba-style player + quiz overlay */}
            <div className="scene-text delay-2" style={{ width: '100%', position: 'relative' }}>

              {/* Video player mockup */}
              <div style={{
                width: '100%',
                background: '#000',
                borderRadius: 16,
                overflow: 'hidden',
                border: '0.5px solid rgba(255,255,255,0.08)',
                boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
              }}>

                {/* Player top bar */}
                <div style={{
                  padding: '10px 14px',
                  background: '#111',
                  borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {['#ff5f57','#ffbd2e','#28c840'].map(c => (
                        <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
                      ))}
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: 'rgba(255,255,255,0.4)', marginLeft: 6,
                    }}>
                      {lang === 'en' ? '9th Biology · Chapter 4 · Topic 3' : '9 ویں جماعت حیاتیات · باب 4 · موضوع 3'}
                    </span>
                  </div>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>2:14 / 9:45</span>
                </div>

                {/* Video area — quiz overlaid on top */}
                <div style={{
                  width: '100%',
                  aspectRatio: '16/8',
                  background: 'linear-gradient(160deg, #0a1a0c 0%, #060e07 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Subtle grid */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0px, transparent 1px, transparent 28px)',
                  }} />

                  {/* Paused play button — dimmed since quiz is showing */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0.25,
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)',
                      border: '0.5px solid rgba(255,255,255,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{
                        width: 0, height: 0,
                        borderTop: '9px solid transparent',
                        borderBottom: '9px solid transparent',
                        borderLeft: '16px solid rgba(255,255,255,0.6)',
                        marginLeft: 3,
                      }} />
                    </div>
                  </div>

                  {/* Dark blur overlay — behind quiz */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.72)',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                  }} />

                  {/* Quiz card — centered on video */}
                  <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'min(420px, 88%)',
                    background: '#061a0a',
                    border: '0.5px solid rgba(191,255,0,0.18)',
                    borderRadius: 14,
                    overflow: 'hidden',
                    boxShadow: '0 0 40px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(191,255,0,0.06) inset',
                  }}>
                    <div style={{
                      height: 1,
                      background: 'linear-gradient(90deg, transparent, rgba(191,255,0,0.3), transparent)',
                    }} />

                    <div style={{ padding: '14px 16px' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', marginBottom: 10,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: '#BFFF00', boxShadow: '0 0 6px rgba(191,255,0,0.8)',
                          }} />
                          <span style={{
                            fontSize: 9, fontWeight: 800, letterSpacing: '0.2em',
                            color: 'var(--lime)', textTransform: 'uppercase',
                          }}>
                            {lang === 'en' ? '⚡ Checkpoint' : '⚡ چیک پوائنٹ'}
                          </span>
                        </div>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>
                          {lang === 'en' ? '1 of 3' : '1 / 3'}
                        </span>
                      </div>

                      <p style={{
                        fontSize: 'clamp(0.85rem, 1.8vw, 1rem)',
                        fontWeight: 700, color: 'white',
                        lineHeight: 1.4, marginBottom: 10,
                      }}>
                        {lang === 'en'
                          ? 'What is the powerhouse of the cell?'
                          : 'خلیے کا پاور ہاؤس کیا ہے؟'}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[
                          { text: lang === 'en' ? 'Nucleus' : 'نیوکلئس', state: 'wrong' as const },
                          { text: lang === 'en' ? 'Mitochondria' : 'مائٹوکانڈریا', state: 'correct' as const },
                          { text: lang === 'en' ? 'Ribosome' : 'رائبوزوم', state: 'default' as const },
                        ].map(({ text, state }, i) => (
                          <div key={i} style={{
                            padding: '8px 12px', borderRadius: 7,
                            fontSize: 12, fontWeight: 600,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            border: state === 'correct'
                              ? '0.5px solid rgba(34,197,94,0.45)'
                              : state === 'wrong'
                              ? '0.5px solid rgba(239,68,68,0.3)'
                              : '0.5px solid rgba(255,255,255,0.07)',
                            background: state === 'correct'
                              ? 'rgba(34,197,94,0.10)'
                              : state === 'wrong'
                              ? 'rgba(239,68,68,0.08)'
                              : 'rgba(255,255,255,0.03)',
                            color: state === 'correct'
                              ? '#4ade80'
                              : state === 'wrong'
                              ? 'rgba(239,68,68,0.65)'
                              : 'rgba(255,255,255,0.4)',
                          }}>
                            <span>{text}</span>
                            {state === 'correct' && <span>✓</span>}
                            {state === 'wrong' && <span style={{ opacity: 0.5 }}>✗</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Timeline at bottom of video */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '0 12px 10px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
                  }}>
                    <div style={{
                      height: 3, borderRadius: 2,
                      background: 'rgba(255,255,255,0.10)',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', left: 0, top: 0, bottom: 0,
                        width: '28%', background: '#BFFF00', borderRadius: 2,
                      }} />
                      <div style={{
                        position: 'absolute', top: '50%', left: '28%',
                        transform: 'translate(-50%, -50%) rotate(45deg)',
                        width: 7, height: 7,
                        background: '#BFFF00',
                        boxShadow: '0 0 8px rgba(191,255,0,0.8)',
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── SCENE 4 — BLITZ AI ──────────────────────────────── */}
        <section className={s(4)}>
          <div className="scene-inner flex flex-col items-center justify-center gap-6 max-w-3xl mx-auto" style={{ padding: '0 2rem' }}>

            <div style={{ textAlign: 'center' }}>
              <div className="scene-text delay-1">
                <h2 style={{
                  fontSize: 'clamp(3.5rem, 9vw, 8.5rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  margin: '0 0 0.3em 0',
                }}>
                  <span style={{ color: 'white' }}>{lang === 'en' ? 'Meet ' : 'ملیں '}</span>
                  <span className="blitz-gradient-text" style={{ fontSize: 'inherit', fontWeight: 900 }}>{lang === 'en' ? 'Blitz.' : 'بلٹز۔'}</span>
                </h2>
              </div>

              <p className={`scene-text delay-2 ${lang === 'ur' ? 'urdu-text' : ''}`} style={{
                fontSize: 'clamp(1.1rem, 2.8vw, 2rem)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'rgba(255,255,255,0.45)',
                margin: '0 0 0.2em 0',
                lineHeight: 1.2,
              }}>
                {lang === 'en' ? 'Your personal AI tutor.' : 'آپ کا ذاتی AI استاد۔'}
              </p>

              <p className={`scene-text delay-3 ${lang === 'ur' ? 'urdu-text' : ''}`} style={{
                fontSize: 'clamp(0.85rem, 1.8vw, 1.3rem)',
                fontWeight: 500,
                letterSpacing: '0.01em',
                color: 'rgba(255,255,255,0.18)',
                margin: 0,
                lineHeight: 1.2,
              }}>
                {lang === 'en' ? 'Trained for Matric and FSc.' : 'میٹرک اور FSc کے لیے تیار۔'}
              </p>
            </div>

            {/* Blitz card */}
            <div className="scene-text delay-3" style={{ width: '100%' }}>
              <div style={{
                background: 'rgba(15, 8, 2, 0.75)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '0.5px solid rgba(255,149,0,0.22)',
                borderRadius: 24,
                overflow: 'hidden',
                boxShadow: '0 0 80px rgba(255,100,20,0.10), 0 0 0 0.5px rgba(255,149,0,0.08) inset, 0 32px 64px rgba(0,0,0,0.5)',
                position: 'relative',
              }}>
                {/* Top shimmer */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                  background: 'linear-gradient(90deg, transparent, rgba(255,149,0,0.5), transparent)',
                }} />

                {/* Card header */}
                <div style={{
                  padding: 'clamp(12px, 3vw, 18px) clamp(14px, 4vw, 22px)',
                  borderBottom: '0.5px solid rgba(255,149,0,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: 'linear-gradient(135deg, #FF6B35, #FF9500, #FFB800)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                      boxShadow: '0 0 24px rgba(255,149,0,0.4), 0 4px 12px rgba(0,0,0,0.3)',
                    }}>⚡</div>
                    <div>
                      <p className="blitz-gradient-text" style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2, margin: 0 }}>Blitz</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: 0 }}>AI Tutor · always on</p>
                      </div>
                    </div>
                  </div>
                  {/* Language indicator — auto cycles */}
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                    padding: '4px 12px', borderRadius: 999,
                    background: 'rgba(255,149,0,0.12)',
                    border: '0.5px solid rgba(255,149,0,0.25)',
                    color: '#FF9500',
                    transition: 'opacity 0.3s ease',
                  }}>
                    {blitzLang === 'en' ? 'EN' : 'اردو'}
                  </div>
                </div>

                {/* Chat content — fades when switching language */}
                <div style={{
                  padding: '20px 22px',
                  display: 'flex', flexDirection: 'column', gap: 12,
                  opacity: blitzVisible ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                  minHeight: 180,
                }}>
                  {/* User question */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '0.5px solid rgba(255,255,255,0.09)',
                      borderRadius: '16px 16px 4px 16px',
                      padding: '11px 16px',
                      fontSize: 13, lineHeight: 1.55,
                      color: 'rgba(255,255,255,0.72)',
                      maxWidth: '88%',
                    }}>
                      {blitzLang === 'en'
                        ? 'How many times has this question appeared in the board exam?'
                        : 'یہ سوال بورڈ امتحان میں کتنی بار آیا ہے؟'}
                    </div>
                  </div>

                  {/* Blitz answer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: 'linear-gradient(135deg,#FF6B35,#FFB800)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, marginTop: 2,
                      boxShadow: '0 0 12px rgba(255,149,0,0.3)',
                    }}>⚡</div>
                    <div style={{
                      background: 'rgba(30, 14, 4, 0.92)',
                      border: '0.5px solid rgba(255,149,0,0.25)',
                      borderRadius: '4px 16px 16px 16px',
                      padding: '11px 16px',
                      fontSize: 13, lineHeight: 1.65,
                      color: 'rgba(255,255,255,0.88)',
                      maxWidth: '88%',
                      boxShadow: '0 0 30px rgba(255,100,0,0.07)',
                      position: 'relative', overflow: 'hidden',
                    }}>
                      {/* Inner glow top */}
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                        background: 'linear-gradient(90deg, transparent, rgba(255,149,0,0.25), transparent)',
                      }} />
                      {blitzLang === 'en'
                        ? <span>This topic — Newton&apos;s Third Law — has appeared <strong style={{color:'#FFB800'}}>4 times out of the last 10</strong> federal board papers. It&apos;s almost guaranteed. Learn it well. 📋<span className="blitz-cursor" /></span>
                        : <span>یہ ٹاپک — نیوٹن کا تیسرا قانون — وفاقی بورڈ کے <strong style={{color:'#FFB800'}}>گزشتہ 10 میں سے 4</strong> پرچوں میں آیا ہے۔ یہ تقریباً یقینی ہے۔ اسے اچھی طرح سیکھیں۔ 📋<span className="blitz-cursor" /></span>}
                    </div>
                  </div>
                </div>

                {/* Bottom bar — stat strip */}
                <div style={{
                  borderTop: '0.5px solid rgba(255,149,0,0.08)',
                  padding: 'clamp(10px, 2.5vw, 12px) clamp(14px, 4vw, 22px)',
                  display: 'flex', alignItems: 'center', gap: 'clamp(8px, 3vw, 20px)',
                }}>
                  {[
                    { label: lang === 'en' ? 'Board topics covered' : 'بورڈ ٹاپکس', value: '100%' },
                    { label: lang === 'en' ? 'Past papers analysed' : 'پرانے پرچے', value: '10 yrs' },
                    { label: lang === 'en' ? 'Response time' : 'جواب کا وقت', value: '<2s' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                      <p style={{ fontSize: 'clamp(13px, 3.5vw, 16px)', fontWeight: 800, color: '#FF9500', margin: 0, letterSpacing: '-0.01em' }}>{value}</p>
                      <p style={{ fontSize: 'clamp(8px, 2vw, 9px)', color: 'rgba(255,255,255,0.25)', margin: 0, marginTop: 2, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── SCENE 5 — PRICING ───────────────────────────────── */}
        <section className={s(5)}>
          <div className="scene-inner flex flex-col items-center justify-center text-center gap-0 max-w-4xl mx-auto" style={{ padding: '0 2rem' }}>

            {/* "All of this." */}
            <p className="scene-text delay-1" style={{
              fontSize: 'clamp(1rem, 2vw, 1.4rem)',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.04em',
              marginBottom: '1.2rem',
            }}>
              {lang === 'en' ? 'All of this.' : 'یہ سب کچھ۔'}
            </p>

            {/* Crossed price */}
            <div className="scene-text delay-2" style={{
              position: 'relative',
              display: 'inline-block',
              marginBottom: '0.75rem',
            }}>
              <span style={{
                fontSize: 'clamp(1rem, 2.2vw, 1.5rem)',
                color: 'rgba(255,255,255,0.18)',
                fontWeight: 500,
                letterSpacing: '-0.01em',
              }}>
                {lang === 'en' ? 'PKR 12,000/month' : '12,000 روپے ماہانہ'}
              </span>
              <div className="crossed-price" style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center',
              }}>
                <div style={{
                  height: '1.5px',
                  background: 'rgba(239,68,68,0.8)',
                  width: 0,
                  transition: 'width 0.8s ease 0.5s',
                  ...(activeScene === 5 ? { width: '100%' } : {}),
                }} />
              </div>
            </div>

            {/* Big price — lime gradient */}
            <div className="real-price" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{
                fontSize: 'clamp(5rem, 18vw, 14rem)',
                fontWeight: 900,
                letterSpacing: '-0.05em',
                lineHeight: 0.9,
                margin: 0,
                background: 'linear-gradient(160deg, #ffffff 0%, #e8ffb0 40%, #BFFF00 70%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 60px rgba(191,255,0,0.25))',
              }}>
                {lang === 'en' ? 'PKR\n2,000' : 'دو\nہزار'}
              </h2>
            </div>

            {/* Supporting line */}
            <p className="scene-text delay-5" style={{
              fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
              color: 'rgba(255,255,255,0.22)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
              margin: 0,
            }}>
              {lang === 'en'
                ? 'per month · all subjects · Blitz AI · cancel anytime'
                : 'ماہانہ · تمام مضامین · بلٹز AI · کبھی بھی بند کریں'}
            </p>

          </div>
        </section>

      </main>

      {/* Warp blackout + single WarpCanvas */}
      {(flyingIn || flyingHome) && (
        <>
          <div style={{
            position: 'fixed',
            inset: 0,
            background: '#000',
            zIndex: 499,
          }} />
          <WarpCanvas
            active={true}
            direction={flyingIn ? 'in' : 'out'}
            onPeak={() => {
              if (flyingIn) navigateToScene(1)
              if (flyingHome) navigateToScene(0)
            }}
            onComplete={() => {
              setFlyingIn(false)
              setFlyingHome(false)
            }}
          />
        </>
      )}
    </>
  )
}
