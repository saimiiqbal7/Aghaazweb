'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import EmbeddedDemo from './components/EmbeddedDemo';

const TOTAL_SCENES = 8;

const SCENE_NAMES = [
  'Intro',
  'The Problem',
  'The Fix',
  'Quizzes',
  'Blitz AI',
  'Pricing',
  'Try It',
  'Get Started',
] as const;

// --- MAIN LANDING PAGE ---
export default function Home() {
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [chatLang, setChatLang] = useState<'en' | 'ur'>('en');
  const [activeScene, setActiveScene] = useState(0);
  const activeSceneRef = useRef(activeScene);

  useEffect(() => {
    activeSceneRef.current = activeScene;
  }, [activeScene]);

  const navigateToScene = useCallback((next: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_SCENES - 1, next));
    setActiveScene(clamped);
  }, []);

  useEffect(() => {
    const isAnimatingRef = { current: false };

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('.blitz-chat') ||
        target.closest('.quiz-card-overlay')
      )
        return;

      e.preventDefault();
      if (isAnimatingRef.current) return;

      if (Math.abs(e.deltaY) < 10) return;

      isAnimatingRef.current = true;

      const next =
        e.deltaY > 0
          ? Math.min(activeSceneRef.current + 1, TOTAL_SCENES - 1)
          : Math.max(activeSceneRef.current - 1, 0);

      navigateToScene(next);

      setTimeout(() => {
        isAnimatingRef.current = false;
      }, 1100);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [navigateToScene]);

  useEffect(() => {
    let touchStartY = 0;
    let touchStartTime = 0;
    const isAnimatingRef = { current: false };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnimatingRef.current) return;

      const delta = touchStartY - e.changedTouches[0].clientY;
      const elapsed = Date.now() - touchStartTime;

      if (Math.abs(delta) < 40) return;
      if (elapsed > 500) return;

      isAnimatingRef.current = true;

      const next =
        delta > 0
          ? Math.min(activeSceneRef.current + 1, TOTAL_SCENES - 1)
          : Math.max(activeSceneRef.current - 1, 0);

      navigateToScene(next);

      setTimeout(() => {
        isAnimatingRef.current = false;
      }, 1100);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigateToScene]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        setActiveScene(prev => Math.min(prev + 1, TOTAL_SCENES - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        setActiveScene(prev => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const glowOrb = document.querySelector('.glow-orb') as HTMLElement | null;
    if (!glowOrb) return;

    const zone =
      activeScene < 2 ? 0 : activeScene < 4 ? 1 : activeScene < 6 ? 2 : 3;
    glowOrb.className = `glow-orb glow-zone-${zone}`;

    const positions: Record<number, { top: string; left: string }> = {
      0: { top: '45%', left: '50%' },
      1: { top: '55%', left: '40%' },
      2: { top: '50%', left: '60%' },
      3: { top: '40%', left: '45%' },
      4: { top: '50%', left: '55%' },
      5: { top: '52%', left: '50%' },
      6: { top: '45%', left: '58%' },
      7: { top: '48%', left: '50%' },
    };

    const pos = positions[activeScene] ?? { top: '50%', left: '50%' };
    glowOrb.style.top = pos.top;
    glowOrb.style.left = pos.left;
  }, [activeScene]);

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
      <div className="aurora-bg">
        <div className="aurora-blob blob-1" />
        <div className="aurora-blob blob-2" />
        <div className="aurora-blob blob-3" />
        <div className="aurora-noise" />
      </div>
      <div className="stars" />
      <div className="particles" />
      <div className="glow-orb glow-zone-0" />
      <div className="vignette" />

      <header className="fixed top-4 md:top-6 right-4 md:right-8 z-50 flex items-center gap-2">
        <div className="glass-pill p-1 flex items-center gap-1 rounded-full">
          <button
            onClick={() => { setLang('en'); setChatLang('en'); }}
            className={`px-3 py-1.5 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all duration-300 ${lang === 'en' ? 'bg-[#BFFF00] text-[#041a0e] shadow-[0_0_15px_rgba(191,255,0,0.3)]' : 'text-white/50 hover:text-white'}`}
          >
            EN
          </button>
          <button
            onClick={() => { setLang('ur'); setChatLang('ur'); }}
            className={`px-3 py-1.5 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold transition-all duration-300 ${lang === 'ur' ? 'bg-[#BFFF00] text-[#041a0e] shadow-[0_0_15px_rgba(191,255,0,0.3)]' : 'text-white/50 hover:text-white'}`}
          >
            اردو
          </button>
        </div>
      </header>

      <main className="relative z-10 w-full h-screen overflow-hidden" style={{ perspective: '1200px' }}>
        <div className="progress-track">
          {Array.from({ length: TOTAL_SCENES }).map((_, i) => (
            <div key={i} className="progress-dot-wrap relative group">
              <button
                type="button"
                className={`progress-dot ${i === activeScene ? 'active' : ''}`}
                onClick={() => navigateToScene(i)}
                aria-label={`Go to ${SCENE_NAMES[i]}`}
              />
              <div className="progress-dot-label absolute right-6 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white/80 text-[10px] font-semibold tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {SCENE_NAMES[i]}
              </div>
            </div>
          ))}
        </div>

        {activeScene < TOTAL_SCENES - 1 && activeScene !== 6 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5 pointer-events-none">
            <span className="text-white/30 text-[9px] tracking-[0.3em] uppercase font-bold">
              {lang === 'en' ? 'scroll' : 'سکرول'}
            </span>
            <div className="flex flex-col items-center gap-0.5">
              <svg className="scroll-chevron scroll-chevron-1" width="18" height="11" viewBox="0 0 20 12" fill="none">
                <path d="M2 2L10 10L18 2" stroke="#BFFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg className="scroll-chevron scroll-chevron-2" width="18" height="11" viewBox="0 0 20 12" fill="none">
                <path d="M2 2L10 10L18 2" stroke="#BFFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}

        {/* 0. HERO SCENE */}
        <section data-scene="0" className={`scene-wrapper ${activeScene === 0 ? 'scene-active' : 'hidden'}`}>
          <div className="scene-inner text-center flex flex-col items-center justify-center gap-6 md:gap-8 px-4">
            <div className="scene-text delay-1 flex flex-col items-center gap-3 md:gap-4">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-white/[0.02] border border-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-xl">
                <img
                  src="/aghaaz-logo.png"
                  alt="Aghaaz"
                  width={56}
                  height={56}
                  className="h-10 md:h-14 object-contain"
                />
              </div>
              <p className="font-ethnocentric text-[8px] md:text-[10px] tracking-[0.4em] uppercase text-white/50">AGHAAZ</p>
            </div>
            {/* PERFORMANCE/MOBILE FIX: Adjusted text-7xl/100px to smaller breakpoints so it doesn't overflow mobile screens */}
            <h1 className="scene-text delay-2 animated-headline-gradient text-4xl sm:text-5xl md:text-7xl lg:text-[88px] font-extrabold text-transparent bg-clip-text tracking-tighter leading-[1.1] md:leading-[1.05] headline-glow max-w-5xl pb-2">
              {lang === 'en' ? 'The End of Boring Lectures.' : 'بورنگ لیکچرز کا خاتمہ۔'}
            </h1>
          </div>
        </section>

        {/* 1. THE PROBLEM */}
        <section data-scene="1" className={`scene-wrapper ${activeScene === 1 ? 'scene-active' : 'hidden'}`}>
          <div className="scene-inner text-center flex flex-col items-center justify-center gap-4 md:gap-6 max-w-4xl px-4">
            <p className="scene-text delay-1 eyebrow">{lang === 'en' ? 'Pakistan has a broken education system' : 'پاکستان کا تعلیمی نظام خراب ہے'}</p>
            <h2 className={`scene-text delay-2 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.2] md:leading-[1.15] ${lang === 'ur' ? 'urdu-text' : ''}`}>
              {lang === 'en' ? 'For years, students in Pakistan have been stuck with boring 40-minute lectures.' : 'برسوں سے پاکستان کے طلبا بورنگ لیکچرز میں پھنسے ہوئے ہیں'}
            </h2>
          </div>
        </section>

        {/* 2. THE FIX (BARS) */}
        <section data-scene="2" className={`scene-wrapper ${activeScene === 2 ? 'scene-active' : 'hidden'}`}>
          <div className="scene-inner text-center flex flex-col items-center justify-center gap-6 md:gap-10 max-w-5xl px-4">
            <div className="space-y-2 md:space-y-4">
              <p className="scene-text delay-1 eyebrow">{lang === 'en' ? 'Aghaaz fixes this' : 'آغاز اسے ٹھیک کرتا ہے'}</p>
              <h2 className={`scene-text delay-2 text-3xl sm:text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.1] ${lang === 'ur' ? 'urdu-text' : ''}`}>
                {lang === 'en' ? 'Every topic. Broken into 10-minute lessons.' : 'ہر ٹاپک، دس منٹ کے آسان اسباق میں۔'}
              </h2>
            </div>
            
            <div className="scene-text delay-4 w-full glass-card rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 md:gap-12 mt-2 md:mt-4">
              <div className="w-full text-center sm:text-left">
                <p className="text-white/40 text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase mb-3 md:mb-4">Before</p>
                <div className="w-full h-2 md:h-3 rounded-full bg-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.4)]" />
                <p className="text-white/60 text-xs md:text-sm mt-3 md:mt-4 font-medium">40 min lecture</p>
              </div>
              <div className="hidden sm:block text-[#BFFF00]/30 text-3xl font-light">→</div>
              <div className="w-full text-center sm:text-left">
                <p className="text-[#BFFF00] text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase mb-3 md:mb-4">With Aghaaz</p>
                <div className="flex gap-2 md:gap-3">
                  {[1,2,3,4].map(i => <div key={i} className="h-2 md:h-3 w-1/4 rounded-full bg-[#BFFF00] shadow-[0_0_20px_rgba(191,255,0,0.5)] bar-short" />)}
                </div>
                <p className="text-white/80 text-xs md:text-sm mt-3 md:mt-4 font-medium">10 min each · 4 lessons</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. THE QUIZZES */}
        <section data-scene="3" className={`scene-wrapper ${activeScene === 3 ? 'scene-active' : 'hidden'}`}>
          <div className="scene-inner text-center flex flex-col items-center justify-center gap-6 md:gap-10 max-w-6xl px-4">
            <div className="space-y-2 md:space-y-4 max-w-3xl">
              <p className="scene-text delay-1 eyebrow">{lang === 'en' ? 'Active questioning' : 'فعال سوالات'}</p>
              <h2 className={`scene-text delay-2 text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] ${lang === 'ur' ? 'urdu-text' : ''}`}>
                {lang === 'en' ? 'Every lecture has a built-in quiz.' : 'ہر لیکچر کے اندر کوئز شامل ہے۔'}
              </h2>
            </div>
            
            <div className="scene-text delay-4 w-full grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6 mt-2 md:mt-4">
              <div className="glass-card rounded-2xl md:rounded-3xl p-3 md:p-8 text-left transition-transform hover:-translate-y-2 hover:border-green-500/30">
                <div className="inline-block px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] md:text-[10px] tracking-widest uppercase mb-2 md:mb-6 font-bold">Biology</div>
                <p className="text-white text-xs md:text-lg font-medium mb-2 md:mb-6 leading-snug">What is the powerhouse of the cell?</p>
                <div className="space-y-1.5 md:space-y-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl py-1.5 px-2 md:py-3.5 md:px-5 text-white/50 text-xs md:text-sm">Nucleus</div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl py-1.5 px-2 md:py-3.5 md:px-5 text-green-400 text-xs md:text-sm font-medium flex justify-between items-center shadow-[0_0_15px_rgba(34,197,94,0.1)]">Mitochondria <span>✓</span></div>
                </div>
              </div>
              <div className="glass-card rounded-2xl md:rounded-3xl p-3 md:p-8 text-left transition-transform hover:-translate-y-2 hover:border-blue-500/30">
                <div className="inline-block px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] md:text-[10px] tracking-widest uppercase mb-2 md:mb-6 font-bold">Physics</div>
                <p className="text-white text-xs md:text-lg font-medium mb-2 md:mb-6 leading-snug">What is the SI unit of force?</p>
                <div className="space-y-1.5 md:space-y-3">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl py-1.5 px-2 md:py-3.5 md:px-5 text-blue-400 text-xs md:text-sm font-medium flex justify-between items-center shadow-[0_0_15px_rgba(59,130,246,0.1)]">Newton <span>✓</span></div>
                  <div className="bg-white/5 border border-white/10 rounded-xl py-1.5 px-2 md:py-3.5 md:px-5 text-white/50 text-xs md:text-sm">Joule</div>
                </div>
              </div>
              <div className="glass-card rounded-2xl md:rounded-3xl p-3 md:p-8 text-left transition-transform hover:-translate-y-2 hover:border-purple-500/30">
                <div className="inline-block px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] md:text-[10px] tracking-widest uppercase mb-2 md:mb-6 font-bold">Mathematics</div>
                <p className="text-white text-xs md:text-lg font-medium mb-2 md:mb-6 leading-snug">What is the value of sin(90°)?</p>
                <div className="space-y-1.5 md:space-y-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl py-1.5 px-2 md:py-3.5 md:px-5 text-white/50 text-xs md:text-sm">0</div>
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl py-1.5 px-2 md:py-3.5 md:px-5 text-purple-400 text-xs md:text-sm font-medium flex justify-between items-center shadow-[0_0_15px_rgba(168,85,247,0.1)]">1 <span>✓</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. BLITZ AI */}
        <section data-scene="4" className={`scene-wrapper ${activeScene === 4 ? 'scene-active' : 'hidden'}`}>
          <div className="scene-inner text-center flex flex-col items-center justify-center gap-6 md:gap-10 max-w-4xl px-4">
            <div className="space-y-2 md:space-y-4">
              <p className="scene-text delay-1 eyebrow">{lang === 'en' ? "A personal tutor that doesn't get angry at you" : 'ایک ذاتی ٹیوٹر جو آپ پر غصہ نہیں کرتا'}</p>
              <h2 className={`scene-text delay-2 text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1] ${lang === 'ur' ? 'urdu-text' : ''}`}>
                {lang === 'en' ? 'Meet Blitz. Your AI tutor trained on every Matric and FSc exam.' : 'بلٹز سے ملو، تمہارا AI ٹیوٹر جو میٹرک اور ایف ایس سی کے ہر امتحان پر تیار ہے۔'}
              </h2>
            </div>
            
            <div className="scene-text delay-4 w-full max-w-2xl glass-card rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 text-left relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#BFFF00] to-transparent opacity-30"></div>
              
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#BFFF00]/10 border border-[#BFFF00]/20 flex items-center justify-center text-sm md:text-lg shadow-[0_0_15px_rgba(191,255,0,0.1)]">⚡</div>
                  <p className="text-white font-semibold text-xs md:text-sm">Blitz AI</p>
                </div>
                <div className="flex gap-1 md:gap-2 bg-white/5 p-1 rounded-full border border-white/10">
                  <button onClick={() => setChatLang('en')} className={`text-[8px] md:text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 md:px-4 md:py-1.5 rounded-full transition-all ${chatLang === 'en' ? 'bg-[#BFFF00] text-[#041a0e] shadow-[0_0_10px_rgba(191,255,0,0.3)]' : 'text-white/40 hover:text-white'}`}>ENG</button>
                  <button onClick={() => setChatLang('ur')} className={`text-[8px] md:text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 md:px-4 md:py-1.5 rounded-full transition-all ${chatLang === 'ur' ? 'bg-[#BFFF00] text-[#041a0e] shadow-[0_0_10px_rgba(191,255,0,0.3)]' : 'text-white/40 hover:text-white'}`}>URDU</button>
                </div>
              </div>

              <div className="space-y-4 md:space-y-5">
                <div className="flex justify-end chat-bubble">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tr-sm py-2 px-4 md:py-3 md:px-5 text-white/80 text-xs md:text-sm max-w-[85%]">
                    {chatLang === 'en' ? "I don't understand Newton's third law" : "mujhe newton ka teesra law samajh nahi araha"}
                  </div>
                </div>
                <div className="flex justify-start chat-bubble">
                  <div className="bg-[#102a1c] border border-[#BFFF00]/20 rounded-2xl rounded-tl-sm py-3 px-4 md:py-4 md:px-5 text-white/95 text-xs md:text-sm max-w-[95%] md:max-w-[90%] leading-relaxed shadow-[0_0_20px_rgba(191,255,0,0.05)]">
                    {chatLang === 'en' ? "Think of it this way — when you push a wall, the wall pushes back on your hand with the same force. That's why your hand hurts! The forces are equal and opposite. 🧱" : "Socho aise — jab aap deewar ko dhakelte hain, deewar aap ke haath par usi qawat se wapas dhakelti hai. Isi liye haath dard karta hai! Qawatein barabar aur mukhalif hain. 🧱"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. THE PRICE */}
        <section data-scene="5" className={`scene-wrapper ${activeScene === 5 ? 'scene-active' : 'hidden'}`}>
          <div className="scene-inner text-center flex flex-col items-center justify-center gap-4 md:gap-6 max-w-4xl px-4">
            <p className="scene-text delay-1 eyebrow">{lang === 'en' ? 'THE PRICE' : 'قیمت'}</p>
            <p className="scene-text delay-2 crossed-price text-xl md:text-3xl font-medium text-white/30 tracking-tight">
              {lang === 'en' ? 'PKR 12,000/month' : '12,000 روپے ماہانہ'}
            </p>
            {/* PERFORMANCE/MOBILE FIX: Ensure text fits mobile screen without scrolling */}
            <h2 className={`real-price delay-3 text-5xl sm:text-6xl md:text-[100px] font-extrabold tracking-tighter text-white drop-shadow-[0_0_60px_rgba(255,255,255,0.15)] ${lang === 'ur' ? 'urdu-text' : ''}`}>
              {lang === 'en' ? 'PKR 2,000/mo' : 'صرف دو ہزار ماہانہ'}
            </h2>
            <p className={`scene-text delay-5 text-sm sm:text-base md:text-xl text-white/50 mt-2 md:mt-4 font-medium tracking-tight ${lang === 'ur' ? 'urdu-text' : ''}`}>
              {lang === 'en' ? 'All subjects. All quizzes. Blitz included. Cancel anytime.' : 'تمام مضامین۔ تمام کوئزز۔ بلٹز شامل۔ کبھی بھی بند کرو۔'}
            </p>
          </div>
        </section>

        {/* 6. INLINE DEMO PLAYER (Starry Core) */}
        <section data-scene="6" className={`scene-wrapper ${activeScene === 6 ? 'scene-active' : 'hidden'}`}>
          <div className="scene-inner text-center flex flex-col items-center justify-center gap-4 md:gap-6 max-w-6xl w-full px-2 md:px-6">
            <div className="space-y-1 md:space-y-2">
              <h2 className={`scene-text delay-2 text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-[1.1] ${lang === 'ur' ? 'urdu-text' : ''}`}>
                {lang === 'en' ? 'See what an Aghaaz lesson feels like.' : 'دیکھو آغاز کا سبق کیسا ہوتا ہے۔'}
              </h2>
            </div>
            
            <div className="scene-text delay-3 w-full mt-4 md:mt-8 flex justify-center">
              {/* PERFORMANCE FIX: Pass isActive prop so video doesn't load network requests immediately */}
              <EmbeddedDemo
                lang={lang}
                isActive={activeScene === 6}
                onComplete={() => setActiveScene(7)}
              />
            </div>
          </div>
        </section>

        {/* 7. FINAL CTA */}
        <section data-scene="7" className={`scene-wrapper ${activeScene === 7 ? 'scene-active' : 'hidden'}`}>
          <div className="scene-inner text-center flex flex-col items-center justify-center gap-8 md:gap-10 max-w-4xl px-4">
            <h2 className={`scene-text delay-1 text-5xl sm:text-6xl md:text-[100px] font-extrabold text-white tracking-tighter leading-[1.05] headline-glow ${lang === 'ur' ? 'urdu-text' : ''}`}>
              {lang === 'en' ? 'Ready to start?' : 'شروع کریں؟'}
            </h2>
            <div className="scene-text delay-2 flex flex-col items-center gap-4 md:gap-6 mt-2 md:mt-4">
              <a href="/signup" className="bg-[#BFFF00] text-[#041a0e] font-extrabold px-8 py-4 md:px-12 md:py-5 rounded-2xl hover:shadow-[0_0_50px_rgba(191,255,0,0.4)] transition-all duration-300 text-lg md:text-2xl tracking-tight transform hover:-translate-y-1 w-full sm:w-auto text-center">
                {lang === 'en' ? 'Start Learning for PKR 2,000/mo' : 'سیکھنا شروع کریں →'}
              </a>
              <a href="https://wa.me/923315319850" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/80 transition-colors font-medium text-xs md:text-sm">
                {lang === 'en' ? 'or talk to an Aghaaz rep ↗' : 'یا آغاز نمائندہ سے بات کریں ↗'}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}