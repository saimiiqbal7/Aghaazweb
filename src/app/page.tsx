'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [name, setName] = useState('');

  useEffect(() => {
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
      { threshold: 0.3 }
    );

    document.querySelectorAll('[data-scene]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

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

  const scrollToScene1 = () => {
    document
      .querySelector('[data-scene="1"]')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="relative z-10">
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
          <p className="scene-text delay-1 text-xs tracking-widest uppercase text-white/30 mb-6">
            AGHAAZ
          </p>

          <h1
            className="scene-text delay-2 gradient-text font-extrabold text-center"
            style={{ fontSize: 'clamp(36px, 7vw, 80px)' }}
          >
            Take the Aghaaz Flight
          </h1>

          <p className="scene-text delay-3 text-2xl md:text-3xl urdu-text">
            آغاز کی پرواز
          </p>

          <div className="scene-text delay-4 mt-8 flex justify-center">
            <div className="hero-input-row flex items-center gap-3">
              <input
                type="text"
                placeholder="Your first name"
                className="bg-white/5 border border-white/15 rounded-xl px-5 py-4 text-white placeholder-white/30 text-base focus:outline-none focus:border-[#BFFF00]/40 focus:ring-1 focus:ring-[#BFFF00]/20 w-48"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) scrollToScene1(); }}
              />
              <button
                onClick={scrollToScene1}
                disabled={!name.trim()}
                className={`bg-[#BFFF00] text-[#04160c] font-semibold px-8 py-4 rounded-xl transition-all ${
                  name.trim()
                    ? 'hover:shadow-[0_0_40px_rgba(191,255,0,0.2)] hover:-translate-y-0.5 cursor-pointer'
                    : 'opacity-50 pointer-events-none'
                }`}
              >
                Begin →
              </button>
            </div>
          </div>

          <div className="scene-text delay-5 mt-6">
            <a
              href="/login"
              className="text-white/30 text-sm underline underline-offset-4 hover:text-white/50 transition-colors"
            >
              Already a member? Sign in
            </a>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/20 scroll-bounce">
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
          <p className="scene-text delay-1 text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE REALITY
          </p>

          <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight">
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
          <p className="scene-text delay-1 text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE FIX
          </p>

          <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight">
            Every topic. Broken into 10-minute lessons.
          </h2>

          <p className="scene-text delay-3 text-xl md:text-2xl urdu-text">
            ہر ٹاپک۔ دس منٹ کے آسان سبق میں۔
          </p>

          <div className="scene-text delay-4 mt-10 max-w-md mx-auto space-y-4">
            <div>
              <div className="bar-long bg-white/10 rounded h-3 w-full" />
              <p className="text-white/30 text-xs mt-1">40 min lecture</p>
            </div>
            <div className="flex gap-2">
              <div className="bar-short bg-[#BFFF00] rounded h-3 w-[23%]" />
              <div className="bar-short bg-[#BFFF00] rounded h-3 w-[23%]" />
              <div className="bar-short bg-[#BFFF00] rounded h-3 w-[23%]" />
              <div className="bar-short bg-[#BFFF00] rounded h-3 w-[23%]" />
            </div>
            <p className="text-white/30 text-xs">10 min each</p>
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
        <div className="text-center max-w-[90%] md:max-w-[700px]">
          <p className="scene-text delay-1 text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE CHECK
          </p>

          <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight">
            Every lecture has a built-in quiz.
          </h2>

          <p className="scene-text delay-3 text-xl md:text-2xl urdu-text">
            ہر لیکچر کے اندر کوئز ہے۔
          </p>

          <div className="quiz-card delay-4 mt-10 max-w-[90%] md:max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 text-left">
            <p className="text-white font-medium mb-5">
              Which operator is solved first?
            </p>
            <div className="space-y-3">
              <div className="bg-white/5 border border-white/10 rounded-xl py-3 px-5 text-white/70">
                Addition
              </div>
              <div className="bg-[#BFFF00]/10 border border-[#BFFF00]/50 rounded-xl py-3 px-5 text-[#BFFF00]">
                Multiplication
              </div>
            </div>
            <p className="text-[#BFFF00] text-sm mt-4">✓ Correct!</p>
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
        <div className="text-center max-w-[90%] md:max-w-[700px]">
          <p className="scene-text delay-1 text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE BACKUP
          </p>

          <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight">
            Meet Blitz. Your AI tutor trained on every Matric and FSc exam.
          </h2>

          <p className="scene-text delay-3 text-xl md:text-2xl urdu-text">
            بلٹز سے ملو۔ تمہارا AI ٹیوٹر جو میٹرک اور ایف ایس سی کے ہر امتحان پر تیار ہے۔
          </p>

          <div className="scene-text delay-4 mt-10 max-w-[90%] md:max-w-md mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-4">
            <p className="text-[#BFFF00] text-xs tracking-wide">⚡ Blitz</p>

            <div className="flex justify-end chat-bubble">
              <div className="bg-white/10 rounded-2xl rounded-br-md py-3 px-5 text-white/90 max-w-[80%] text-sm">
                I don&apos;t understand Newton&apos;s third law
              </div>
            </div>

            <div className="flex justify-start chat-bubble">
              <div className="bg-[#0d6b3f] rounded-2xl rounded-bl-md py-3 px-5 text-white/90 max-w-[80%] text-sm">
                Think of it this way — when you push a wall, the wall pushes
                back on your hand with the same force. That&apos;s why your hand
                hurts! The forces are equal and opposite. 🧱
              </div>
            </div>

            <div className="flex justify-end chat-bubble">
              <div className="bg-white/10 rounded-2xl rounded-br-md py-3 px-5 text-white/90 max-w-[80%] text-sm">
                Oh that makes sense!
              </div>
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
          <p className="scene-text delay-1 text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-6">
            THE PRICE
          </p>

          <p className="scene-text delay-2 text-2xl md:text-4xl text-white/30 line-through decoration-white/30">
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

      <div className="scene-divider" />

      {/* ════════════════════════════════════════
          SCENE 6 — TRY IT NOW (DEMO)
          ════════════════════════════════════════ */}
      <section
        data-scene="6"
        className="min-h-screen flex items-center justify-center relative px-6"
      >
        <div className="text-center max-w-[90%] md:max-w-[900px]">
          <div className="scene-text delay-1">
            <p className="text-xs tracking-[0.3em] uppercase text-[#BFFF00]/60 mb-1">
              TRY IT NOW
            </p>
            <p className="text-sm urdu-text text-[#BFFF00]/40">
              آزما کر دیکھو
            </p>
          </div>

          <h2 className="scene-text delay-2 text-3xl md:text-5xl font-bold text-white leading-tight mt-6">
            See what an Aghaaz lesson feels like.
          </h2>

          <p className="scene-text delay-2 text-xl md:text-2xl urdu-text">
            دیکھو آغاز کا سبق کیسا ہوتا ہے۔
          </p>

          <div className="scene-text delay-3 w-full max-w-3xl mx-auto mt-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white/5 hover:bg-white/[0.07] transition-colors"
            >
              <div className="flex flex-col items-center justify-center aspect-video">
                <div className="w-16 h-16 rounded-full bg-[#BFFF00]/10 border border-[#BFFF00]/30 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#BFFF00">
                    <polygon points="8,5 20,12 8,19" />
                  </svg>
                </div>
                <p className="text-[#BFFF00] text-sm font-medium">
                  ▶ Watch a 2-minute demo lesson
                </p>
              </div>
            </a>
          </div>

          <div className="scene-text delay-4 mt-4">
            <p className="text-sm text-white/30">
              This is a real Aghaaz lesson with a built-in quiz. Try answering
              when it pops up.
            </p>
            <p className="text-sm urdu-text text-white/15">
              یہ ایک اصلی آغاز سبق ہے جس میں کوئز شامل ہے۔ جب سوال آئے تو جواب دو۔
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
          <h2 className="scene-text delay-1 text-4xl md:text-6xl font-bold text-white">
            Ready, {name || 'friend'}?
          </h2>

          <p className="scene-text delay-1 text-2xl md:text-3xl urdu-text">
            {name || 'دوست'}، تیار ہو؟
          </p>

          <div className="scene-text delay-2 mt-8">
            <div className="cta-buttons flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/signup"
                className="cta-button bg-[#BFFF00] text-[#04160c] font-semibold px-10 py-4 rounded-xl hover:shadow-[0_0_40px_rgba(191,255,0,0.2)] hover:-translate-y-0.5 transition-all text-lg"
              >
                Start Learning →
              </a>
              <a
                href="https://wa.me/923315319850"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 border border-white/15 text-white font-medium px-10 py-4 rounded-xl hover:bg-white/10 hover:border-white/25 transition-all text-lg"
              >
                Talk to an Aghaaz Rep ↗
              </a>
            </div>
          </div>

          <footer className="scene-text delay-3 pt-20">
            <p className="text-white/20 text-xs">
              Aghaaz (private) limited
            </p>
            <div className="text-white/20 text-xs mt-2 space-x-1">
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
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
