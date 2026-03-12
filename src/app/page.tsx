'use client';

import { useEffect, useState } from 'react';

const TOTAL_SCENES = 8;

export default function Home() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [chatLang, setChatLang] = useState<'en' | 'ur'>('en');
  const [activeScene, setActiveScene] = useState(0);

  // Update glow orb zone based on active scene
  useEffect(() => {
    const glowOrb = document.querySelector('.glow-orb');
    if (!glowOrb) return;
    const zone = activeScene < 2 ? 0 : activeScene < 4 ? 1 : activeScene < 6 ? 2 : 3;
    glowOrb.className = `glow-orb glow-zone-${zone}`;
  }, [activeScene]);

  // Auto-toggle Blitz chat language when Scene 4 is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeScene === 4) {
        setChatLang((prev) => (prev === 'en' ? 'ur' : 'en'));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeScene]);

  return (
    <>
    {/* Language toggle – aligned with Sign in */}
    <div className="fixed top-3 right-6 z-50 flex items-center gap-1.5 text-xs">
      <button
        onClick={() => { setLang('en'); setChatLang('en'); }}
        className={`px-3 py-1.5 rounded-full border transition-all ${
          lang === 'en'
            ? 'border-white/40 bg-white/10 text-white'
            : 'border-white/15 text-white/40 hover:text-white/70'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => { setLang('ur'); setChatLang('ur'); }}
        className={`px-3 py-1.5 rounded-full border transition-all ${
          lang === 'ur'
            ? 'border-white/40 bg-white/10 text-white'
            : 'border-white/15 text-white/40 hover:text-white/70'
        }`}
      >
        اردو
      </button>
    </div>

    <main className="relative z-10" style={{ perspective: '1200px', perspectiveOrigin: '50% 50%' }}>
      {/* Star streaks */}
      <div className="star-streaks">
        <div className="star-streak" style={{ left: '10%', height: 80, opacity: 0.2, animationDuration: '0.7s' }} />
        <div className="star-streak" style={{ left: '25%', height: 120, opacity: 0.15, animationDuration: '1.1s' }} />
        <div className="star-streak" style={{ left: '45%', height: 60, opacity: 0.35, animationDuration: '0.6s' }} />
        <div className="star-streak" style={{ left: '60%', height: 100, opacity: 0.2, animationDuration: '0.9s' }} />
        <div className="star-streak" style={{ left: '78%', height: 70, opacity: 0.25, animationDuration: '1.2s' }} />
        <div className="star-streak" style={{ left: '92%', height: 90, opacity: 0.18, animationDuration: '0.8s' }} />
      </div>

      {/* Progress dots */}
      <div className="progress-track">
        {Array.from({ length: TOTAL_SCENES }).map((_, i) => (
          <button
            key={i}
            type="button"
            className={`progress-dot${i === activeScene ? ' active' : ''}`}
            onClick={() => setActiveScene(i)}
          />
        ))}
      </div>

      {/* ════════════════════════════════════════
          SCENE 0 — HERO
          ════════════════════════════════════════ */}
      <section
        data-scene="0"
        className={`min-h-screen flex items-center justify-center relative px-6 ${
          activeScene === 0 ? 'scene-active' : ''
        }`}
        style={{ display: activeScene === 0 ? 'flex' : 'none' }}
      >
        <div className="scene-inner hero-inner text-center max-w-[90%] md:max-w-[700px]">
          <div className="scene-text delay-1 flex flex-col items-center gap-4 mb-6">
            <img src="/aghaaz-logo.png" alt="Aghaaz" className="h-16 md:h-20 w-auto object-contain" />
            <p className="font-ethnocentric text-xs tracking-widest uppercase text-white/90">
              AGHAAZ
            </p>
          </div>

          <h1
            className="scene-text delay-2 gradient-text font-extrabold text-center"
            style={{ fontSize: 'clamp(36px, 7vw, 80px)' }}
          >
            {lang === 'en' ? 'The End of Boring Lectures.' : 'بورنگ لیکچرز کا خاتمہ۔'}
          </h1>

          <div className="scene-text delay-4 mt-8">
            <button
              onClick={() => setActiveScene(1)}
              className="primary-pill-btn"
            >
              {lang === 'en' ? 'See how it works →' : 'دیکھیں یہ کیسے کام کرتا ہے →'}
            </button>
          </div>

          {/* Sign in link moved to global fixed header */}
        </div>

        <div className="scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20 scroll-bounce">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SCENE 1 — THE PROBLEM
          ════════════════════════════════════════ */}
      <section
        data-scene="1"
        className={`flex items-center justify-center relative px-6 py-24 md:py-32 ${
          activeScene === 1 ? 'scene-active' : ''
        }`}
        style={{ display: activeScene === 1 ? 'flex' : 'none' }}
      >
        <div className="scene-inner text-center max-w-[90%] md:max-w-[700px]">
          <p className="scene-text delay-1 eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE REALITY
          </p>

          {lang === 'en' ? (
            <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow">
              For years, students in Pakistan have been stuck with boring
              40-minute lectures.
            </h2>
          ) : (
            <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow urdu-text">
              برسوں سے پاکستان کے طلبا بورنگ لیکچرز میں پھنسے ہوئے ہیں
            </h2>
          )}
        </div>
      </section>

      <div className="scene-divider" />

      {/* ════════════════════════════════════════
          SCENE 2 — 10-MINUTE LESSONS
          ════════════════════════════════════════ */}
      <section
        data-scene="2"
        className={`flex items-center justify-center relative px-6 py-24 md:py-32 ${
          activeScene === 2 ? 'scene-active' : ''
        }`}
        style={{ display: activeScene === 2 ? 'flex' : 'none' }}
      >
        <div className="scene-inner text-center max-w-[90%] md:max-w-[700px]">
          <p className="scene-text delay-1 eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE FIX
          </p>

          {lang === 'en' ? (
            <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow">
              Every topic. Broken into 10-minute lessons.
            </h2>
          ) : (
            <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow urdu-text">
              ہر ٹاپک، دس منٹ کے آسان اسباق میں۔
            </h2>
          )}

          <div className="scene-text delay-4 bar-visual mt-10 max-w-lg mx-auto">
            <div className="glass-card rounded-2xl p-6 sm:p-8 border-white/5">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
                {/* Before */}
                <div className="w-full sm:w-[45%] text-center sm:text-left">
                  <p className="bar-label text-white/50 text-[10px] uppercase tracking-wider mb-2">Before</p>
                  <div className="bar-long rounded-lg h-4 w-full border border-red-500/50 shadow-inner" style={{ background: 'rgba(239, 68, 68, 0.9)' }} />
                  <p className="bar-label text-white/70 text-xs mt-2 font-medium">40 min lecture</p>
                </div>

                <div className="flex-shrink-0 text-[#BFFF00]/50 text-2xl hidden sm:block" aria-hidden>→</div>
                <div className="flex sm:hidden text-[#BFFF00]/40 text-lg">↓</div>

                {/* After — Aghaaz */}
                <div className="w-full sm:w-[45%] text-center sm:text-left">
                  <p className="bar-label text-[#BFFF00]/80 text-[10px] uppercase tracking-wider mb-2">With Aghaaz</p>
                  <div className="bar-short-row flex gap-2 justify-center sm:justify-start">
                    <div className="bar-short bar-short-glow rounded-lg h-4 w-[23%] min-w-[48px] bg-[#BFFF00]" />
                    <div className="bar-short bar-short-glow rounded-lg h-4 w-[23%] min-w-[48px] bg-[#BFFF00]" />
                    <div className="bar-short bar-short-glow rounded-lg h-4 w-[23%] min-w-[48px] bg-[#BFFF00]" />
                    <div className="bar-short bar-short-glow rounded-lg h-4 w-[23%] min-w-[48px] bg-[#BFFF00]" />
                  </div>
                  <p className="bar-label text-white/70 text-xs mt-2 font-medium">10 min each · 4 lessons</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="scene-divider" />

      {/* ════════════════════════════════════════
          SCENE 3 — BUILT-IN QUIZZES
          ════════════════════════════════════════ */}
      <section
        data-scene="3"
        className={`flex items-center justify-center relative px-6 py-24 md:py-32 ${
          activeScene === 3 ? 'scene-active' : ''
        }`}
        style={{ display: activeScene === 3 ? 'flex' : 'none' }}
      >
        <div className="scene-inner text-center max-w-[90%] md:max-w-[900px]">
          <p className="scene-text delay-1 eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE CHECK
          </p>

          {lang === 'en' ? (
            <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow">
              Every lecture has a built-in quiz.
            </h2>
          ) : (
            <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow urdu-text">
              ہر لیکچر کے اندر کوئز شامل ہے۔
            </h2>
          )}

          {/* Desktop: row — Mobile: horizontal scroll */}
          <div className="hidden md:flex gap-4 mt-8 max-w-4xl mx-auto">
            <div className="quiz-card flex-1 glass-card border-[#22c55e]/20 rounded-2xl p-6 text-left">
              <p className="text-[#22c55e] text-xs tracking-wide uppercase mb-3">Biology</p>
              <p className="question-text text-white font-medium mb-4">What is the powerhouse of the cell?</p>
              <div className="space-y-2">
                <div className="option-btn bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-white/70">Nucleus</div>
                <div className="option-btn bg-[#22c55e]/10 border border-[#22c55e]/50 rounded-xl py-3 px-5 text-[#22c55e]">Mitochondria</div>
              </div>
              <p className="text-[#22c55e] text-sm mt-3">✓ Correct!</p>
            </div>

            <div className="quiz-card flex-1 glass-card border-[#3b82f6]/20 rounded-2xl p-6 text-left">
              <p className="text-[#3b82f6] text-xs tracking-wide uppercase mb-3">Physics</p>
              <p className="question-text text-white font-medium mb-4">What is the SI unit of force?</p>
              <div className="space-y-2">
                <div className="option-btn bg-[#3b82f6]/10 border border-[#3b82f6]/50 rounded-xl py-3 px-5 text-[#3b82f6]">Newton</div>
                <div className="option-btn bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-white/70">Joule</div>
              </div>
              <p className="text-[#3b82f6] text-sm mt-3">✓ Correct!</p>
            </div>

            <div className="quiz-card flex-1 glass-card border-[#a855f7]/20 rounded-2xl p-6 text-left">
              <p className="text-[#a855f7] text-xs tracking-wide uppercase mb-3">Mathematics</p>
              <p className="question-text text-white font-medium mb-4">What is the value of sin(90°)?</p>
              <div className="space-y-2">
                <div className="option-btn bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-white/70">0</div>
                <div className="option-btn bg-[#a855f7]/10 border border-[#a855f7]/50 rounded-xl py-3 px-5 text-[#a855f7]">1</div>
              </div>
              <p className="text-[#a855f7] text-sm mt-3">✓ Correct!</p>
            </div>
          </div>

          {/* Mobile: horizontal scroll */}
          <div className="flex md:hidden gap-4 mt-8 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scrollbar-hide">
            <div className="snap-center shrink-0 w-[280px]">
              <div className="quiz-card glass-card border-[#22c55e]/20 rounded-2xl p-6 text-left h-full">
                <p className="text-[#22c55e] text-xs tracking-wide uppercase mb-3">Biology</p>
                <p className="question-text text-white font-medium mb-4">What is the powerhouse of the cell?</p>
                <div className="space-y-2">
                  <div className="option-btn bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-white/70">Nucleus</div>
                  <div className="option-btn bg-[#22c55e]/10 border border-[#22c55e]/50 rounded-xl py-3 px-5 text-[#22c55e]">Mitochondria</div>
                </div>
                <p className="text-[#22c55e] text-sm mt-3">✓ Correct!</p>
              </div>
            </div>
            <div className="snap-center shrink-0 w-[280px]">
              <div className="quiz-card glass-card border-[#3b82f6]/20 rounded-2xl p-6 text-left h-full">
                <p className="text-[#3b82f6] text-xs tracking-wide uppercase mb-3">Physics</p>
                <p className="question-text text-white font-medium mb-4">What is the SI unit of force?</p>
                <div className="space-y-2">
                  <div className="option-btn bg-[#3b82f6]/10 border border-[#3b82f6]/50 rounded-xl py-3 px-5 text-[#3b82f6]">Newton</div>
                  <div className="option-btn bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-white/70">Joule</div>
                </div>
                <p className="text-[#3b82f6] text-sm mt-3">✓ Correct!</p>
              </div>
            </div>
            <div className="snap-center shrink-0 w-[280px]">
              <div className="quiz-card glass-card border-[#a855f7]/20 rounded-2xl p-6 text-left h-full">
                <p className="text-[#a855f7] text-xs tracking-wide uppercase mb-3">Mathematics</p>
                <p className="question-text text-white font-medium mb-4">What is the value of sin(90°)?</p>
                <div className="space-y-2">
                  <div className="option-btn bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-white/70">0</div>
                  <div className="option-btn bg-[#a855f7]/10 border border-[#a855f7]/50 rounded-xl py-3 px-5 text-[#a855f7]">1</div>
                </div>
                <p className="text-[#a855f7] text-sm mt-3">✓ Correct!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="scene-divider" />

      {/* ════════════════════════════════════════
          SCENE 4 — MEET BLITZ
          ════════════════════════════════════════ */}
      <section
        data-scene="4"
        className={`flex items-center justify-center relative px-6 py-24 md:py-32 ${
          activeScene === 4 ? 'scene-active' : ''
        }`}
        style={{ display: activeScene === 4 ? 'flex' : 'none' }}
      >
        <div className="scene-inner text-center max-w-[90%] md:max-w-[900px]">
          <p className="scene-text delay-1 eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE BACKUP
          </p>

          {lang === 'en' ? (
            <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow">
              Meet Blitz. Your AI tutor trained on every Matric and FSc exam.
            </h2>
          ) : (
            <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow urdu-text">
              بلٹز سے ملو، تمہارا AI ٹیوٹر جو میٹرک اور ایف ایس سی کے ہر امتحان پر تیار ہے۔
            </h2>
          )}

          {/* Single chat that alternates language */}
          <div className="scene-text delay-4 mt-10 max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={() => setChatLang('en')}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  chatLang === 'en'
                    ? 'border-[#BFFF00]/40 bg-[#BFFF00]/10 text-[#BFFF00]'
                    : 'border-white/10 text-white/30 hover:text-white/50'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setChatLang('ur')}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${
                  chatLang === 'ur'
                    ? 'border-[#BFFF00]/40 bg-[#BFFF00]/10 text-[#BFFF00]'
                    : 'border-white/10 text-white/30 hover:text-white/50'
                }`}
              >
                اردو
              </button>
            </div>

            <div className="glass-card rounded-2xl p-6 text-left space-y-4 transition-opacity duration-500">
              <p className="text-[#BFFF00] text-xs tracking-wide">⚡ Blitz</p>

              {chatLang === 'en' ? (
                <>
                  <div className="flex justify-end">
                    <div className="bg-white/10 rounded-2xl rounded-br-md py-3 px-5 text-white/90 max-w-[80%] text-sm">
                      I don&apos;t understand Newton&apos;s third law
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-[#074C2B] rounded-2xl rounded-bl-md py-3 px-5 text-white/90 max-w-[80%] text-sm">
                      Think of it this way — when you push a wall, the wall pushes back on your hand with the same force. That&apos;s why your hand hurts! The forces are equal and opposite. 🧱
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-white/10 rounded-2xl rounded-br-md py-3 px-5 text-white/90 max-w-[80%] text-sm">
                      Oh that makes sense!
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-end">
                    <div className="bg-white/10 rounded-2xl rounded-br-md py-3 px-5 text-white/90 max-w-[80%] text-sm">
                      mujhe newton ka teesra law samajh nahi araha
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-[#074C2B] rounded-2xl rounded-bl-md py-3 px-5 text-white/90 max-w-[80%] text-sm">
                      Socho aise — jab aap deewar ko dhakelte hain, deewar aap ke haath par usi qawat se wapas dhakelti hai. Isi liye haath dard karta hai! Qawatein barabar aur mukhalif hain. 🧱
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-white/10 rounded-2xl rounded-br-md py-3 px-5 text-white/90 max-w-[80%] text-sm">
                      Oh samajh aa gayi!
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="scene-divider" />

      {/* ════════════════════════════════════════
          SCENE 5 — THE PRICE
          ════════════════════════════════════════ */}
      <section
        data-scene="5"
        className={`flex items-center justify-center relative px-6 py-24 md:py-32 ${
          activeScene === 5 ? 'scene-active' : ''
        }`}
        style={{ display: activeScene === 5 ? 'flex' : 'none' }}
      >
        <div className="scene-inner text-center max-w-[90%] md:max-w-[700px]">
          <p className="scene-text delay-1 eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE PRICE
          </p>

          {lang === 'en' ? (
            <>
              <p className="scene-text delay-2 crossed-price text-2xl md:text-4xl text-white/50">
                PKR 12,000/month
              </p>
              <h2
                className="real-price delay-3 gradient-text font-bold mt-4"
                style={{ fontSize: 'clamp(40px, 8vw, 80px)' }}
              >
                PKR 2,000/month
              </h2>
              <p className="scene-text delay-5 text-lg text-white/40 mt-6">
                All subjects. All quizzes. Blitz included. Cancel anytime.
              </p>
            </>
          ) : (
            <>
              <p className="scene-text delay-2 crossed-price text-2xl md:text-4xl text-white/50">
                12,000 روپے ماہانہ
              </p>
              <h2
                className="real-price delay-3 gradient-text font-bold mt-4 urdu-text"
                style={{ fontSize: 'clamp(40px, 8vw, 80px)' }}
              >
                صرف دو ہزار ماہانہ
              </h2>
              <p className="scene-text delay-5 text-lg urdu-text text-white/40 mt-6">
                تمام مضامین۔ تمام کوئزز۔ بلٹز شامل۔ کبھی بھی بند کرو۔
              </p>
            </>
          )}
        </div>
      </section>

      <div className="py-12 text-center">
        <p className="text-white/25 text-sm tracking-wide">
          {lang === 'en'
            ? 'Built for Matric & FSc students in Pakistan'
            : 'پاکستان کے میٹرک اور ایف ایس سی کے طلبا کے لیے بنایا گیا'}
        </p>
      </div>

      <div className="scene-divider" />

      {/* ════════════════════════════════════════
          SCENE 6 — TRY IT NOW (DEMO)
          ════════════════════════════════════════ */}
      <section
        data-scene="6"
        className={`flex items-center justify-center relative px-6 py-24 md:py-32 ${
          activeScene === 6 ? 'scene-active' : ''
        }`}
        style={{ display: activeScene === 6 ? 'flex' : 'none' }}
      >
        <div className="scene-inner text-center max-w-[90%] md:max-w-[700px]">
          <div className="scene-text delay-1">
            <p className="eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-1">
              {lang === 'en' ? 'TRY IT NOW' : 'ابھی آزما کر دیکھو'}
            </p>
          </div>

          {lang === 'en' ? (
            <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow mt-6">
              See what an Aghaaz lesson feels like.
            </h2>
          ) : (
            <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow urdu-text mt-6">
              دیکھو آغاز کا سبق کیسا ہوتا ہے۔
            </h2>
          )}

          <div className="scene-text delay-3 mt-10">
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-white/50 text-xs tracking-wide uppercase mb-3">
                {lang === 'en' ? 'Sample Lesson' : 'نمونہ سبق'}
              </p>
              <p className="text-white font-medium text-lg mb-1">
                {lang === 'en' ? 'Hassam Explains Binary Conversion' : 'حسام بائنری کنورژن سمجھاتا ہے'}
              </p>
              <p className="text-white/40 text-sm mb-6">
                {lang === 'en'
                  ? 'Lesson 1 · Chapter 1 · 9th Computer Science'
                  : 'سبق 1 · باب 1 · نویں جماعت کمپیوٹر سائنس'}
              </p>
              <a
                href="/lesson"
                className="inline-block bg-[#BFFF00] text-[#04160c] font-semibold px-10 py-4 rounded-xl hover:shadow-[0_0_40px_rgba(191,255,0,0.2)] hover:-translate-y-0.5 transition-all text-lg"
              >
                Try Aghaaz →
              </a>
              <p className="text-white/20 text-xs mt-4">
                {lang === 'en'
                  ? 'Includes built-in quiz with AI tutor feedback'
                  : 'اس میں بلٹ اِن کوئز اور AI ٹیوٹر فیڈبیک شامل ہے'}
              </p>
            </div>
          </div>

          <div className="scene-text delay-4 mt-6">
            {lang === 'en' ? (
              <p className="text-sm text-white/30">
                Watch a real lesson with a built-in quiz and Blitz, your AI tutor.
              </p>
            ) : (
              <p className="text-sm urdu-text text-white/15">
                ایک اصلی سبق دیکھو جس میں کوئز اور بلٹز AI ٹیوٹر شامل ہے۔
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="scene-divider" />

      {/* ════════════════════════════════════════
          SCENE 7 — FINAL DECISION
          ════════════════════════════════════════ */}
      <section
        data-scene="7"
        className={`min-h-screen flex items-center justify-center relative px-6 ${
          activeScene === 7 ? 'scene-active' : ''
        }`}
        style={{ display: activeScene === 7 ? 'flex' : 'none' }}
      >
        <div className="scene-inner text-center max-w-[90%] md:max-w-[700px]">
          {lang === 'en' ? (
            <h2 className="scene-text delay-1 text-4xl md:text-6xl font-bold text-white headline-glow">
              Ready to start?
            </h2>
          ) : (
            <h2 className="scene-text delay-1 text-4xl md:text-6xl font-bold text-white headline-glow urdu-text">
              شروع کریں؟
            </h2>
          )}

          <div className="scene-text delay-2 mt-8">
            <div className="flex flex-col items-center gap-3">
              <a
                href="/signup"
                className="cta-button bg-[#BFFF00] text-[#04160c] font-bold px-16 py-5 rounded-2xl hover:shadow-[0_0_60px_rgba(191,255,0,0.3)] hover:-translate-y-1 transition-all text-xl tracking-wide"
              >
                {lang === 'en' ? 'Start Learning →' : 'سیکھنا شروع کریں →'}
              </a>
              <a
                href="https://wa.me/923315319850"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 text-sm hover:text-white/50 transition-colors"
              >
                {lang === 'en'
                  ? 'or talk to an Aghaaz rep ↗'
                  : 'یا آغاز نمائندہ سے بات کریں ↗'}
              </a>
            </div>
          </div>

          <footer className="scene-text delay-3 pt-16">
            <div className="flex flex-col items-center gap-2">
              <p className="text-white/20 text-xs">
                Aghaaz (private) limited · Registered in Pakistan
              </p>
              <p className="text-white/15 text-xs">
                Ground Floor, Plaza 121, Spring North, Bahria Phase 7, Rawalpindi
              </p>
              <div className="text-white/20 text-xs mt-1 space-x-1">
                <a
                  href="https://www.instagram.com/aghaaz.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white/40 transition-colors"
                >
                  Instagram
                </a>
                <span>·</span>
                <a
                  href="https://www.linkedin.com/company/aghaazpak/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white/40 transition-colors"
                >
                  LinkedIn
                </a>
                <span>·</span>
                <a
                  href="https://wa.me/923315319850"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white/40 transition-colors"
                >
                  WhatsApp
                </a>
                <span>·</span>
                <a
                  href="mailto:saim@aghaaz.ai"
                  className="hover:text-white/40 transition-colors"
                >
                  saim@aghaaz.ai
                </a>
              </div>
            </div>
          </footer>
        </div>
      </section>

      {/* Global slide bottom navigation (BACK / NEXT) – hidden on first screen */}
      {activeScene > 0 && (
        <div className="slide-bottom-nav">
          <div className="slide-bottom-nav-inner">
            {activeScene > 0 ? (
              <button
                type="button"
                className="secondary-pill-btn"
                onClick={() => setActiveScene((prev) => Math.max(prev - 1, 0))}
              >
                ← BACK
              </button>
            ) : (
              <span />
            )}

            {activeScene < TOTAL_SCENES - 1 ? (
              <button
                type="button"
                className="primary-pill-btn"
                onClick={() => setActiveScene((prev) => Math.min(prev + 1, TOTAL_SCENES - 1))}
              >
                NEXT →
              </button>
            ) : (
              <span />
            )}
          </div>
        </div>
      )}
    </main>
    </>
  );
}
