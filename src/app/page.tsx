'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [chatLang, setChatLang] = useState<'en' | 'ur'>('en');

  // Scene scroll animations
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scene-active');
            const idx = entry.target.getAttribute('data-scene');
            document.querySelectorAll('.progress-dot').forEach((dot, i) => {
              dot.classList.toggle('active', i === Number(idx));
            });
          }
        });
      },
      { threshold: isMobile ? 0.15 : 0.3 }
    );

    document.querySelectorAll('[data-scene]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Scroll effects (streaks + glow)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const streaks = document.querySelector('.star-streaks');
    const glowOrb = document.querySelector('.glow-orb');

    const onScroll = () => {
      streaks?.classList.add('is-scrolling');
      clearTimeout(timeout);
      timeout = setTimeout(() => streaks?.classList.remove('is-scrolling'), 300);

      if (glowOrb) {
        const total = document.body.scrollHeight - window.innerHeight;
        const fraction = total > 0 ? window.scrollY / total : 0;
        const zone = fraction < 0.25 ? 0 : fraction < 0.50 ? 1 : fraction < 0.75 ? 2 : 3;
        glowOrb.className = `glow-orb glow-zone-${zone}`;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-toggle Blitz chat language when Scene 4 is active
  useEffect(() => {
    const interval = setInterval(() => {
      const scene4 = document.querySelector('[data-scene="4"]');
      if (scene4 && scene4.classList.contains('scene-active')) {
        setChatLang((prev) => (prev === 'en' ? 'ur' : 'en'));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const scrollToScene1 = () => {
    document
      .querySelector('[data-scene="1"]')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
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
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className={`progress-dot${i === 0 ? ' active' : ''}`} />
        ))}
      </div>

      {/* ════════════════════════════════════════
          SCENE 0 — HERO
          ════════════════════════════════════════ */}
      <section
        data-scene="0"
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="text-center max-w-[90%] md:max-w-[700px]">
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
            The End of Boring Lectures.
          </h1>

          <div className="scene-text delay-4 mt-8">
            <button
              onClick={scrollToScene1}
              className="bg-[#BFFF00] text-[#04160c] font-semibold px-10 py-4 rounded-xl hover:shadow-[0_0_40px_rgba(191,255,0,0.2)] hover:-translate-y-0.5 transition-all text-lg"
            >
              See How It Works →
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
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="text-center max-w-[90%] md:max-w-[700px]">
          <p className="scene-text delay-1 eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE REALITY
          </p>

          <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow">
            For years, students in Pakistan have been stuck with boring
            40-minute lectures.
          </h2>

          <p className="scene-text delay-3 text-xl md:text-2xl urdu-text">
            برسوں سے پاکستان کے طلبا بورنگ لیکچرز میں پھنسے ہوئے ہیں
          </p>
        </div>
      </section>

      <div className="scene-divider" />

      {/* ════════════════════════════════════════
          SCENE 2 — 10-MINUTE LESSONS
          ════════════════════════════════════════ */}
      <section
        data-scene="2"
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="text-center max-w-[90%] md:max-w-[700px]">
          <p className="scene-text delay-1 eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE FIX
          </p>

          <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow">
            Every topic. Broken into 10-minute lessons.
          </h2>

          <p className="scene-text delay-3 text-xl md:text-2xl urdu-text">
            ہر ٹاپک۔ دس منٹ کے آسان سبق میں۔
          </p>

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
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="text-center max-w-[90%] md:max-w-[900px]">
          <p className="scene-text delay-1 eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE CHECK
          </p>

          <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow">
            Every lecture has a built-in quiz.
          </h2>

          <p className="scene-text delay-3 text-xl md:text-2xl urdu-text">
            ہر لیکچر کے اندر کوئز ہے۔
          </p>

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
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="text-center max-w-[90%] md:max-w-[900px]">
          <p className="scene-text delay-1 eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE BACKUP
          </p>

          <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow">
            Meet Blitz. Your AI tutor trained on every Matric and FSc exam.
          </h2>

          <p className="scene-text delay-3 text-xl md:text-2xl urdu-text">
            بلٹز سے ملو۔ تمہارا AI ٹیوٹر جو میٹرک اور ایف ایس سی کے ہر امتحان پر تیار ہے۔
          </p>

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
                    <div className="bg-[#0d6b3f] rounded-2xl rounded-bl-md py-3 px-5 text-white/90 max-w-[80%] text-sm">
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
                    <div className="bg-[#0d6b3f] rounded-2xl rounded-bl-md py-3 px-5 text-white/90 max-w-[80%] text-sm">
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
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="text-center max-w-[90%] md:max-w-[700px]">
          <p className="scene-text delay-1 eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE PRICE
          </p>

          <p className="scene-text delay-2 crossed-price text-2xl md:text-4xl text-white/50">
            PKR 12,000/month
          </p>

          <h2
            className="real-price delay-3 gradient-text font-bold mt-4"
            style={{ fontSize: 'clamp(40px, 8vw, 80px)' }}
          >
            PKR 2,000/month
          </h2>

          <p className="scene-text delay-4 text-2xl md:text-3xl urdu-text text-white/20">
            صرف دو ہزار ماہانہ
          </p>

          <p className="scene-text delay-5 text-lg text-white/40 mt-6">
            All subjects. All quizzes. Blitz included. Cancel anytime.
          </p>

          <p className="scene-text delay-6 text-base urdu-text text-white/15">
            تمام مضامین۔ تمام کوئزز۔ بلٹز شامل۔ کبھی بھی بند کرو۔
          </p>
        </div>
      </section>

      <div className="py-12 text-center">
        <p className="text-white/25 text-sm tracking-wide">
          Trusted by students across Rawalpindi, Islamabad & Lahore
        </p>
      </div>

      <div className="scene-divider" />

      {/* ════════════════════════════════════════
          SCENE 6 — TRY IT NOW (DEMO)
          ════════════════════════════════════════ */}
      <section
        data-scene="6"
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="text-center max-w-[90%] md:max-w-[700px]">
          <div className="scene-text delay-1">
            <p className="eyebrow text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-1">
              TRY IT NOW
            </p>
            <p className="text-sm urdu-text text-[#BFFF00]/40">
              آزما کر دیکھو
            </p>
          </div>

          <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight headline-glow mt-6">
            See what an Aghaaz lesson feels like.
          </h2>

          <p className="scene-text delay-2 text-xl md:text-2xl urdu-text">
            دیکھو آغاز کا سبق کیسا ہوتا ہے۔
          </p>

          <div className="scene-text delay-3 mt-10">
            <div className="glass-card rounded-2xl p-8 text-center">
              <p className="text-white/50 text-xs tracking-wide uppercase mb-3">Sample Lesson</p>
              <p className="text-white font-medium text-lg mb-1">Hassam Explains Binary Conversion</p>
              <p className="text-white/40 text-sm mb-6">Lesson 1 · Chapter 1 · 9th Computer Science</p>
              <a
                href="/lesson"
                className="inline-block bg-[#BFFF00] text-[#04160c] font-semibold px-10 py-4 rounded-xl hover:shadow-[0_0_40px_rgba(191,255,0,0.2)] hover:-translate-y-0.5 transition-all text-lg"
              >
                Try Aghaaz →
              </a>
              <p className="text-white/20 text-xs mt-4">
                Includes built-in quiz with AI tutor feedback
              </p>
            </div>
          </div>

          <div className="scene-text delay-4 mt-6">
            <p className="text-sm text-white/30">
              Watch a real lesson with a built-in quiz and Blitz, your AI tutor.
            </p>
            <p className="text-sm urdu-text text-white/15">
              ایک اصلی سبق دیکھو جس میں کوئز اور بلٹز AI ٹیوٹر شامل ہے۔
            </p>
          </div>
        </div>
      </section>

      <div className="scene-divider" />

      {/* ════════════════════════════════════════
          SCENE 7 — FINAL DECISION
          ════════════════════════════════════════ */}
      <section
        data-scene="7"
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="text-center max-w-[90%] md:max-w-[700px]">
          <h2 className="scene-text delay-1 text-4xl md:text-6xl font-bold text-white headline-glow">
            Ready to start?
          </h2>

          <p className="scene-text delay-1 text-2xl md:text-3xl urdu-text">
            شروع کریں؟
          </p>

          <div className="scene-text delay-2 mt-8">
            <div className="flex flex-col items-center gap-3">
              <a
                href="/signup"
                className="cta-button bg-[#BFFF00] text-[#04160c] font-semibold px-12 py-4 rounded-xl hover:shadow-[0_0_40px_rgba(191,255,0,0.2)] hover:-translate-y-0.5 transition-all text-lg"
              >
                Start Learning →
              </a>
              <a
                href="https://wa.me/923315319850"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 text-sm hover:text-white/50 transition-colors"
              >
                or talk to an Aghaaz rep ↗
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
    </main>
    </>
  );
}
